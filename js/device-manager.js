/**
 * LuxQMK Studio - Device Manager & Adaptive Capability Engine
 */
(function () {
  class DeviceManager {
    constructor() {
      this.registry = [];
      this.activeProfile = null;
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
      return !!(this.activeProfile && this.activeProfile.capabilities && this.activeProfile.capabilities[capName]);
    }

    identifyAndApply(device) {
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
      return matched;
    }

    applyProfileUI() {
      const profile = this.activeProfile;
      if (!profile) return;

      // 1. Update Hardware Info Card in Settings Tab
      const hwModel = document.getElementById('hw-keyboard-model');
      if (hwModel) hwModel.textContent = profile.name;

      const hwMcu = document.getElementById('hw-mcu-chip');
      if (hwMcu) hwMcu.textContent = profile.mcu;

      const hwVidPid = document.getElementById('hw-usb-vidpid');
      if (hwVidPid) {
        hwVidPid.textContent = profile.vendorId 
          ? 'VID: 0x' + profile.vendorId.toString(16).toUpperCase().padStart(4, '0') + ' | PID: 0x' + profile.productId.toString(16).toUpperCase().padStart(4, '0')
          : 'Generic USB HID';
      }

      const hwMatrix = document.getElementById('hw-matrix-layout');
      if (hwMatrix) hwMatrix.textContent = profile.matrix;

      // 2. Adapt Rotary Encoder UI visibility
      const encoderSection = document.getElementById('encoder-controls');
      const knobElement = document.querySelector('.rotary-knob');
      if (encoderSection) {
        encoderSection.style.display = profile.capabilities.hasRotaryEncoder ? 'block' : 'none';
      }
      if (knobElement) {
        knobElement.style.display = profile.capabilities.hasRotaryEncoder ? 'flex' : 'none';
      }

      // 3. Adapt Logo Badge LED UI visibility
      const logoCard = document.getElementById('card-logo-led');
      if (logoCard) {
        logoCard.style.display = profile.capabilities.hasLogoBadgeLed ? 'block' : 'none';
      }

      // 4. Update Header Device Label
      const deviceTitle = document.getElementById('device-title');
      if (deviceTitle) {
        deviceTitle.textContent = profile.name;
      }
    }
  }

  window.deviceManager = new DeviceManager();
})();
