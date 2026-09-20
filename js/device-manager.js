/**
 * LuxQMK Studio - Device Manager & Adaptive Capability Engine
 */
(function () {
  const STUDIO_VERSION = "1.1.0";
  const REQUIRED_FW_VERSION = { major: 0, minor: 1, patch: 2 };

  class DeviceManager {
    constructor() {
      this.registry = [];
      this.activeProfile = null;
      this.firmwareInfo = null;
      this.initRegistry();
    }

    initRegistry() {
      if (window.GMMK3_DEVICES) this.registry.push(...window.GMMK3_DEVICES);
      if (window.GMMK2_DEVICES) this.registry.push(...window.GMMK2_DEVICES);
      if (window.GENERIC_VIA_DEVICES) this.registry.push(...window.GENERIC_VIA_DEVICES);

      // Default active profile: GMMK 3 100% ANSI
      this.activeProfile = this.registry.find(function(d) { return d.id === 'gmmk3-100-ansi'; }) || this.registry[0];
    }

    getAllProfiles() {
      return this.registry;
    }

    getActiveProfile() {
      return this.activeProfile;
    }

    hasCapability(capName) {
      if (this.firmwareInfo && this.firmwareInfo.capabilities && this.firmwareInfo.capabilities[capName] !== undefined) {
        return !!this.firmwareInfo.capabilities[capName];
      }
      return !!(this.activeProfile && this.activeProfile.capabilities && this.activeProfile.capabilities[capName]);
    }

    identifyAndApply(device) {
      this.activeDevice = device || null;
      if (!device) return this.activeProfile;

      const vid = device.vendorId;
      const pid = device.productId;
      const name = (device.productName || '').toLowerCase();

      let matched = this.registry.find(function(p) { return p.vendorId === vid && p.productId === pid; });
      if (!matched) {
        if (name.includes('gmmk 3') || name.includes('gmmk3')) {
          if (name.includes('75')) matched = this.registry.find(function(p) { return p.id === 'gmmk3-75-ansi'; });
          else if (name.includes('65')) matched = this.registry.find(function(p) { return p.id === 'gmmk3-65-ansi'; });
          else matched = this.registry.find(function(p) { return p.id === 'gmmk3-100-ansi'; });
        } else if (name.includes('gmmk 2') || name.includes('gmmk2')) {
          if (name.includes('65')) matched = this.registry.find(function(p) { return p.id === 'gmmk2-65-ansi'; });
          else matched = this.registry.find(function(p) { return p.id === 'gmmk2-96-ansi'; });
        }
      }

      if (!matched) {
        matched = this.registry.find(function(p) { return p.id === 'generic-via'; }) || this.registry[0];
      }

      this.activeProfile = matched;
      this.applyProfileUI();
      this.refreshAllCanvases();
      return matched;
    }

    setProfile(profileId) {
      const p = this.registry.find(item => item.id === profileId);
      if (p) {
        this.activeProfile = p;
        this.applyProfileUI();
        this.refreshAllCanvases();
      }
    }

    loadCustomVIALayout(viaJson) {
      if (!window.LayoutEngine) return false;
      const keys = window.LayoutEngine.parseVIALayout(viaJson);
      if (keys && keys.length > 0) {
        if (!this.activeProfile) {
          this.activeProfile = Object.assign({}, this.registry[0]);
        }
        this.activeProfile.customLayout = keys;
        this.applyProfileUI();
        this.refreshAllCanvases();
        return true;
      }
      return false;
    }

    refreshAllCanvases() {
      if (window.gKeymapEditor) window.gKeymapEditor.renderKeyboard();
      if (window.gLighting) window.gLighting.renderVisualizerCanvas();
      if (window.gKeyTester) window.gKeyTester.renderTesterCanvas();
      if (window.gUI && typeof window.gUI.fitKeyboardPreviews === 'function') {
        window.gUI.fitKeyboardPreviews();
      }
    }

    setFirmwareInfo(info) {
      this.firmwareInfo = info;
      this.applyProfileUI();
    }

    applyProfileUI() {
      const profile = this.activeProfile;
      if (!profile) return;

      // 1. Update Hardware Info Card in Settings Tab
      const hwModel = document.getElementById('hw-keyboard-model');
      const realName = (this.activeDevice && this.activeDevice.productName) ? this.activeDevice.productName : profile.name;
      if (hwModel) hwModel.textContent = realName;

      const hwMcu = document.getElementById('hw-mcu-chip');
      if (hwMcu) hwMcu.textContent = profile.mcu;

      const hwVidPid = document.getElementById('hw-usb-vidpid');
      const liveVid = this.activeDevice ? this.activeDevice.vendorId : profile.vendorId;
      const livePid = this.activeDevice ? this.activeDevice.productId : profile.productId;
      if (hwVidPid) {
        hwVidPid.textContent = (liveVid !== null && liveVid !== undefined && livePid !== null && livePid !== undefined)
          ? 'VID: 0x' + liveVid.toString(16).toUpperCase().padStart(4, '0') + ' | PID: 0x' + livePid.toString(16).toUpperCase().padStart(4, '0')
          : 'Generic USB HID';
      }

      const hwMatrix = document.getElementById('hw-matrix-layout');
      if (hwMatrix) hwMatrix.textContent = profile.matrix;

      // Update Firmware & Engine information
      const hwProto = document.getElementById('hw-protocol-version');
      const hwCompat = document.getElementById('hw-compat-status');

      if (hwProto) {
        if (this.firmwareInfo && this.firmwareInfo.versionString && this.firmwareInfo.major !== undefined && (this.firmwareInfo.major > 0 || this.firmwareInfo.minor > 0 || this.firmwareInfo.patch > 0)) {
          const qmkStr = this.firmwareInfo.qmkVersion || 'QMK';
          hwProto.textContent = `LuxQMK ${this.firmwareInfo.versionString} (${qmkStr} / VIA v12)`;
        } else if (this.firmwareInfo) {
          hwProto.textContent = window.i18n ? window.i18n.t('statusFwLegacy') : 'Legacy VIA / QMK (Unknown LuxQMK version)';
        } else {
          hwProto.textContent = window.i18n ? window.i18n.t('valProtocolVersionNone') : '— (Waiting for USB connection)';
        }
      }

      if (hwCompat) {
        const i18n = window.i18n;
        if (!this.firmwareInfo) {
          hwCompat.textContent = i18n ? i18n.t('statusFwNotConnected') : '— (Waiting for device)';
          hwCompat.style.color = 'var(--text-muted, #888888)';
        } else if (this.firmwareInfo.major === 0 && this.firmwareInfo.minor === 0 && this.firmwareInfo.patch === 0) {
          hwCompat.textContent = i18n ? i18n.t('statusFwLegacy') : '⚠️ Legacy Firmware / Unknown Version';
          hwCompat.style.color = 'var(--accent-amber, #ffaa00)';
        } else {
          const fw = this.firmwareInfo;
          if (fw.major < REQUIRED_FW_VERSION.major || (fw.major === REQUIRED_FW_VERSION.major && (fw.minor < REQUIRED_FW_VERSION.minor || (fw.minor === REQUIRED_FW_VERSION.minor && fw.patch < REQUIRED_FW_VERSION.patch)))) {
            hwCompat.textContent = i18n ? i18n.t('statusFwUpdateRequired') : '⚠️ Firmware Update Required (LuxQMK v0.1.2+)';
            hwCompat.style.color = 'var(--accent-red, #ff4466)';
          } else if (fw.major > REQUIRED_FW_VERSION.major || (fw.major === REQUIRED_FW_VERSION.major && fw.minor > REQUIRED_FW_VERSION.minor)) {
            hwCompat.textContent = i18n ? i18n.t('statusFwNewer') : 'ℹ️ Newer Firmware Detected (Update Studio)';
            hwCompat.style.color = 'var(--accent-cyan, #00e5ff)';
          } else {
            hwCompat.textContent = i18n ? i18n.t('statusFwCompatible') : `✓ Fully Compatible (LuxQMK Studio v${STUDIO_VERSION})`;
            hwCompat.style.color = 'var(--accent-green, #00ff88)';
          }
        }
      }

      // 2. Adapt Rotary Encoder UI visibility (Sidebar & Canvas)
      const encoderNavBtn = document.querySelector('.nav-item-btn[data-view="encoder"]');
      const encoderSection = document.getElementById('encoder-controls');
      const knobElement = document.querySelector('.rotary-knob');
      const hasEncoder = !!(profile.capabilities && profile.capabilities.hasRotaryEncoder);
      if (encoderNavBtn) {
        encoderNavBtn.style.display = hasEncoder ? 'flex' : 'none';
      }
      if (encoderSection) {
        encoderSection.style.display = hasEncoder ? 'block' : 'none';
      }
      if (knobElement) {
        knobElement.style.display = hasEncoder ? 'flex' : 'none';
      }

      // 3. Adapt Logo Badge LED UI visibility (Lighting Sub-Tab & Cards)
      const logoTabBtn = document.querySelector('.lighting-tab-btn[data-tab="logo"]');
      const logoCard = document.getElementById('card-logo-led');
      const hasLogo = this.hasCapability('hasLogoBadgeLed') || !!(profile.capabilities && profile.capabilities.hasLogoBadgeLed);
      if (logoTabBtn) {
        logoTabBtn.style.display = hasLogo ? 'inline-flex' : 'none';
      }
      if (logoCard) {
        logoCard.style.display = hasLogo ? 'block' : 'none';
      }

      // 4. Update Header Device Label & Layout Preset Selector
      const deviceTitle = document.getElementById('device-title');
      if (deviceTitle) {
        deviceTitle.textContent = profile.name;
      }

      const layoutPresetSelect = document.getElementById('layoutPresetSelect');
      if (layoutPresetSelect && profile.id) {
        layoutPresetSelect.value = profile.id;
      }

      // 5. Update Connected Device Badge in Keymap Toolbar
      const badgeName = document.getElementById('connectedDeviceBadgeName');
      const badgeVidPid = document.getElementById('connectedDeviceBadgeVidPid');
      const badgeProto = document.getElementById('connectedDeviceBadgeProto');

      if (badgeName) {
        badgeName.textContent = realName;
      }
      if (badgeVidPid) {
        badgeVidPid.textContent = (liveVid !== null && liveVid !== undefined && livePid !== null && livePid !== undefined)
          ? 'VID: 0x' + liveVid.toString(16).toUpperCase().padStart(4, '0') + ' | PID: 0x' + livePid.toString(16).toUpperCase().padStart(4, '0')
          : 'USB HID';
      }
      if (badgeProto) {
        if (this.firmwareInfo && this.firmwareInfo.versionString && (this.firmwareInfo.major > 0 || this.firmwareInfo.minor > 0 || this.firmwareInfo.patch > 0)) {
          badgeProto.textContent = `LuxQMK v${this.firmwareInfo.versionString}`;
        } else {
          badgeProto.textContent = 'LuxQMK / VIA';
        }
      }
    }
  }

  window.deviceManager = new DeviceManager();
})();
