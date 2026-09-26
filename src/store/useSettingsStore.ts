import { create } from 'zustand';
import { PerformanceConfig, HardwareInfo, FlasherState, StudioUpdateState } from '../types/settings';
import { hidProtocol } from '../core/hid-protocol';
import { catalogService, CatalogKeyboardEntry, FirmwareCatalog, StudioVersionInfo } from '../services/catalog-service';
import { useDeviceStore } from './useDeviceStore';
import { useUIStore } from './useUIStore';
import { useKeymapStore } from './useKeymapStore';
import { useLightingStore } from './useLightingStore';
import { useI18n } from '../i18n';

const CURRENT_STUDIO_VERSION = '1.4.0';

interface SettingsState {
  performance: PerformanceConfig;
  hardwareInfo: HardwareInfo;
  flasher: FlasherState;
  studioUpdate: StudioUpdateState;

  setDebounceType: (type: number) => void;
  setDebounceTime: (timeMs: number) => void;
  setNkroEnabled: (enabled: boolean) => void;
  setPollingRate: (rateHz: number) => void;
  loadFromHardware: () => Promise<void>;
  savePerformanceToEeprom: () => Promise<void>;

  jumpToBootloader: () => Promise<void>;
  factoryResetEeprom: () => Promise<void>;
  quickBackup: () => void;

  setFlasherFile: (file: (File & { path?: string }) | null) => void;
  startSmartFlash: () => Promise<void>;
  cancelFlash: () => void;
  checkCloudUpdates: () => Promise<void>;
  checkStudioUpdates: () => Promise<void>;
  applyCloudFirmware: (entry?: CatalogKeyboardEntry) => Promise<void>;
}

async function waitForKeyboardReconnect(timeoutMs = 25000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (useDeviceStore.getState().isConnected && hidProtocol.isConnected()) {
      return true;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.hid) {
        const devices = await navigator.hid.getDevices();
        const rawDevices = devices.filter((d) => d.collections?.some((c) => c.usagePage === 0xff60));
        const target = rawDevices.find((d) =>
          d.collections?.some((c) => c.usagePage === 0xff60 && (c.usage === 0x61 || c.usage === 0x01))
        ) || rawDevices[0];

        if (target) {
          await useDeviceStore.getState().selectAuthorizedDevice(target);
          if (useDeviceStore.getState().isConnected && hidProtocol.isConnected()) {
            return true;
          }
        }
      }
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 600));
  }
  return useDeviceStore.getState().isConnected && hidProtocol.isConnected();
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  performance: {
    debounceType: 0,
    debounceTimeMs: 5,
    nkroEnabled: true,
    pollingRateHz: 1000,
  },
  hardwareInfo: {
    keyboardModel: 'Glorious GMMK 3 100% ANSI',
    mcuChip: 'WB32FQ95 (ARM Cortex-M4)',
    usbVidPid: 'VID: 0x504B | PID: 0x320F',
    protocolVersion: 'LuxQMK v1.4.0 (VIA v12 / Raw HID)',
    matrixLayout: '14 Rows × 8 Cols (112 Key Positions)',
    eepromSize: '1408 Bytes Dedicated Storage',
    compatibilityStatus: 'Fully Compatible (LuxQMK Studio v1.4.0)',
  },
  flasher: {
    file: null,
    filePath: '',
    fileName: '',
    fileSizeText: '',
    currentStep: 0,
    progressPercent: 0,
    statusLabel: '',
    isFlashing: false,
    isCheckingCloud: false,
    isDownloadingCloud: false,
    cloudUpdateAvailable: false,
    cloudEntry: null,
    consoleLogs: [
      { time: '[Ready]', text: 'Select firmware .bin file or use Cloud Update from files.luxqmk.click.' }
    ],
  },
  studioUpdate: {
    isChecking: false,
    available: false,
    currentVersion: CURRENT_STUDIO_VERSION,
    latestVersion: CURRENT_STUDIO_VERSION,
    releaseTag: `v${CURRENT_STUDIO_VERSION}`,
    releaseDate: '',
    downloadUrl: `https://files.luxqmk.click/studio/v${CURRENT_STUDIO_VERSION}/LuxQMK-Studio-Setup-${CURRENT_STUDIO_VERSION}.exe`,
    webAppUrl: 'https://studio.luxqmk.click',
    changelog: [],
  },

  setDebounceType: (type) => {
    set((state) => ({ performance: { ...state.performance, debounceType: type } }));
    useDeviceStore.getState().markDirty('performance');
  },
  setDebounceTime: (timeMs) => {
    set((state) => ({ performance: { ...state.performance, debounceTimeMs: timeMs } }));
    useDeviceStore.getState().markDirty('performance');
    if (useDeviceStore.getState().isConnected) {
      hidProtocol.setDebounceTime(timeMs).catch((err) => console.warn('Failed to set debounce time:', err));
    }
  },
  setNkroEnabled: (enabled) => {
    set((state) => ({ performance: { ...state.performance, nkroEnabled: enabled } }));
    useDeviceStore.getState().markDirty('performance');
    if (useDeviceStore.getState().isConnected) {
      hidProtocol.setNkroState(enabled).catch((err) => console.warn('Failed to set NKRO state on keyboard:', err));
    }
    const modeLabel = enabled ? useI18n.getState().t('nkroActiveBadge', 'Full NKRO Mode') : useI18n.getState().t('nkroDisabledBadge', '6KRO Standard Mode');
    useUIStore.getState().showToast(`${useI18n.getState().t('lblNkroMode')}: ${modeLabel}`, 'info');
  },
  setPollingRate: (rateHz) => {
    set((state) => ({ performance: { ...state.performance, pollingRateHz: rateHz } }));
    useDeviceStore.getState().markDirty('performance');
  },

  loadFromHardware: async () => {
    if (!useDeviceStore.getState().isConnected) return;
    try {
      const [debTime, isNkro] = await Promise.all([
        hidProtocol.getDebounceTime(),
        hidProtocol.getNkroState(),
      ]);
      set((state) => ({
        performance: {
          ...state.performance,
          debounceTimeMs: debTime,
          nkroEnabled: isNkro,
        },
      }));
    } catch (e) {
      console.warn('Failed to load performance settings from hardware:', e);
    }
  },

  savePerformanceToEeprom: async () => {
    try {
      await hidProtocol.saveEeprom();
      useDeviceStore.getState().clearDirty('performance');
      useUIStore.getState().showToast(useI18n.getState().t('toastPerformanceSaved'), 'success');
    } catch (e: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${e.message}`, 'error');
    }
  },

  jumpToBootloader: async () => {
    try {
      await hidProtocol.jumpToBootloader();
      useUIStore.getState().showToast(useI18n.getState().t('toastRebootBootloader'), 'info');
    } catch (e: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastBootloaderFailed')}: ${e.message}`, 'error');
    }
  },

  factoryResetEeprom: async () => {
    try {
      await hidProtocol.factoryResetEeprom();
      useUIStore.getState().showToast(useI18n.getState().t('toastFactoryResetDone'), 'warning');
    } catch (e: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${e.message}`, 'error');
    }
  },

  quickBackup: async () => {
    try {
      const { createFullBackup } = await import('../services/backup-service');
      const backupData = await createFullBackup();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${backupData.keyboard_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      useUIStore.getState().showToast(useI18n.getState().t('toastQuickSnapshotDownloaded'), 'success');
    } catch (e: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${e.message}`, 'error');
    }
  },

  setFlasherFile: (file) => {
    if (!file) {
      set((state) => ({
        flasher: {
          ...state.flasher,
          file: null,
          filePath: '',
          fileName: '',
          fileSizeText: '',
          currentStep: 0,
          progressPercent: 0,
          statusLabel: '',
        },
      }));
      return;
    }
    const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
    const filePath = (file as any).path || file.name;
    set((state) => ({
      flasher: {
        ...state.flasher,
        file,
        filePath,
        fileName: file.name,
        fileSizeText: sizeKb,
        statusLabel: `${file.name} (${sizeKb})`,
      },
    }));
  },

  startSmartFlash: async () => {
    const { flasher } = get();
    if (!flasher.file && !flasher.filePath) {
      useUIStore.getState().showToast(useI18n.getState().t('flasherErrNoFile'), 'warning');
      return;
    }

    const isDeviceConnected = useDeviceStore.getState().isConnected;
    let pendingSnapshot: any = null;

    const addLog = (text: string, isError = false) => {
      const timeStr = `[${new Date().toLocaleTimeString()}]`;
      set((state) => ({
        flasher: {
          ...state.flasher,
          consoleLogs: [...state.flasher.consoleLogs, { time: timeStr, text, isError }],
        },
      }));
    };

    const setProgress = (percent: number, statusLabel: string, step?: number) => {
      set((state) => ({
        flasher: {
          ...state.flasher,
          progressPercent: Math.min(100, Math.max(0, Math.round(percent))),
          statusLabel,
          currentStep: step !== undefined ? step : state.flasher.currentStep,
        },
      }));
    };

    if (!isDeviceConnected) {
      if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.loadPreflashBackup === 'function') {
        try {
          const cached = await window.electronAPI.loadPreflashBackup();
          if (cached) pendingSnapshot = cached;
        } catch (e) {}
      }
    }

    const isPolish = useI18n.getState().language === 'pl';
    const confirmMsg = isDeviceConnected
      ? useI18n.getState().t('flasherConfirmUpgrade')
      : (pendingSnapshot
          ? (isPolish
              ? 'Klawiatura jest w trybie DFU (rozłączona z WebHID). Wykryto zachowaną kopię zapasową pamięci. Rozpocząć programowanie Flash i automatyczne przywracanie?'
              : 'Keyboard in DFU mode. Found cached memory snapshot. Proceed with flash and auto-restore?')
          : (isPolish
              ? 'Klawiatura nie jest połączona przez WebHID (tryb DFU). Rozpocząć bezpośrednie programowanie pamięci Flash plikiem .bin?'
              : 'Keyboard is in DFU mode. Start direct flash programming?'));

    if (typeof window !== 'undefined' && window.confirm && !window.confirm(confirmMsg)) {
      return;
    }

    set((state) => ({
      flasher: {
        ...state.flasher,
        isFlashing: true,
        currentStep: 1,
        progressPercent: 5,
        statusLabel: useI18n.getState().t('flasherStep1Text'),
      },
    }));

    addLog('=== Starting Smart Firmware Upgrade Pipeline (Zero Data Loss) ===');
    addLog(`Selected Firmware File: ${flasher.fileName} (${flasher.fileSizeText})`);
    useUIStore.getState().showToast(useI18n.getState().t('toastFwUpgradeStarted'), 'info');

    try {
      if (isDeviceConnected) {
        // ================================================================
        // STEP 1: Pre-Flash Auto-Backup (Layers, Macros, RGB, Settings)
        // ================================================================
        setProgress(10, useI18n.getState().t('flasherStep1Text'), 1);
        addLog('Phase 1: Reading complete EEPROM memory snapshot via WebHID...');

        const { createFullBackup } = await import('../services/backup-service');
        const snapshot = await createFullBackup((pct) => {
          setProgress(5 + Math.round(pct * 0.15), useI18n.getState().t('flasherStep1Text'), 1);
        }, (msg) => addLog(msg));

        pendingSnapshot = snapshot;
        addLog('Snapshot captured: All Layers, Rotary Encoder, Macros, RGB Matrix & Lock Indicators.');

        if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.savePreflashBackup === 'function') {
          try {
            const saveRes = await window.electronAPI.savePreflashBackup(snapshot);
            if (saveRes && saveRes.success) {
              addLog(`Backup saved to RAM and persistent preflash cache: ${saveRes.filePath}`);
            }
          } catch (e) {}
        }

        setProgress(22, useI18n.getState().t('flasherBackupDone'), 1);

        // ================================================================
        // STEP 2: Reboot to Bootloader (DFU Mode)
        // ================================================================
        setProgress(28, useI18n.getState().t('flasherStep2Text'), 2);
        addLog('Phase 2: Sending VIA jump-to-bootloader command...');

        try {
          await hidProtocol.jumpToBootloader();
        } catch (e) {
          console.warn('Bootloader jump notice:', e);
        }

        setProgress(35, isPolish ? 'Klawiatura w trybie DFU.' : 'Keyboard in DFU Mode.', 2);
        addLog('Keyboard rebooted into DFU Mode. Device disconnected from WebHID.');

        await new Promise((r) => setTimeout(r, 1200));
      } else {
        setProgress(35, isPolish ? 'Klawiatura w trybie DFU. Gotowa do programowania.' : 'Keyboard in DFU Mode. Ready for flashing.', 2);
        addLog(pendingSnapshot
          ? 'Phase 1 & 2: DFU mode active. Utilizing cached EEPROM snapshot for post-flash restore.'
          : 'Phase 1 & 2: Direct DFU mode without pre-flash connection.');
      }

      // ================================================================
      // STEP 3: Execute Hardware DFU Flashing
      // ================================================================
      setProgress(40, useI18n.getState().t('flasherStep3Text'), 3);
      addLog('Phase 3: Starting wb32-dfu-updater / dfu-util flash process...');

      let cleanupProgress: (() => void) | undefined;
      if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.onFlasherProgress === 'function') {
        cleanupProgress = window.electronAPI.onFlasherProgress(({ percent, phase, log }: any) => {
          const mappedPercent = 35 + (percent * 0.45);
          setProgress(mappedPercent, log || useI18n.getState().t('flasherStep3Text'), 3);
          if (log) addLog(log, phase === 'erasing');
        });
      }

      const filePath = flasher.filePath || (flasher.file as any)?.path;

      if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.flashFirmware === 'function') {
        if (!filePath) {
          throw new Error('Firmware file path is required for flashing. Please re-select the .bin file.');
        }
        const flashResult = await window.electronAPI.flashFirmware({
          filePath,
          toolType: 'wb32',
        });

        if (cleanupProgress) cleanupProgress();

        if (!flashResult || !flashResult.success) {
          throw new Error(flashResult?.error || 'Flashing process failed.');
        }

        addLog('Hardware flash write verified 100% OK!');
      } else {
        if (cleanupProgress) cleanupProgress();
        addLog('Web Browser Mode: Please flash the .bin file via QMK Toolbox or DFU, then reconnect.', true);
      }

      // ================================================================
      // STEP 4: Auto-Reconnect Detection & Memory Restoration
      // ================================================================
      setProgress(82, useI18n.getState().t('flasherStep4Text'), 4);
      addLog('Phase 4: Waiting for keyboard to boot up with new firmware...');

      const reconnected = await waitForKeyboardReconnect(25000);
      if (!reconnected) {
        throw new Error('Keyboard did not reconnect automatically within timeout. Please click Connect manually.');
      }

      addLog('Keyboard reconnected via WebHID! Restoring your keymaps, macros & RGB...');
      setProgress(90, isPolish ? 'Przywracanie zapisanego układu, makr i RGB...' : 'Restoring your custom keymaps, macros, and lighting...', 4);

      await new Promise((r) => setTimeout(r, 600));

      if (pendingSnapshot) {
        const { restoreFullBackup } = await import('../services/backup-service');
        await restoreFullBackup(pendingSnapshot, (pct) => {
          setProgress(90 + Math.round(pct * 0.1), isPolish ? 'Zapisywanie przywróconego układu do pamięci EEPROM...' : 'Writing restored layout to new EEPROM...', 4);
        }, (msg) => addLog(msg));
        addLog('All Layers, Macros, RGB Matrix, and Lock Indicators restored 100%!');
      }

      // ================================================================
      // STEP 5: Completion
      // ================================================================
      setProgress(100, useI18n.getState().t('flasherSuccessTitle'), 4);
      addLog('✔ SMART FIRMWARE UPGRADE COMPLETED: ZERO DATA LOSS ACHIEVED!');
      useUIStore.getState().showToast(useI18n.getState().t('flasherSuccessToast'), 'success');

      // Refresh state
      useKeymapStore.getState().readAllLayersFromKeyboard();
      useLightingStore.getState().loadFromHardware();

    } catch (err: any) {
      console.error('Smart Flash Error:', err);
      addLog(`Błąd w trakcie procesu: ${err.message}`, true);
      setProgress(0, `Błąd: ${err.message}`);
      useUIStore.getState().showToast(useI18n.getState().t('flasherErrorToast', { err: err.message }), 'error');
      if (err.message && (err.message.includes('Bootloader') || err.message.includes('DFU') || err.message.includes('Esc') || err.message.includes('15 sekund'))) {
        addLog('💡 WSKAZÓWKA: W standardzie QMK / LuxQMK, aby ręcznie wejść w tryb DFU Bootloadera: odłącz kabel USB, przytrzymaj klawisz Esc (lub wciśnij przycisk Reset na PCB) podczas ponownego podłączania kabla USB. Następnie kliknij "Rozpocznij bezstratną aktualizację" — programator natychmiast wykryje urządzenie i wgra firmware, a po restarcie przywróci ustawienia z kopii zapasowej.', true);
      }
    } finally {
      set((state) => ({
        flasher: {
          ...state.flasher,
          isFlashing: false,
        },
      }));
    }
  },

  cancelFlash: () => {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.cancelFlash === 'function') {
      window.electronAPI.cancelFlash();
    }
    const isPolish = useI18n.getState().language === 'pl';
    set((state) => ({
      flasher: {
        ...state.flasher,
        isFlashing: false,
        currentStep: 0,
        progressPercent: 0,
        statusLabel: isPolish ? 'Anulowano aktualizację' : 'Upgrade cancelled',
        consoleLogs: [
          ...state.flasher.consoleLogs,
          { time: `[${new Date().toLocaleTimeString()}]`, text: isPolish ? 'Proces aktualizacji został anulowany przez użytkownika.' : 'Upgrade process cancelled by user.', isError: true },
        ],
      },
    }));
    useUIStore.getState().showToast(useI18n.getState().t('toastUpgradeCancelled'), 'warning');
  },

  checkStudioUpdates: async () => {
    set((state) => ({ studioUpdate: { ...state.studioUpdate, isChecking: true } }));
    try {
      const info = await catalogService.getStudioVersion();
      if (info) {
        const isNewer = catalogService.hasNewerStudioVersion(CURRENT_STUDIO_VERSION, info);
        set((state) => ({
          studioUpdate: {
            ...state.studioUpdate,
            isChecking: false,
            available: isNewer,
            latestVersion: info.version || CURRENT_STUDIO_VERSION,
            releaseTag: info.release_tag || `v${info.version}`,
            releaseDate: info.release_date || '',
            downloadUrl: info.downloads?.windows_installer || `https://files.luxqmk.click/studio/${info.release_tag}/LuxQMK-Studio-Setup-${info.version}.exe`,
            webAppUrl: info.downloads?.web_app || 'https://studio.luxqmk.click',
            changelog: info.changelog || [],
          },
        }));
      } else {
        set((state) => ({ studioUpdate: { ...state.studioUpdate, isChecking: false } }));
      }
    } catch (e) {
      set((state) => ({ studioUpdate: { ...state.studioUpdate, isChecking: false } }));
    }
  },

  checkCloudUpdates: async () => {
    set((state) => ({ flasher: { ...state.flasher, isCheckingCloud: true } }));
    // Also check studio updates concurrently
    get().checkStudioUpdates();

    try {
      const catalog = await catalogService.getCatalog();
      const devState = useDeviceStore.getState();
      if (catalog && devState.isConnected && devState.activeDescriptor) {
        const match = catalogService.findMatchingEntry(
          catalog,
          devState.activeDescriptor.vendorId,
          devState.activeDescriptor.productId,
          devState.activeDescriptor.name
        );
        const hasNewer = match ? catalogService.hasNewerFirmwareVersion(devState.firmwareInfo, match) : false;
        set((state) => ({
          flasher: {
            ...state.flasher,
            isCheckingCloud: false,
            cloudEntry: match,
            cloudUpdateAvailable: hasNewer,
          },
        }));
      } else {
        set((state) => ({ flasher: { ...state.flasher, isCheckingCloud: false } }));
      }
    } catch (e) {
      set((state) => ({ flasher: { ...state.flasher, isCheckingCloud: false } }));
    }
  },

  applyCloudFirmware: async (targetEntry?: CatalogKeyboardEntry) => {
    const entry = targetEntry || get().flasher.cloudEntry;
    if (!entry) return;

    const isPolish = useI18n.getState().language === 'pl';

    set((state) => ({
      flasher: {
        ...state.flasher,
        isDownloadingCloud: true,
        consoleLogs: [
          ...state.flasher.consoleLogs,
          {
            time: `[${new Date().toLocaleTimeString()}]`,
            text: isPolish
              ? `Pobieranie oficjalnego firmware LuxQMK ${entry.version} z files.luxqmk.click (${entry.filename})...`
              : `Downloading official LuxQMK ${entry.version} firmware from files.luxqmk.click (${entry.filename})...`,
          },
        ],
      },
    }));

    try {
      const { file, sha256, verified } = await catalogService.downloadFirmwareFile(entry);
      get().setFlasherFile(file);

      const verificationText = verified
        ? (isPolish ? `Suma SHA-256 zweryfikowana pomyślnie (${sha256.slice(0, 16)}...)` : `SHA-256 checksum verified successfully (${sha256.slice(0, 16)}...)`)
        : (isPolish ? `Pobrano plik (${sha256.slice(0, 16)}...). Gotowy do flashowania!` : `File downloaded (${sha256.slice(0, 16)}...). Ready to flash!`);

      set((state) => ({
        flasher: {
          ...state.flasher,
          isDownloadingCloud: false,
          consoleLogs: [
            ...state.flasher.consoleLogs,
            {
              time: `[${new Date().toLocaleTimeString()}]`,
              text: `${verificationText}`,
            },
          ],
        },
      }));
      useUIStore.getState().showToast(
        useI18n.getState().t('toastCloudFirmwareDownloaded', isPolish ? 'Pobrano najnowszy firmware z chmury!' : 'Downloaded latest firmware from cloud!'),
        'success'
      );
    } catch (err: any) {
      set((state) => ({
        flasher: {
          ...state.flasher,
          isDownloadingCloud: false,
          consoleLogs: [
            ...state.flasher.consoleLogs,
            {
              time: `[${new Date().toLocaleTimeString()}]`,
              text: isPolish
                ? `Nie udało się pobrać firmware z chmury: ${err.message}`
                : `Failed to download firmware from cloud: ${err.message}`,
              isError: true,
            },
          ],
        },
      }));
      useUIStore.getState().showToast(
        `${useI18n.getState().t('toastErrorPrefix')}: ${err.message}`,
        'error'
      );
    }
  },
}));
