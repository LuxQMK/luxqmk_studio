import { create } from 'zustand';
import { hidProtocol } from '../core/hid-protocol';
import { ALL_DEVICE_DESCRIPTORS, DeviceDescriptor, findDeviceDescriptor } from '../data/devices';
import { useUIStore } from './useUIStore';
import { useKeymapStore } from './useKeymapStore';
import { useLightingStore } from './useLightingStore';
import { useSettingsStore } from './useSettingsStore';
import { useI18n } from '../i18n';

interface DeviceState {
  isConnected: boolean;
  isConnecting: boolean;
  connectedDevice: HIDDevice | null;
  activeDescriptor: DeviceDescriptor | null;
  firmwareInfo: { major: number; minor: number; patch: number; versionString: string } | null;
  authorizedDevices: HIDDevice[];
  hasUnsavedChanges: boolean;
  dirtyModules: Set<string>;
  hostLeds: { caps: boolean; num: boolean; scroll: boolean };
  activeLayer: number;

  setActiveLayer: (layer: number) => void;
  setHostLeds: (leds: Partial<{ caps: boolean; num: boolean; scroll: boolean }>) => void;
  pollHostLeds: () => Promise<void>;
  connectDevice: () => Promise<void>;
  disconnectDevice: () => Promise<void>;
  refreshAuthorizedDevices: () => Promise<void>;
  selectAuthorizedDevice: (device: HIDDevice) => Promise<void>;
  autoConnect: () => Promise<void>;
  markDirty: (moduleId: string) => void;
  clearDirty: (moduleId?: string) => void;
  saveAllToEeprom: () => Promise<void>;
  discardAllChanges: () => Promise<void>;
}

function isRawHID(d: HIDDevice): boolean {
  if (!d || !d.collections || d.collections.length === 0) return false;
  return d.collections.some((c) => c.usagePage === 0xff60);
}

function isDedicatedRawHID(d: HIDDevice): boolean {
  if (!d || !d.collections || d.collections.length === 0) return false;
  const hasRaw = d.collections.some((c) => c.usagePage === 0xff60 && (c.usage === 0x61 || c.usage === 0x01));
  const hasOSInterface = d.collections.some((c) => c.usagePage === 0x01 || c.usagePage === 0x0c);
  return hasRaw && !hasOSInterface;
}

function isSameDevice(d1: HIDDevice, d2: HIDDevice): boolean {
  if (!d1 || !d2) return false;
  if (d1 === d2) return true;
  if (d1.vendorId !== d2.vendorId || d1.productId !== d2.productId) return false;
  const s1 = ((d1 as any).serialNumber && String((d1 as any).serialNumber).trim()) ? String((d1 as any).serialNumber).trim() : null;
  const s2 = ((d2 as any).serialNumber && String((d2 as any).serialNumber).trim()) ? String((d2 as any).serialNumber).trim() : null;
  if (s1 && s2) return s1 === s2;
  return true;
}

function filterAndDeduplicateDevices(devices: HIDDevice[]): HIDDevice[] {
  if (!Array.isArray(devices)) return [];
  const rawDevices = devices.filter((d) => isRawHID(d));
  const pool = rawDevices.length > 0 ? rawDevices : devices;

  const unique: HIDDevice[] = [];
  for (const d of pool) {
    if (!unique.some((u) => isSameDevice(u, d))) {
      unique.push(d);
    }
  }
  return unique;
}

// Global modifier state listeners for instantaneous lock LED and Fn reaction (0ms latency, 0 USB overhead)
if (typeof window !== 'undefined') {
  const updateLocksFromEvent = (e: Event) => {
    if (e && typeof (e as any).getModifierState === 'function') {
      try {
        const caps = Boolean((e as any).getModifierState('CapsLock'));
        const num = Boolean((e as any).getModifierState('NumLock'));
        const scroll = Boolean((e as any).getModifierState('ScrollLock'));
        const current = useDeviceStore.getState().hostLeds;
        if (current.caps !== caps || current.num !== num || current.scroll !== scroll) {
          useDeviceStore.getState().setHostLeds({ caps, num, scroll });
        }
      } catch (err) {}
    }
  };

  const eventList = [
    'keydown', 'keyup', 'pointermove', 'mousemove', 'pointerdown',
    'pointerup', 'mousedown', 'mouseup', 'click', 'focus', 'mouseenter'
  ];
  const opts = { capture: true, passive: true };
  eventList.forEach((evt) => {
    window.addEventListener(evt, updateLocksFromEvent, opts);
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Fn' || e.code === 'ContextMenu' || e.key === 'AltGraph' || e.key === 'F13') {
      useDeviceStore.setState({ activeLayer: 1 });
    }
  }, opts);

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'Fn' || e.code === 'ContextMenu' || e.key === 'AltGraph' || e.key === 'F13') {
      useDeviceStore.setState({ activeLayer: 0 });
    }
  }, opts);
}

const syncConnectedDeviceState = (desc: DeviceDescriptor) => {
  if (desc && desc.id) {
    useKeymapStore.getState().setPresetLayoutId(desc.id);
  }
  setTimeout(async () => {
    try {
      const fw = await hidProtocol.getFirmwareVersion();
      if (fw) {
        useDeviceStore.setState({ firmwareInfo: fw });
      }
      // 1. Sync full lighting state (RGB matrix effect, speed, color, brightness, sidelights, reactive, locks) from hardware
      await useLightingStore.getState().loadFromHardware();
      // 2. Sync full 3-layer keymap from hardware
      await useKeymapStore.getState().readAllLayersFromKeyboard();
      // 3. Sync performance & NKRO settings from hardware
      await useSettingsStore.getState().loadFromHardware();
    } catch (e) {
      console.warn('Failed to sync connected device state from hardware:', e);
    }
  }, 50);
};

export const useDeviceStore = create<DeviceState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  connectedDevice: null,
  activeDescriptor: null,
  firmwareInfo: null,
  authorizedDevices: [],
  hasUnsavedChanges: false,
  dirtyModules: new Set(),
  hostLeds: { caps: false, num: false, scroll: false },
  activeLayer: 0,

  setActiveLayer: (layer: number) => set({ activeLayer: layer }),

  setHostLeds: (patch) => {
    set((state) => ({ hostLeds: { ...state.hostLeds, ...patch } }));
  },

  pollHostLeds: async () => {
    if (hidProtocol.isConnected()) {
      try {
        const leds = await hidProtocol.getHostLeds();
        if (leds) {
          set((state) => ({ hostLeds: { ...state.hostLeds, ...leds } }));
        }
      } catch (e) {}
    }
  },

  autoConnect: async () => {
    if (typeof navigator === 'undefined' || !navigator.hid) return;
    try {
      const allDevices = await navigator.hid.getDevices();
      const rawDevices = allDevices.filter((d) => isRawHID(d));
      const devices = filterAndDeduplicateDevices(allDevices);
      set({ authorizedDevices: devices });

      if (rawDevices.length === 0) return;

      const target = rawDevices.find((d) => isDedicatedRawHID(d)) || rawDevices[0];

      if (target) {
        if (!target.opened) {
          await target.open();
        }
        hidProtocol.setDevice(target);
        const desc = findDeviceDescriptor(target.vendorId, target.productId) || ALL_DEVICE_DESCRIPTORS[0];
        set({ isConnected: true, connectedDevice: target, activeDescriptor: desc });
        syncConnectedDeviceState(desc);
      }
    } catch (e) {
      console.warn('Auto-connect warning:', e);
    }
  },

  refreshAuthorizedDevices: async () => {
    if (typeof navigator === 'undefined' || !navigator.hid) return;
    try {
      const allDevices = await navigator.hid.getDevices();
      const devices = filterAndDeduplicateDevices(allDevices);
      set({ authorizedDevices: devices });
    } catch (e) {
      console.error('Failed to get authorized devices:', e);
    }
  },

  connectDevice: async () => {
    if (typeof navigator === 'undefined' || !navigator.hid) {
      useUIStore.getState().showToast(useI18n.getState().t('toastWebHidNotSupported'), 'error');
      return;
    }

    set({ isConnecting: true });
    try {
      const filters = [
        { usagePage: 0xff60, usage: 0x61 },
        { usagePage: 0xff60 },
      ];

      const devices = await navigator.hid.requestDevice({ filters });
      if (devices && devices.length > 0) {
        const target = devices.find((d) => isDedicatedRawHID(d)) || devices.find((d) => isRawHID(d)) || devices[0];
        if (!target.opened) {
          await target.open();
        }
        hidProtocol.setDevice(target);
        const desc = findDeviceDescriptor(target.vendorId, target.productId) || ALL_DEVICE_DESCRIPTORS[0];
        
        await get().refreshAuthorizedDevices();
        set({ isConnected: true, connectedDevice: target, activeDescriptor: desc });
        syncConnectedDeviceState(desc);
        useUIStore.getState().showToast(`${useI18n.getState().t('toastConnected')}: ${desc.name}`, 'success');
      }
    } catch (err: any) {
      console.error('Device pairing error:', err);
      useUIStore.getState().showToast(err.message || useI18n.getState().t('toastConnCancelled'), 'warning');
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnectDevice: async () => {
    const dev = get().connectedDevice;
    if (dev && dev.opened) {
      try {
        await dev.close();
      } catch (e) {}
    }
    hidProtocol.setDevice(null);
    set({ isConnected: false, connectedDevice: null, activeDescriptor: null, firmwareInfo: null });
    useUIStore.getState().showToast(useI18n.getState().t('toastDeviceDisconnected'), 'info');
  },

  selectAuthorizedDevice: async (device: HIDDevice) => {
    try {
      const allDevices = await navigator.hid.getDevices();
      const target = isDedicatedRawHID(device)
        ? device
        : (allDevices.find((d) => isSameDevice(d, device) && isDedicatedRawHID(d)) ||
           allDevices.find((d) => isSameDevice(d, device) && isRawHID(d)) ||
           device);

      if (get().connectedDevice?.opened && get().connectedDevice !== target) {
        await get().connectedDevice!.close();
      }
      if (!target.opened) {
        await target.open();
      }
      hidProtocol.setDevice(target);
      const desc = findDeviceDescriptor(target.vendorId, target.productId) || ALL_DEVICE_DESCRIPTORS[0];
      set({ isConnected: true, connectedDevice: target, activeDescriptor: desc });
      syncConnectedDeviceState(desc);
      useUIStore.getState().showToast(`${useI18n.getState().t('toastSwitchedTo')}: ${desc.name}`, 'success');
    } catch (err: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${err.message}`, 'error');
    }
  },

  markDirty: (moduleId: string) => {
    set((state) => {
      const updated = new Set(state.dirtyModules);
      updated.add(moduleId);
      return { dirtyModules: updated, hasUnsavedChanges: updated.size > 0 };
    });
  },

  clearDirty: (moduleId?: string) => {
    set((state) => {
      const updated = new Set(state.dirtyModules);
      if (moduleId) {
        updated.delete(moduleId);
      } else {
        updated.clear();
      }
      return { dirtyModules: updated, hasUnsavedChanges: updated.size > 0 };
    });
  },

  saveAllToEeprom: async () => {
    try {
      await hidProtocol.saveEeprom();
      const isPerKey = useLightingStore.getState().backlight.effect >= 39 && useLightingStore.getState().backlight.effect <= 41;
      if (isPerKey) {
        await hidProtocol.savePerKeyProfileToEEPROM(useLightingStore.getState().activeProfileIndex);
      }
      await useLightingStore.getState().saveLightingToHardware();
      get().clearDirty();
      useUIStore.getState().showToast(useI18n.getState().t('toastSavedToEEPROM'), 'success');
    } catch (e: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastSaveFailed')}: ${e.message}`, 'error');
    }
  },

  discardAllChanges: async () => {
    if (!get().isConnected) {
      get().clearDirty();
      useUIStore.getState().showToast(useI18n.getState().t('toastDiscardedSuccess'), 'info');
      return;
    }
    try {
      useUIStore.getState().showToast(useI18n.getState().t('toastDiscardingChanges'), 'info');
      await useLightingStore.getState().discardLightingChanges();
      await useKeymapStore.getState().readAllLayersFromKeyboard();

      get().clearDirty();
      useUIStore.getState().showToast(useI18n.getState().t('toastDiscardedSuccess'), 'success');
    } catch (e: any) {
      console.error('Discard error:', e);
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${e.message}`, 'error');
    }
  },
}));

if (typeof navigator !== 'undefined' && navigator.hid) {
  navigator.hid.addEventListener('disconnect', (event) => {
    const current = useDeviceStore.getState().connectedDevice;
    if (current && event.device === current) {
      useDeviceStore.getState().disconnectDevice();
    } else {
      useDeviceStore.getState().refreshAuthorizedDevices();
    }
  });

  navigator.hid.addEventListener('connect', () => {
    useDeviceStore.getState().refreshAuthorizedDevices();
    if (!useDeviceStore.getState().isConnected) {
      useDeviceStore.getState().autoConnect();
    }
  });
}
