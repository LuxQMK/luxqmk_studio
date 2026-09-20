/**
 * GMMK Studio - Lighting Controller & 1:1 QMK Hardware Parity Visualizer Engine
 * Full mathematical parity with QMK quantum/rgb_matrix/animations algorithms.
 * Distinguishes single-color vs rainbow effects, exact QMK time/coordinate vectors,
 * physical key hit tracking, responsive ripple/splash/cross/nexus waves,
 * Glorious Logo LED badge preview, 20 side diffusers, and real-time hardware layer sync.
 */

(function () {
  const RGB_EFFECTS = [
    { id: 0,  name: "All Off", isRainbow: false },
    { id: 1,  name: "Solid Color", isRainbow: false },
    { id: 2,  name: "Alphas Mods", isRainbow: false },
    { id: 3,  name: "Gradient Up/Down", isRainbow: false },
    { id: 4,  name: "Gradient Left/Right", isRainbow: false },
    { id: 5,  name: "Breathing", isRainbow: false },
    { id: 6,  name: "Band Sat.", isRainbow: false },
    { id: 7,  name: "Band Val.", isRainbow: false },
    { id: 8,  name: "Pinwheel Sat.", isRainbow: false },
    { id: 9,  name: "Pinwheel Val.", isRainbow: false },
    { id: 10, name: "Spiral Sat.", isRainbow: false },
    { id: 11, name: "Spiral Val.", isRainbow: false },
    { id: 12, name: "Cycle All", isRainbow: true },
    { id: 13, name: "Cycle Left/Right (Rainbow Wave)", isRainbow: true },
    { id: 14, name: "Cycle Up/Down", isRainbow: true },
    { id: 15, name: "Rainbow Moving Chevron", isRainbow: true },
    { id: 16, name: "Cycle Out/In", isRainbow: true },
    { id: 17, name: "Cycle Out/In Dual", isRainbow: true },
    { id: 18, name: "Cycle Pinwheel", isRainbow: true },
    { id: 19, name: "Cycle Spiral", isRainbow: true },
    { id: 20, name: "Dual Beacon", isRainbow: true },
    { id: 21, name: "Rainbow Beacon", isRainbow: true },
    { id: 22, name: "Rainbow Pinwheels", isRainbow: true },
    { id: 23, name: "Raindrops", isRainbow: false },
    { id: 24, name: "Jellybean Raindrops", isRainbow: true },
    { id: 25, name: "Hue Breathing", isRainbow: false },
    { id: 26, name: "Hue Pendulum", isRainbow: false },
    { id: 27, name: "Hue Wave", isRainbow: false },
    { id: 28, name: "Pixel Rain", isRainbow: true },
    { id: 29, name: "Pixel Flow", isRainbow: true },
    { id: 30, name: "Pixel Fractal", isRainbow: true },
    { id: 31, name: "Digital Rain", isRainbow: false },
    { id: 32, name: "Riverflow", isRainbow: false },
    { id: 33, name: "Lux Wave", isRainbow: true },
    { id: 34, name: "Cycle Dynamic", isRainbow: true },
    { id: 35, name: "Gradient Cycle (Multi-Stop)", isRainbow: true },
    { id: 36, name: "Gradient Wave (Multi-Stop)", isRainbow: true },
    { id: 37, name: "Gradient Spiral (Multi-Stop)", isRainbow: true },
    { id: 38, name: "Gradient Breathe (Multi-Stop)", isRainbow: true }
  ];

  const HARDWARE_GRADIENT_PRESETS = [
    // 0: Rainbow (Classic full spectrum HSV)
    null,
    // 1: Cyberpunk: Cyan -> Hot Pink -> Neon Yellow (3-stop 33.3% equal interval)
    [
      { pos: 0, r: 0, g: 255, b: 255 },
      { pos: 85, r: 255, g: 0, b: 128 },
      { pos: 170, r: 255, g: 255, b: 0 }
    ],
    // 2: Synthwave: Deep Purple -> Magenta -> Orange -> Gold (4-stop 25% equal interval)
    [
      { pos: 0, r: 75, g: 0, b: 130 },
      { pos: 64, r: 255, g: 0, b: 128 },
      { pos: 128, r: 255, g: 100, b: 0 },
      { pos: 192, r: 255, g: 215, b: 0 }
    ],
    // 3: Sunset: Violet -> Crimson -> Amber (3-stop 33.3% equal interval)
    [
      { pos: 0, r: 45, g: 10, b: 85 },
      { pos: 85, r: 235, g: 45, b: 55 },
      { pos: 170, r: 255, g: 190, b: 40 }
    ],
    // 4: Toxic Lime: Acid Lime -> Toxic Yellow -> Radioactive Green (3-stop 33.3% equal interval)
    [
      { pos: 0, r: 166, g: 255, b: 0 },
      { pos: 85, r: 243, g: 255, b: 0 },
      { pos: 170, r: 0, g: 229, b: 58 }
    ],
    // 5: Ocean: Deep Navy -> Azure -> Aqua -> Sky Blue (4-stop 25% equal interval)
    [
      { pos: 0, r: 0, g: 20, b: 80 },
      { pos: 64, r: 0, g: 140, b: 255 },
      { pos: 128, r: 0, g: 255, b: 200 },
      { pos: 192, r: 135, g: 206, b: 250 }
    ],
    // 6: Fire & Ice: Ice Blue -> White -> Flame -> Crimson (4-stop 25% equal interval)
    [
      { pos: 0, r: 0, g: 200, b: 255 },
      { pos: 64, r: 255, g: 255, b: 255 },
      { pos: 128, r: 255, g: 80, b: 0 },
      { pos: 192, r: 180, g: 0, b: 0 }
    ],
    // 7: Pastel: Lavender -> Mint -> Peach -> Pink (4-stop 25% equal interval)
    [
      { pos: 0, r: 218, g: 182, b: 252 },
      { pos: 64, r: 168, g: 240, b: 219 },
      { pos: 128, r: 255, g: 209, b: 178 },
      { pos: 192, r: 255, g: 182, b: 193 }
    ]
  ];

  const CODE_TO_KEY_ID = {
    KeyA: "A", KeyB: "B", KeyC: "C", KeyD: "D", KeyE: "E", KeyF: "F",
    KeyG: "G", KeyH: "H", KeyI: "I", KeyJ: "J", KeyK: "K", KeyL: "L",
    KeyM: "M", KeyN: "N", KeyO: "O", KeyP: "P", KeyQ: "Q", KeyR: "R",
    KeyS: "S", KeyT: "T", KeyU: "U", KeyV: "V", KeyW: "W", KeyX: "X",
    KeyY: "Y", KeyZ: "Z",
    Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5",
    Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0",
    F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6",
    F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12",
    Escape: "ESC", Backquote: "GRV", Minus: "MINS", Equal: "EQL",
    Backspace: "BSPC", Tab: "TAB", BracketLeft: "LBRC", BracketRight: "RBRC",
    Backslash: "BSLS", CapsLock: "CAPS", Semicolon: "SCLN", Quote: "QUOT",
    Enter: "ENT", ShiftLeft: "LSFT", ShiftRight: "RSFT",
    ControlLeft: "LCTL", ControlRight: "RCTL",
    MetaLeft: "LWIN", MetaRight: "LWIN", OSLeft: "LWIN", OSRight: "LWIN",
    AltLeft: "LALT", AltRight: "RALT", AltGraph: "RALT",
    Space: "SPC", ContextMenu: "APP",
    PrintScreen: "PSCR", ScrollLock: "SCRL", Pause: "PAUS",
    Insert: "INS", Delete: "DEL", Home: "HOME", End: "END",
    PageUp: "PGUP", PageDown: "PGDN",
    ArrowLeft: "LEFT", ArrowRight: "RGHT", ArrowUp: "UP", ArrowDown: "DOWN",
    NumLock: "NUM", NumpadDivide: "PSLS", NumpadMultiply: "PAST", NumpadSubtract: "PMNS",
    NumpadAdd: "PPLS", NumpadEnter: "PENT", NumpadDecimal: "PDOT",
    Numpad0: "P0", Numpad1: "P1", Numpad2: "P2", Numpad3: "P3", Numpad4: "P4",
    Numpad5: "P5", Numpad6: "P6", Numpad7: "P7", Numpad8: "P8", Numpad9: "P9"
  };

  class LightingController {
    constructor(protocol) {
      this.protocol = protocol;
      this.activeTab = "backlight";
      this.isVisualizerRunning = false;
      this.animFrameId = null;
      this.visualizerKeys = [];
      this.sideDiffusers = [];
      this.logoBadgeEl = null;

      // Real reactive tracking
      this.hits = []; // [{ id, x, y, time, hue }]
      this.lastHitPerKey = new Map(); // keyId -> { id, x, y, time, hue }
      this.keyHeat = new Map(); // keyId -> float (0..255)
      this.lastHeatTick = performance.now();

      // Raindrops state cache
      this.raindropsCache = new Map();

      this.activeVisualizerLayer = 0; // 0 = Base, 1 = Fn, 2 = Custom
      this.isFnSimHeld = false;
      this.pollTimer = null;

      this.state = {
        rgb: {
          brightness: 255,
          effect: 13, // Default: Cycle Left/Right (Rainbow Wave)
          speed: 128,
          hs: [0, 255],
          reverse: false
        },
        custom: {
          layerLightingEnable: true,
          layerDimLevel: 128,
          layer1Color: [0, 0],     // White (Fn)
          layer2Color: [128, 255],  // Turquoise
          layer3Color: [200, 255],  // Magenta
          logoMode: 1,              // Lock indicator mode
          lockColors: {
            caps: [0, 255],         // #FF0000 (Red)
            num: [165, 255],        // #001EFF (Blue)
            scroll: [77, 255],      // #32FF00 (Lime Green)
            capsNum: [8, 255],      // #FF3200 (Orange)
            capsScroll: [43, 255],  // #FFFF00 (Yellow)
            numScroll: [137, 255],  // #00C8FF (Cyan)
            all: [0, 0]             // #FFFFFF (White)
          },
          winLockMode: 0,           // 0: Animation, 1: Off, 2: Custom Color
          winLockColor: [0, 255],   // Default Red
          winLockActive: false,     // Live Win Lock state
          reactiveEnable: false,
          reactiveMode: 1,          // Default 1: Reactive Fade
          reactiveColor: [0, 255],  // Default Red/Accent
          reactiveSpeed: 128,
          reactiveBlend: 0,         // 0: Additive Glow, 1: Solid Override
          effectDensity: 128,       // 128 = 1.0x baseline spatial density
          activeGradient: 0,
          customProfiles: [
            // Profile 1 (0): Default Cyan -> Hot Pink -> Yellow (33.3% equal intervals)
            [
              { pos: 0, r: 0, g: 255, b: 255 },
              { pos: 85, r: 255, g: 0, b: 128 },
              { pos: 170, r: 255, g: 255, b: 0 }
            ],
            // Profile 2 (1): Default Deep Purple -> Sunset Orange -> Golden Sun (33.3% equal intervals)
            [
              { pos: 0, r: 128, g: 0, b: 255 },
              { pos: 85, r: 255, g: 60, b: 0 },
              { pos: 170, r: 255, g: 215, b: 0 }
            ]
          ]
        },
        monochrome: {
          enabled: true,
          brightness: 255,
          breathing: false,
          tint: "#ffffff"
        },
        hostLeds: {
          caps: false,
          num: false,
          scroll: false
        }
      };

      this._gradientLut = null;
      this._pendingStopsProf = 0;
      this._pendingStops = null;
      this._stopsThrottleTimer = null;
      this._isSendingCustomStops = false;
      this._stopsResendNeeded = false;

      this._throttleTimers = new Map();
      this._tickBound = this._tickVisualizer.bind(this);
    }

    init() {
      this._rebuildGradientLut();
      this._populateEffectsDropdown();
      this._bindTabs();
      this._bindEvents();
      this._bindLayerVisualizerControls();
      this._bindGlobalKeyListeners();
      this.renderVisualizerCanvas();
      this.setControlsEnabled(true);
      this.updateUI();
      this.startVisualizer();
      this.startDevicePolling();
    }

    getActiveLayout() {
      const profile = window.deviceManager ? window.deviceManager.getActiveProfile() : null;
      if (window.LayoutEngine && typeof window.LayoutEngine.getLayoutForProfile === 'function') {
        return window.LayoutEngine.getLayoutForProfile(profile);
      }
      return window.GMMK3_LAYOUT || [];
    }

    renderVisualizerCanvas() {
      const containers = [
        document.getElementById("lightingKeyboardCanvas"),
        document.getElementById("studioLightingKeyboardCanvas")
      ].filter(Boolean);
      if (containers.length === 0) return;

      const profile = window.deviceManager ? window.deviceManager.getActiveProfile() : null;
      const layout = this.getActiveLayout();
      if (!layout || layout.length === 0) return;

      const bounds = window.LayoutEngine ? window.LayoutEngine.getLayoutBounds(layout) : { width: 22.5, height: 6.25 };
      const hasSidelights = !!(profile && profile.capabilities && profile.capabilities.hasSidelights);

      containers.forEach((container) => {
        container.style.setProperty("--keyboard-width-units", bounds.width);
        container.style.setProperty("--keyboard-height-units", bounds.height);
        container.style.width = `calc(${bounds.width} * var(--key-unit) + 36px)`;
        container.style.height = `calc(${bounds.height} * var(--key-unit) + 36px)`;
        container.classList.toggle("has-sidelights", hasSidelights);
        container.innerHTML = "";
      });

      this.visualizerKeys = [];
      this.sideDiffusers = [];
      this.logoBadgeEls = [];
      this.logoBadgeEl = null;

      // Determine radial animation center / origin (Exact 1:1 match with physical keyboard firmware: Key P)
      let centerX = 109;
      let centerY = 27;

      const keyP = layout.find(k => k.id === "P" || k.label === "P");
      if (keyP) {
        const pKeyW = (keyP.w !== undefined) ? keyP.w : 1;
        const pKeyH = (keyP.h !== undefined) ? keyP.h : 1;
        const pCenterX = keyP.x + (pKeyW / 2);
        const pCenterY = keyP.y + (pKeyH / 2);
        centerX = (keyP.qmkPoint && keyP.qmkPoint[0] !== undefined)
          ? keyP.qmkPoint[0]
          : Math.round((pCenterX / bounds.width) * 224);
        centerY = (keyP.qmkPoint && keyP.qmkPoint[1] !== undefined)
          ? keyP.qmkPoint[1]
          : Math.round((pCenterY / bounds.height) * 64);
      }

      // 1. Render all Keys + Logo Badge + Rotary Knob in each container
      layout.forEach((key) => {
        const keyW = (key.w !== undefined) ? key.w : 1;
        const keyH = (key.h !== undefined) ? key.h : 1;
        const keyCenterX = key.x + (keyW / 2);
        const keyCenterY = key.y + (keyH / 2);

        // QMK hardware coordinate grid uses key switch anchor positions (center of the key)
        const qmkX = (key.qmkPoint && key.qmkPoint[0] !== undefined)
          ? key.qmkPoint[0]
          : Math.round((keyCenterX / bounds.width) * 224);
        const qmkY = (key.qmkPoint && key.qmkPoint[1] !== undefined)
          ? key.qmkPoint[1]
          : Math.round((keyCenterY / bounds.height) * 64);
        const dx = qmkX - centerX;
        const dy = qmkY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const keyEls = [];

        containers.forEach((container) => {
          const keyEl = document.createElement("div");
          keyEl.className = `lighting-keycap key-group-${key.group}`;
          keyEl.id = `vis-key-${key.id}-${container.id}`;

          // Visual CSS placement uses top-left bounding box
          keyEl.style.left = `calc(${key.x} * var(--key-unit) + 18px)`;
          keyEl.style.top = `calc(${key.y} * var(--key-unit) + 18px)`;
          keyEl.style.width = `calc(${key.w} * var(--key-unit) - 4px)`;
          keyEl.style.height = `calc(${key.h} * var(--key-unit) - 4px)`;

          if (key.isLogo) {
            keyEl.classList.add("lighting-logo-badge");
            keyEl.innerHTML = "";
            this.logoBadgeEls.push(keyEl);
            if (!this.logoBadgeEl) this.logoBadgeEl = keyEl;
          } else if (key.isKnob) {
            keyEl.classList.add("lighting-knob-preview");
            keyEl.innerHTML = `<span class="l-legend"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="3" x2="12" y2="7"></line></svg></span>`;
          } else {
            keyEl.innerHTML = `<span class="l-legend">${key.label}</span>`;
          }

          // Pointer click/touch triggers live reactive hit or tab switch
          keyEl.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            if (key.isLogo) {
              this._switchTab("logo");
              return;
            }
            if (key.isKnob) {
              if (window.gUI) {
                window.gUI.switchView("encoder");
              }
              if (window.gKeymapEditor) {
                window.gKeymapEditor.selectKey({
                  type: "encoder",
                  id: "ENCODER_PRESS",
                  matrix: (key.matrix && key.matrix[0] >= 0) ? key.matrix : [11, 6],
                  direction: "Press",
                  defaultLabel: "Knob Press"
                });
              }
              return;
            }
            this.registerKeyHit(key.id, qmkX, qmkY);
          });

          container.appendChild(keyEl);
          keyEls.push(keyEl);
        });

        const keyObj = {
          id: key.id,
          matrix: key.matrix,
          x: keyCenterX,
          y: keyCenterY,
          w: keyW,
          h: keyH,
          rawX: key.x,
          rawY: key.y,
          qmkX: qmkX,
          qmkY: qmkY,
          dx: dx,
          dy: dy,
          dist: dist,
          group: key.group,
          isKnob: !!key.isKnob,
          isLogo: !!key.isLogo,
          els: keyEls,
          el: keyEls[0]
        };

        this.visualizerKeys.push(keyObj);
      });

      // 2. Render Left & Right Side Diffuser Lightbars (only if supported) in each container
      if (hasSidelights && window.GMMK3_SIDE_LEDS) {
        containers.forEach((container) => {
          const diffContainer = document.createElement("div");
          diffContainer.className = "side-diffusers-container";

          // Left side (SLED1 - SLED10)
          window.GMMK3_SIDE_LEDS.left.forEach((sled) => {
            const sEl = document.createElement("div");
            sEl.className = "side-diffuser-segment side-diffuser-left";
            sEl.style.top = `calc(${sled.y} * var(--key-unit) + 18px)`;
            diffContainer.appendChild(sEl);

            const qmkX = sled.qmkPoint ? sled.qmkPoint[0] : 0;
            const qmkY = sled.qmkPoint ? sled.qmkPoint[1] : Math.round((sled.y / bounds.height) * 64);
            const dx = qmkX - centerX;
            const dy = qmkY - centerY;
            
            let existing = this.sideDiffusers.find(sd => sd.id === sled.id);
            if (!existing) {
              existing = { id: sled.id, qmkX, qmkY, dx, dy, dist: Math.sqrt(dx * dx + dy * dy), els: [sEl], el: sEl, isLeft: true };
              this.sideDiffusers.push(existing);
            } else {
              existing.els.push(sEl);
            }
          });

          // Right side (SLED11 - SLED20)
          window.GMMK3_SIDE_LEDS.right.forEach((sled) => {
            const sEl = document.createElement("div");
            sEl.className = "side-diffuser-segment side-diffuser-right";
            sEl.style.top = `calc(${sled.y} * var(--key-unit) + 18px)`;
            sEl.style.left = `calc(${bounds.width} * var(--key-unit) + 26px)`;
            diffContainer.appendChild(sEl);

            const qmkX = sled.qmkPoint ? sled.qmkPoint[0] : 224;
            const qmkY = sled.qmkPoint ? sled.qmkPoint[1] : Math.round((sled.y / bounds.height) * 64);
            const dx = qmkX - centerX;
            const dy = qmkY - centerY;

            let existing = this.sideDiffusers.find(sd => sd.id === sled.id);
            if (!existing) {
              existing = { id: sled.id, qmkX, qmkY, dx, dy, dist: Math.sqrt(dx * dx + dy * dy), els: [sEl], el: sEl, isLeft: false };
              this.sideDiffusers.push(existing);
            } else {
              existing.els.push(sEl);
            }
          });

          container.appendChild(diffContainer);
        });
      }

      window.gUI?.fitKeyboardPreviews();
    }

    registerKeyHit(keyId, qmkX, qmkY) {
      const now = performance.now();
      const randomHue = Math.floor(Math.random() * 256);
      const hitObj = { id: keyId, x: qmkX, y: qmkY, time: now, hue: randomHue };

      this.hits.push(hitObj);
      if (this.hits.length > 16) this.hits.shift();

      this.lastHitPerKey.set(keyId, hitObj);

      // Increase heat for heatmap
      const curHeat = this.keyHeat.get(keyId) || 0;
      this.keyHeat.set(keyId, Math.min(255, curHeat + 80));

      // Visual press depression animation
      const k = this.visualizerKeys.find(item => item.id === keyId);
      if (k && k.el) {
        k.el.style.transform = "scale(0.94) translateY(2px)";
        setTimeout(() => {
          if (k.el) k.el.style.transform = "";
        }, 120);
      }
    }

    startVisualizer() {
      if (this.isVisualizerRunning) return;
      this.isVisualizerRunning = true;
      this.animFrameId = requestAnimationFrame(this._tickBound);
    }

    stopVisualizer() {
      this.isVisualizerRunning = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }

    startDevicePolling() {
      if (this.pollTimer) clearInterval(this.pollTimer);
      let pollIndex = 0;
      this.pollTimer = setInterval(async () => {
        if (!this.protocol || !this.protocol.device || !this.protocol.isConnected) return;
        // Pause polling while user is actively adjusting sliders
        if (this._throttleTimers && this._throttleTimers.size > 0) return;

        try {
          // Poll hardware state safely without USB congestion
          if (pollIndex % 2 === 0) {
            // Step A: Active Layer
            const lyr = await this.protocol.getActiveLayer();
            if (lyr !== undefined && !this.isFnSimHeld) {
              this.setVisualizerLayer(lyr);
            }
          } else {
            // Step B: Win Lock state
            const C = window.GMMK3_CONSTANTS;
            const winLockRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.WIN_LOCK_STATE);
            if (winLockRes && winLockRes[0] !== 0xFF && winLockRes[2] === C.CUSTOM_VAL.WIN_LOCK_STATE) {
              const isWinLocked = winLockRes[3] === 1;
              if (this.state.custom.winLockActive !== isWinLocked) {
                this.state.custom.winLockActive = isWinLocked;
                const chkToggle = document.getElementById("chkWinLockToggle");
                if (chkToggle) chkToggle.checked = isWinLocked;
                const badge = document.getElementById("winLockStatusBadge");
                if (badge) {
                  badge.textContent = isWinLocked ? "Zablokowany (Locked)" : "Odblokowany";
                  badge.className = isWinLocked ? "badge-pill badge-warning" : "badge-pill";
                }
              }
            }
          }
          pollIndex = (pollIndex + 1) % 10;
        } catch (e) {
          // Ignore polling errors
        }
      }, 250);
    }

    _bindGlobalKeyListeners() {
      const updateLocks = (e) => {
        if (e && typeof e.getModifierState === "function") {
          try {
            const caps = e.getModifierState("CapsLock");
            const num = e.getModifierState("NumLock");
            const scroll = e.getModifierState("ScrollLock");
            if (typeof caps === "boolean") this.state.hostLeds.caps = caps;
            if (typeof num === "boolean") this.state.hostLeds.num = num;
            if (typeof scroll === "boolean") this.state.hostLeds.scroll = scroll;
          } catch (err) {}
        }
      };

      const eventOptions = { capture: true, passive: true };
      const eventList = [
        "keydown", "keyup", "pointermove", "mousemove", "pointerdown",
        "pointerup", "mousedown", "mouseup", "click", "focus", "wheel", "mouseenter"
      ];

      eventList.forEach(evt => {
        window.addEventListener(evt, updateLocks, eventOptions);
        document.addEventListener(evt, updateLocks, eventOptions);
      });

      window.addEventListener("keydown", (e) => {
        updateLocks(e);
        // Switch layers on Fn / ContextMenu / AltGraph
        if (e.key === "Fn" || e.code === "ContextMenu" || e.key === "AltGraph" || e.key === "F13") {
          this.setVisualizerLayer(1);
        }

        // Map browser keypress to physical keyboard visualizer key hit
        const keyId = CODE_TO_KEY_ID[e.code];
        if (keyId) {
          const k = this.visualizerKeys.find(item => item.id === keyId);
          if (k) {
            this.registerKeyHit(k.id, k.qmkX, k.qmkY);
          }
        }
      }, { capture: true });

      window.addEventListener("keyup", (e) => {
        updateLocks(e);
        if (!this.isFnSimHeld && (e.key === "Fn" || e.code === "ContextMenu" || e.key === "AltGraph" || e.key === "F13")) {
          this.setVisualizerLayer(0);
        }
      }, { capture: true });
    }

    _bindLayerVisualizerControls() {
      [0, 1, 2].forEach(l => {
        document.getElementById(`btnVisLayer${l}`)?.addEventListener("click", () => {
          this.setVisualizerLayer(l);
        });
      });

      const btnHoldFn = document.getElementById("btnHoldFnSim");
      if (btnHoldFn) {
        btnHoldFn.addEventListener("pointerdown", () => {
          this.isFnSimHeld = true;
          this.setVisualizerLayer(1);
          btnHoldFn.classList.add("active");
        });
        window.addEventListener("pointerup", () => {
          if (this.isFnSimHeld) {
            this.isFnSimHeld = false;
            this.setVisualizerLayer(0);
            btnHoldFn.classList.remove("active");
          }
        });
      }
    }

    setVisualizerLayer(layer) {
      this.activeVisualizerLayer = layer;
      [0, 1, 2].forEach(l => {
        const btn = document.getElementById(`btnVisLayer${l}`);
        if (btn) btn.classList.toggle("active", l === layer);
      });
    }

    _rebuildGradientLut() {
      const presetId = this.state.custom.activeGradient;
      if (presetId === 0 || !presetId) {
        this._gradientLut = null;
        return;
      }

      let stops = null;
      if (presetId >= 1 && presetId <= 7) {
        stops = HARDWARE_GRADIENT_PRESETS[presetId];
      } else if (presetId === 8 || presetId === 9) {
        const profIdx = (presetId === 9) ? 1 : 0;
        stops = (this.state.custom.customProfiles && this.state.custom.customProfiles[profIdx]) || [
          { pos: 0, r: 0, g: 255, b: 255 },
          { pos: 85, r: 255, g: 0, b: 128 },
          { pos: 170, r: 255, g: 255, b: 0 }
        ];
      }

      if (!stops || stops.length === 0) {
        this._gradientLut = null;
        return;
      }

      const lut = new Array(256);
      const s0 = stops[0];
      const sLast = stops[stops.length - 1];
      const wrapSpan = (255 - sLast.pos) + s0.pos;

      for (let phase = 0; phase < 256; phase++) {
        let r = 255, g = 255, b = 255;
        if (phase <= s0.pos) {
          if (wrapSpan === 0) {
            r = s0.r; g = s0.g; b = s0.b;
          } else {
            const progress = (phase + (255 - sLast.pos)) / wrapSpan;
            r = Math.round(sLast.r + (s0.r - sLast.r) * progress);
            g = Math.round(sLast.g + (s0.g - sLast.g) * progress);
            b = Math.round(sLast.b + (s0.b - sLast.b) * progress);
          }
        } else if (phase >= sLast.pos) {
          if (wrapSpan === 0) {
            r = sLast.r; g = sLast.g; b = sLast.b;
          } else {
            const progress = (phase - sLast.pos) / wrapSpan;
            r = Math.round(sLast.r + (s0.r - sLast.r) * progress);
            g = Math.round(sLast.g + (s0.g - sLast.g) * progress);
            b = Math.round(sLast.b + (s0.b - sLast.b) * progress);
          }
        } else {
          for (let i = 0; i < stops.length - 1; i++) {
            const cur = stops[i];
            const next = stops[i + 1];
            if (phase >= cur.pos && phase <= next.pos) {
              const span = next.pos - cur.pos;
              const progress = span === 0 ? 0 : (phase - cur.pos) / span;
              r = Math.round(cur.r + (next.r - cur.r) * progress);
              g = Math.round(cur.g + (next.g - cur.g) * progress);
              b = Math.round(cur.b + (next.b - cur.b) * progress);
              break;
            }
          }
        }
        lut[phase] = {
          r: Math.min(255, Math.max(0, r)),
          g: Math.min(255, Math.max(0, g)),
          b: Math.min(255, Math.max(0, b))
        };
      }
      this._gradientLut = lut;
    }

    _sampleGradientRgb(presetId, phase, vScale = 1.0, sScale = 1.0) {
      phase = ((phase % 256) + 256) % 256;
      if (presetId === 0 || !presetId || !this._gradientLut) {
        return this._hsvToRgb(phase, 255 * sScale, 255 * vScale);
      }

      const col = this._gradientLut[phase];
      if (!col) {
        return this._hsvToRgb(phase, 255 * sScale, 255 * vScale);
      }

      let r = col.r;
      let g = col.g;
      let b = col.b;

      if (sScale < 0.999) {
        const gray = (r * 0.299 + g * 0.587 + b * 0.114);
        r = Math.round(gray + (r - gray) * sScale);
        g = Math.round(gray + (g - gray) * sScale);
        b = Math.round(gray + (b - gray) * sScale);
      }

      if (vScale < 0.999) {
        r = Math.round(r * vScale);
        g = Math.round(g * vScale);
        b = Math.round(b * vScale);
      }

      return {
        r: Math.min(255, Math.max(0, r)),
        g: Math.min(255, Math.max(0, g)),
        b: Math.min(255, Math.max(0, b))
      };
    }

    // --- 1:1 QMK ALGORITHM ENGINE ---
    _evalQmkEffect(effect, k, tByte, baseH, baseS, baseV, rev, now, speed) {
      let h = baseH;
      let s = baseS;
      let v = baseV;

      const spdFactor = Math.max(0.1, speed / 128);
      const density = (this.state.custom.effectDensity != null ? this.state.custom.effectDensity : 128) / 128;

      switch (effect) {
        case 0: // ALL_OFF
          return { h: 0, s: 0, v: 0 };

        case 1: // SOLID_COLOR (Exact user solid color)
          return { h: baseH, s: baseS, v: baseV };

        case 2: // ALPHAS_MODS
          if (k.group === "alpha" || k.group === "num") {
            h = baseH; s = baseS; v = baseV;
          } else {
            h = (baseH + 128) & 0xFF; s = baseS; v = baseV;
          }
          break;

        case 3: // GRADIENT_UP_DOWN: QMK: scale * (y >> 4)
          {
            const y = rev ? (64 - k.qmkY) : k.qmkY;
            const scale = Math.round((64 * speed) / 255);
            h = (baseH + Math.round(scale * (y / 16))) & 0xFF;
            s = baseS; v = baseV;
          }
          break;

        case 4: // GRADIENT_LEFT_RIGHT: QMK: scale * (x >> 4)
          {
            const x = rev ? (224 - k.qmkX) : k.qmkX;
            const scale = Math.round((64 * speed) / 255);
            h = (baseH + Math.round(scale * (x / 16))) & 0xFF;
            s = baseS; v = baseV;
          }
          break;

        case 5: // BREATHING: QMK: abs(sin(time/2) - 128) * 2 (Preserves Solid Color!)
          {
            h = baseH;
            s = baseS;
            const phase = now * 0.002 * spdFactor;
            const breath = Math.abs(Math.sin(phase));
            v = Math.round(baseV * (0.08 + 0.92 * breath));
          }
          break;

        case 6: // BAND_SAT: Modulates saturation of user's solid color
          {
            h = baseH; v = baseV;
            const t = rev ? (255 - tByte) : tByte;
            const diff = Math.abs(Math.round((k.qmkX * 228) / 256) + 28 - t);
            const band = Math.max(0, 255 - diff * 8);
            s = Math.round((baseS * band) / 255);
          }
          break;

        case 7: // BAND_VAL: Modulates brightness of user's solid color
          {
            h = baseH; s = baseS;
            const t = rev ? (255 - tByte) : tByte;
            const diff = Math.abs(Math.round((k.qmkX * 228) / 256) + 28 - t);
            const band = Math.max(0, 255 - diff * 8);
            v = Math.round((baseV * band) / 255);
          }
          break;

        case 8: // PINWHEEL_SAT: Modulates saturation of user's solid color
          {
            h = baseH; v = baseV;
            const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
            const t = rev ? (255 - tByte) : tByte;
            const val = ((angle + t) % 256 + 256) % 256;
            s = Math.round((baseS * val) / 255);
          }
          break;

        case 9: // PINWHEEL_VAL: Modulates brightness of user's solid color
          {
            h = baseH; s = baseS;
            const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
            const t = rev ? (255 - tByte) : tByte;
            const val = ((angle + t) % 256 + 256) % 256;
            v = Math.round((baseV * val) / 255);
          }
          break;

        case 10: // SPIRAL_SAT: Modulates saturation of user's solid color
          {
            h = baseH; v = baseV;
            const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
            const t = rev ? tByte : (255 - tByte);
            const val = ((k.dist * 1.5 + t - angle) % 256 + 256) % 256;
            s = Math.round((baseS * val) / 255);
          }
          break;

        case 11: // SPIRAL_VAL: Modulates brightness of user's solid color
          {
            h = baseH; s = baseS;
            const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
            const t = rev ? tByte : (255 - tByte);
            const val = ((k.dist * 1.5 + t - angle) % 256 + 256) % 256;
            v = Math.round((baseV * val) / 255);
          }
          break;

        case 12: // CYCLE_ALL (Rainbow spectrum)
          {
            const phase = ((rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 13: // CYCLE_LEFT_RIGHT (Rainbow Wave Left->Right)
          {
            const spatialX = Math.round(k.qmkX * density);
            const phase = (spatialX + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 14: // CYCLE_UP_DOWN (Rainbow Wave Top->Bottom)
          {
            const spatialY = Math.round(k.qmkY * 4 * density);
            const phase = (spatialY + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 15: // RAINBOW_MOVING_CHEVRON
          {
            const phase = (Math.round((Math.abs(k.dy) * 2 + k.qmkX) * density) + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 16: // CYCLE_OUT_IN (QMK: 3 * dist / 2 + (rev ? -time : time))
          {
            const phase = (Math.round(1.5 * k.dist * density) + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 17: // CYCLE_OUT_IN_DUAL (QMK: 3 * dist + (rev ? -time : time))
          {
            const dxDual = 56 - Math.abs(k.dx);
            const distDual = Math.sqrt(dxDual * dxDual + k.dy * k.dy);
            const phase = (Math.round(3 * distDual * density) + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 18: // CYCLE_PINWHEEL
          {
            const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
            const phase = (Math.round(angle * density) + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 19: // CYCLE_SPIRAL
          {
            const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
            const phase = (Math.round((k.dist - angle) * density) + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            h = phase; s = baseS; v = baseV;
          }
          break;

        case 20: // DUAL_BEACON
          {
            const angle = Math.atan2(k.dy, k.dx);
            const sSin = rev ? -1 : 1;
            h = (Math.round(((k.dy * Math.cos(now * 0.003 * spdFactor) + k.dx * Math.sin(now * 0.003 * spdFactor) * sSin) / 128) * 128 + 128) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, h, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            s = baseS; v = baseV;
          }
          break;

        case 21: // RAINBOW_BEACON
          {
            const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
            h = (angle * 2 + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, h, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            s = baseS; v = baseV;
          }
          break;

        case 22: // RAINBOW_PINWHEELS
          {
            const sSin = rev ? -1 : 1;
            h = (Math.round(((k.dy * 3 * Math.cos(now * 0.003 * spdFactor) + (56 - Math.abs(k.dx)) * 3 * Math.sin(now * 0.003 * spdFactor) * sSin) / 128) * 128 + 128) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, h, baseV / 255, baseS / 255), h: 0, s: 0, v: baseV };
            }
            s = baseS; v = baseV;
          }
          break;

        case 23: // RAINDROPS (SINGLE SOLID COLOR with subtle twinkling shades)
          {
            h = (baseH + this._getRaindropHueOffset(k.id, now)) & 0xFF;
            s = baseS;
            v = Math.round(baseV * this._getRaindropVal(k.id, now, spdFactor));
          }
          break;

        case 24: // JELLYBEAN_RAINDROPS (Multi-color Rainbow drops)
          {
            h = this._getJellybeanHue(k.id, now);
            const rVal = this._getRaindropVal(k.id, now, spdFactor);
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, h, (baseV * rVal) / 255), h: 0, s: 0, v: baseV };
            }
            s = 255;
            v = Math.round(baseV * rVal);
          }
          break;

        case 25: // HUE_BREATHING (Single color oscillating slightly +/- 16)
          h = (baseH + Math.round(Math.sin(now * 0.0025 * spdFactor) * 16)) & 0xFF;
          s = baseS; v = baseV;
          break;

        case 26: // HUE_PENDULUM (Single color pendulum wave across keyboard)
          {
            const xNorm = rev ? (224 - k.qmkX) : k.qmkX;
            h = (baseH + Math.round(Math.sin(now * 0.003 * spdFactor + (xNorm / 224) * Math.PI) * 16)) & 0xFF;
            s = baseS; v = baseV;
          }
          break;

        case 27: // HUE_WAVE (Single color wave delta)
          {
            const t = rev ? (255 - tByte) : tByte;
            const diff = Math.abs(k.qmkX - t);
            const wave = Math.max(0, 255 - diff * 4);
            h = (baseH + Math.round((wave / 255) * 32)) & 0xFF;
            s = baseS; v = baseV;
          }
          break;

        case 28: // PIXEL_RAIN
          h = (Math.round(k.qmkX * 3 * density) + (rev ? (255 - tByte) : tByte)) & 0xFF;
          if (this.state.custom.activeGradient > 0) {
            return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, h, baseV / 255), h: 0, s: 0, v: baseV };
          }
          s = 255; v = baseV;
          break;

        case 29: // PIXEL_FLOW
          h = (Math.round((k.qmkX * 2 + k.qmkY * 3) * density) + (rev ? tByte : (255 - tByte))) & 0xFF;
          if (this.state.custom.activeGradient > 0) {
            return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, h, baseV / 255), h: 0, s: 0, v: baseV };
          }
          s = 255; v = baseV;
          break;

        case 30: // PIXEL_FRACTAL
          h = (Math.round((k.qmkX ^ k.qmkY) * 4 * density) + (rev ? tByte : (255 - tByte))) & 0xFF;
          if (this.state.custom.activeGradient > 0) {
            return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, h, baseV / 255), h: 0, s: 0, v: baseV };
          }
          s = 255; v = baseV;
          break;

        case 31: // DIGITAL_RAIN (Matrix Green stream)
          {
            const stream = ((k.qmkX * 7 + Math.floor(now * 0.015 * spdFactor)) % 40);
            const dist = Math.abs((k.qmkY / 2) - stream);
            h = 85; // Matrix Green
            s = 255;
            v = dist < 5 ? Math.round(baseV * (1.0 - dist / 5)) : Math.round(baseV * 0.06);
          }
          break;

        case 32: // RIVERFLOW
          {
            const idx = rev ? (105 - (k.qmkX + k.qmkY) % 105) : (k.qmkX + k.qmkY) % 105;
            const rTime = Math.sin(now * 0.003 * spdFactor + idx * 0.3);
            h = baseH;
            s = baseS;
            v = Math.round(baseV * Math.abs(rTime));
          }
          break;

        case 33: // LUXQMK_WAVE
          {
            const phase = (Math.round((k.qmkX / 2) * density) + (rev ? -tByte : tByte) + baseH) & 0xFF;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255), h: 0, s: 0, v: baseV };
            }
            h = phase;
            s = 255; v = baseV;
          }
          break;

        case 34: // CYCLE_DYNAMIC
          {
            const dist = Math.sqrt(k.dx * k.dx + k.dy * k.dy);
            const phase = (rev ? (Math.round(1.5 * dist * density) - tByte) : (Math.round(1.5 * dist * density) + tByte)) + baseH;
            if (this.state.custom.activeGradient > 0) {
              return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase & 0xFF, baseV / 255), h: 0, s: 0, v: baseV };
            }
            h = phase & 0xFF;
            s = 255; v = baseV;
          }
          break;

        case 35: // CUSTOM_GRADIENT_CYCLE
          {
            const phase = (rev ? (Math.round(k.qmkX * density) - tByte) : (Math.round(k.qmkX * density) + tByte)) + baseH;
            return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase & 0xFF, baseV / 255), h: 0, s: 0, v: baseV };
          }

        case 36: // CUSTOM_GRADIENT_WAVE
          {
            const phase = (Math.round((k.qmkX / 2) * density) + (rev ? -tByte : tByte) + baseH) & 0xFF;
            return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255), h: 0, s: 0, v: baseV };
          }

        case 37: // CUSTOM_GRADIENT_SPIRAL
          {
            const dist = Math.sqrt(k.dx * k.dx + k.dy * k.dy);
            const phase = (rev ? (Math.round(1.5 * dist * density) - tByte) : (Math.round(1.5 * dist * density) + tByte)) + baseH;
            return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase & 0xFF, baseV / 255), h: 0, s: 0, v: baseV };
          }

        case 38: // CUSTOM_GRADIENT_BREATHE
          {
            const phase = tByte;
            return { rgb: this._sampleGradientRgb(this.state.custom.activeGradient, phase, baseV / 255), h: 0, s: 0, v: baseV };
          }

        default:
          {
            const w1 = Math.sin(now * 0.003 * spdFactor + (k.qmkX / 224) * 6.28 * (rev ? 1 : -1));
            const w2 = Math.cos(now * 0.0025 * spdFactor + (k.qmkY / 64) * 6.28);
            h = ((rev ? tByte : (255 - tByte)) + Math.round((w1 + w2) * 45) + k.qmkX) & 0xFF;
            s = 255; v = baseV;
          }
          break;
      }

      if (h < 0) h = (h % 256) + 256;
      return { h, s, v };
    }

    _getRaindropHueOffset(keyId, now) {
      // Subtle variations (+/- 24) for single color raindrops
      let state = this.raindropsCache.get(keyId);
      if (!state || now - state.time > 800) {
        state = { offset: Math.floor(Math.random() * 48) - 24, time: now };
        this.raindropsCache.set(keyId, state);
      }
      return state.offset;
    }

    _getJellybeanHue(keyId, now) {
      let state = this.raindropsCache.get(keyId);
      if (!state || now - state.time > 800) {
        state = { offset: Math.floor(Math.random() * 256), time: now };
        this.raindropsCache.set(keyId, state);
      }
      return state.offset;
    }

    _getRaindropVal(keyId, now, spdFactor) {
      const pseudo = (keyId.charCodeAt(0) * 17 + (keyId.charCodeAt(1) || 3) * 31) % 100;
      return 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(now * 0.004 * spdFactor + pseudo));
    }

    _isKeyProgrammedOnLayer(k, layer) {
      if (layer === 0) return true; // Base layer all keys are functional
      if (!k.matrix || k.matrix[0] < 0) return false;
      const [r, c] = k.matrix;

      // 1. Live dynamic layer data from KeymapEditor (synced from keyboard EEPROM)
      if (window.gKeymapEditor && window.gKeymapEditor.layerData && window.gKeymapEditor.layerData[layer]) {
        const kc = window.gKeymapEditor.layerData[layer].get(`${r},${c}`);
        if (kc !== undefined) {
          // 0x0000 = KC_NO, 0x0001 = KC_TRNS (transparent / pass-through) -> not active on this layer
          return kc !== 0x0000 && kc !== 0x0001;
        }
      }

      // 2. Default QMK keymaps[_FL] fallback (keymap.c)
      if (layer === 1) {
        const programmedIds = new Set([
          "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
          "O", "Z", "X", "C", "V", "LWIN", "UP", "DOWN", "LEFT", "RGHT"
        ]);
        return programmedIds.has(k.id);
      }

      return false;
    }

    _tickVisualizer(timestamp) {
      if (!this.isVisualizerRunning) return;

      // If user is on the Studio Lighting tab, yield the thread to Studio Lighting
      if (window.gStudioLighting && window.gStudioLighting.isRunning && window.gUI && window.gUI.currentView === "studio_lighting") {
        this.animFrameId = requestAnimationFrame(this._tickBound);
        return;
      }

      try {
        const now = timestamp || performance.now();
        if (!this.lastHeatTick) this.lastHeatTick = now;
        const dt = Math.max(0.001, Math.min(0.1, (now - this.lastHeatTick) * 0.001));
        this.lastHeatTick = now;

        // Expire old hits (> 2.5s)
        this.hits = this.hits.filter(h => h && Number.isFinite(h.time) && (now - h.time) < 2500);

        // Decay heat for typing heatmap
        if (this.state.rgb.effect === 31 || this.state.custom.reactiveMode === 6) {
          for (const [kId, heat] of this.keyHeat.entries()) {
            const decayed = Math.max(0, heat - dt * 60);
            if (decayed <= 0) this.keyHeat.delete(kId);
            else this.keyHeat.set(kId, decayed);
          }
        }

        const lightingType = window.deviceManager ? window.deviceManager.getLightingType() : 'rgb_matrix';

        // 1. TIER 1: NO LIGHTING (Unlit Mechanical Keycaps)
        if (lightingType === 'none') {
          for (let i = 0; i < this.visualizerKeys.length; i++) {
            const k = this.visualizerKeys[i];
            if (!k || k.isKnob) continue;
            const keyTargets = k.els || [k.el];
            for (let t = 0; t < keyTargets.length; t++) {
              const el = keyTargets[t];
              if (!el) continue;
              el.style.backgroundColor = '';
              el.style.color = '';
              el.style.boxShadow = '';
              el.style.borderColor = '';
            }
          }
          for (let i = 0; i < this.sideDiffusers.length; i++) {
            const s = this.sideDiffusers[i];
            if (!s || !s.el) continue;
            s.el.style.backgroundColor = 'transparent';
            s.el.style.boxShadow = 'none';
          }
          this.animFrameId = requestAnimationFrame(this._tickBound);
          return;
        }

        // 2. TIER 2: MONOCHROMATIC BACKLIGHT
        if (lightingType === 'monochrome') {
          const isMonoOn = this.state.monochrome ? this.state.monochrome.enabled : true;
          let monoBri = this.state.monochrome ? (this.state.monochrome.brightness / 255) : 1.0;
          if (!isMonoOn) monoBri = 0;
          if (isMonoOn && this.state.monochrome && this.state.monochrome.breathing) {
            const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * 0.003));
            monoBri *= pulse;
          }
          const tintHex = (this.state.monochrome && this.state.monochrome.tint) || '#ffffff';
          const tintRgb = this._hexToRgb(tintHex) || { r: 255, g: 255, b: 255 };
          const monoR = Math.round(tintRgb.r * monoBri);
          const monoG = Math.round(tintRgb.g * monoBri);
          const monoB = Math.round(tintRgb.b * monoBri);
          const glowAlpha = Math.min(0.8, monoBri * 0.65);
          const textColor = (monoR * 0.299 + monoG * 0.587 + monoB * 0.114) > 140 ? '#111827' : '#ffffff';

          for (let i = 0; i < this.visualizerKeys.length; i++) {
            const k = this.visualizerKeys[i];
            if (!k || k.isKnob) continue;
            const keyTargets = k.els || [k.el];
            for (let t = 0; t < keyTargets.length; t++) {
              const el = keyTargets[t];
              if (!el) continue;
              if (monoBri > 0) {
                el.style.backgroundColor = `rgb(${monoR}, ${monoG}, ${monoB})`;
                el.style.color = textColor;
                el.style.boxShadow = `0 0 10px rgba(${monoR}, ${monoG}, ${monoB}, ${glowAlpha}), inset 0 0 4px rgba(255, 255, 255, ${monoBri * 0.3})`;
                el.style.borderColor = `rgba(${monoR}, ${monoG}, ${monoB}, 0.8)`;
              } else {
                el.style.backgroundColor = '';
                el.style.color = '';
                el.style.boxShadow = '';
                el.style.borderColor = '';
              }
            }
          }
          for (let i = 0; i < this.sideDiffusers.length; i++) {
            const s = this.sideDiffusers[i];
            if (!s || !s.el) continue;
            s.el.style.backgroundColor = monoBri > 0 ? `rgb(${monoR}, ${monoG}, ${monoB})` : 'transparent';
            s.el.style.boxShadow = monoBri > 0 ? `0 0 10px rgba(${monoR}, ${monoG}, ${monoB}, ${glowAlpha})` : 'none';
          }
          this.animFrameId = requestAnimationFrame(this._tickBound);
          return;
        }

        // 3. TIER 3: RGB MATRIX ENGINE
        const speed = Math.max(10, Number(this.state.rgb.speed) || 128);
        // Exact 1:1 mathematical parity with QMK scale16by8(g_rgb_timer, rgb_matrix_config.speed / 2)
        const tByte = Math.round(now * (speed / 512)) & 0xFF;
        
        const effect = Number.isFinite(this.state.rgb.effect) ? this.state.rgb.effect : 13;
        const brightness = Math.max(0, Math.min(255, Number(this.state.rgb.brightness) || 255)) / 255;
        const baseHs = Array.isArray(this.state.rgb.hs) ? this.state.rgb.hs : [0, 255];
        const baseH = Number.isFinite(baseHs[0]) ? baseHs[0] : 0;
        const baseS = Number.isFinite(baseHs[1]) ? baseHs[1] : 255;
        const baseV = 255 * brightness;
        const rev = Boolean(this.state.rgb.reverse);

        // Layer Active Status
        const isLayerActive = (this.activeTab === "layers") || (this.activeVisualizerLayer > 0);
        const activeLyr = (this.activeTab === "layers") ? 1 : this.activeVisualizerLayer;
        const layerDim = this.state.custom.layerLightingEnable ? ((Number(this.state.custom.layerDimLevel) || 100) / 255) : 1.0;
        
        const l1Color = Array.isArray(this.state.custom.layer1Color) ? this.state.custom.layer1Color : [0, 255];
        const l2Color = Array.isArray(this.state.custom.layer2Color) ? this.state.custom.layer2Color : [128, 255];
        const layerTargetColor = (activeLyr === 2) ? l2Color : l1Color;

        // Reactive Overlay Active Status (Dual-Layer Lighting)
        const isReactiveActive = (this.state.custom.reactiveEnable || this.activeTab === "reactive") && (this.state.custom.reactiveMode !== 0);
        const rMode = Number(this.state.custom.reactiveMode) || 0;
        const rawRSpd = Number(this.state.custom.reactiveSpeed);
        const rSpd = (Number.isFinite(rawRSpd) && rawRSpd >= 10) ? rawRSpd : 128;
        const rSpdScale = Math.max(0.1, (rSpd + 1) / 128);

        const rCol = Array.isArray(this.state.custom.reactiveColor) ? this.state.custom.reactiveColor : [0, 255];
        const rColH = Number.isFinite(rCol[0]) ? rCol[0] : 0;
        const rColS = Number.isFinite(rCol[1]) ? rCol[1] : 255;
        const rBlend = Number(this.state.custom.reactiveBlend) || 0;

        // 1. Render all 105 Keys
        for (let i = 0; i < this.visualizerKeys.length; i++) {
          const k = this.visualizerKeys[i];
          if (!k || !k.el) continue;
          const res = this._evalQmkEffect(effect, k, tByte, baseH, baseS, baseV, rev, now, speed);
          let h = res.h;
          let s = res.s;
          let v = res.v;

          // --- LOGO LED SPECIFIC LOCK INDICATOR (1:1 QMK luxqmk.c) ---
          if (k.isLogo) {
            const mode = this.state.custom.logoMode; // 0: RGB, 1: Indicator (RGB idle), 2: Indicator (Off idle)
            const locks = this.state.hostLeds;
            const lockSum = (locks.caps ? 1 : 0) | (locks.num ? 2 : 0) | (locks.scroll ? 4 : 0);

            if (mode === 0) {
              // Follows main matrix animation
            } else if (mode === 1) {
              // Lock Indicator (RGB idle)
              if (lockSum > 0 || this.activeTab === "logo") {
                const lockKeys = ["", "caps", "num", "capsNum", "scroll", "capsScroll", "numScroll", "all"];
                const lk = lockKeys[lockSum || 1];
                const lockCol = this.state.custom.lockColors ? this.state.custom.lockColors[lk] : null;
                h = Array.isArray(lockCol) ? lockCol[0] : (lockCol?.h ?? 0);
                s = Array.isArray(lockCol) ? lockCol[1] : (lockCol?.s ?? 255);
                v = Math.max(70, 255 * brightness);
              } else {
                // Ambient glow in RGB idle mode when brightness > 0
                if (brightness > 0) {
                  v = Math.max(v, Math.round(40 * brightness));
                }
              }
            } else if (mode === 2) {
              // Lock Indicator (Off idle)
              if (lockSum > 0 || this.activeTab === "logo") {
                const lockKeys = ["", "caps", "num", "capsNum", "scroll", "capsScroll", "numScroll", "all"];
                const lk = lockKeys[lockSum || 1];
                const lockCol = this.state.custom.lockColors ? this.state.custom.lockColors[lk] : null;
                h = Array.isArray(lockCol) ? lockCol[0] : (lockCol?.h ?? 0);
                s = Array.isArray(lockCol) ? lockCol[1] : (lockCol?.s ?? 255);
                v = Math.max(70, 255 * brightness);
              } else {
                v = 0; // Off when no lock is active
              }
            }

            const rgb = this._hsvToRgb(h, s, v);
            const logoTargets = (k.els || [k.el]).filter(el => !el.id || !el.id.includes("studioLightingKeyboardCanvas"));
            for (let t = 0; t < logoTargets.length; t++) {
              const el = logoTargets[t];
              if (!el) continue;
              el.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
              el.style.borderColor = `rgba(255, 255, 255, ${v > 0 ? 0.7 : 0.2})`;
              el.style.boxShadow = v > 0
                ? `0 0 14px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95), 0 0 4px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8), inset 0 0 3px rgba(255, 255, 255, 0.6)`
                : `inset 0 0 3px rgba(0, 0, 0, 0.8)`;
            }
            continue;
          }

          // --- ROTARY KNOB ENCODER (Mechanical wheel without RGB matrix LED) ---
          if (k.isKnob) {
            continue;
          }

          // Base Background Color
          let curRgb = res.rgb ? res.rgb : this._hsvToRgb(h, s, v);

          // --- DUAL-LAYER LIGHTING: REACTIVE OVERLAY (1:1 QMK luxqmk.c) ---
          if (isReactiveActive) {
            let reactiveIntensity = 0;
            let reactiveH = rColH;
            let reactiveS = rColS;

            switch (rMode) {
              case 1: { // REACTIVE_MODE_FADE
                const hit = this.lastHitPerKey.get(k.id);
                if (hit && Number.isFinite(hit.time)) {
                  const elapsedSec = (now - hit.time) / 1000;
                  const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 3.0));
                  if (tick < 255) {
                    reactiveIntensity = 255 - tick;
                  }
                }
                break;
              }

              case 2: { // REACTIVE_MODE_SPLASH
                let sumInt = 0;
                for (let j = 0; j < this.hits.length; j++) {
                  const hit = this.hits[j];
                  if (!hit || !Number.isFinite(hit.time)) continue;
                  const dx = k.qmkX - hit.x;
                  const dy = k.qmkY - hit.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const elapsedSec = (now - hit.time) / 1000;
                  const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 3.5));
                  const eff = tick - dist;
                  if (eff >= 0 && eff < 28 && tick < 255) {
                    sumInt = Math.min(255, sumInt + Math.floor((28 - eff) * (255 - tick) / 28));
                  }
                }
                reactiveIntensity = sumInt;
                break;
              }

              case 3: { // REACTIVE_MODE_SPLASH_RAINBOW
                let sumInt = 0;
                for (let j = 0; j < this.hits.length; j++) {
                  const hit = this.hits[j];
                  if (!hit || !Number.isFinite(hit.time)) continue;
                  const dx = k.qmkX - hit.x;
                  const dy = k.qmkY - hit.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const elapsedSec = (now - hit.time) / 1000;
                  const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 3.5));
                  const eff = tick - dist;
                  if (eff >= 0 && eff < 28 && tick < 255) {
                    sumInt = Math.min(255, sumInt + Math.floor((28 - eff) * (255 - tick) / 28));
                    reactiveH = (dist + tick) & 0xFF;
                    reactiveS = 255;
                  }
                }
                reactiveIntensity = sumInt;
                break;
              }

              case 4: { // REACTIVE_MODE_CROSS
                let sumInt = 0;
                for (let j = 0; j < this.hits.length; j++) {
                  const hit = this.hits[j];
                  if (!hit || !Number.isFinite(hit.time)) continue;
                  const dx = Math.abs(k.qmkX - hit.x);
                  const dy = Math.abs(k.qmkY - hit.y);
                  const elapsedSec = (now - hit.time) / 1000;
                  const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 3.0));
                  if (tick < 255) {
                    if (dx < 10) {
                      const eff = tick - dy;
                      if (eff >= 0 && eff < 24) {
                        sumInt = Math.min(255, sumInt + Math.floor((24 - eff) * (255 - tick) / 24));
                      }
                    }
                    if (dy < 10) {
                      const eff = tick - dx;
                      if (eff >= 0 && eff < 24) {
                        sumInt = Math.min(255, sumInt + Math.floor((24 - eff) * (255 - tick) / 24));
                      }
                    }
                  }
                }
                reactiveIntensity = sumInt;
                break;
              }

              case 5: { // REACTIVE_MODE_NEXUS (Diagonal X burst)
                let sumInt = 0;
                for (let j = 0; j < this.hits.length; j++) {
                  const hit = this.hits[j];
                  if (!hit || !Number.isFinite(hit.time)) continue;
                  const dx = Math.abs(k.qmkX - hit.x);
                  const dy = Math.abs(k.qmkY - hit.y);
                  const dist = Math.abs(dx - dy);
                  const elapsedSec = (now - hit.time) / 1000;
                  const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 2.5));
                  if (dist < 12 && tick < 255) {
                    const eff = tick - Math.floor((dx + dy) / 2);
                    if (eff >= 0 && eff < 24) {
                      sumInt = Math.min(255, sumInt + Math.floor((24 - eff) * (255 - tick) / 24));
                    }
                  }
                }
                reactiveIntensity = sumInt;
                break;
              }

              case 6: { // REACTIVE_MODE_WIDE (Wide solid expanding wave)
                let sumInt = 0;
                for (let j = 0; j < this.hits.length; j++) {
                  const hit = this.hits[j];
                  if (!hit || !Number.isFinite(hit.time)) continue;
                  const dx = k.qmkX - hit.x;
                  const dy = k.qmkY - hit.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const elapsedSec = (now - hit.time) / 1000;
                  const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 2.5));
                  const eff = tick - dist;
                  if (eff >= 0 && eff < 48 && tick < 255) {
                    sumInt = Math.min(255, sumInt + Math.floor((48 - eff) * (255 - tick) / 48));
                  }
                }
                reactiveIntensity = sumInt;
                break;
              }

              case 7: { // REACTIVE_MODE_HEATMAP
                const curHeat = this.keyHeat.get(k.id) || 0;
                if (curHeat > 0) {
                  reactiveIntensity = Math.round(curHeat);
                  reactiveH = Math.max(0, Math.round(180 - (curHeat * 180 / 255))); // Cyan -> Green -> Red
                  reactiveS = 255;
                }
                break;
              }
            }

            if (reactiveIntensity > 0) {
              const scaledVal = (reactiveIntensity * brightness) / 255;
              const rRgb = this._hsvToRgb(reactiveH, reactiveS, scaledVal * 255);

              if (rBlend === 0) {
                // Additive Glow
                curRgb = {
                  r: Math.min(255, curRgb.r + rRgb.r),
                  g: Math.min(255, curRgb.g + rRgb.g),
                  b: Math.min(255, curRgb.b + rRgb.b)
                };
              } else {
                // Solid Override Alpha Blend
                const alpha = (reactiveIntensity / 255) * brightness;
                curRgb = {
                  r: Math.round(rRgb.r * alpha + curRgb.r * (1 - alpha)),
                  g: Math.round(rRgb.g * alpha + curRgb.g * (1 - alpha)),
                  b: Math.round(rRgb.b * alpha + curRgb.b * (1 - alpha))
                };
              }
            }
          }

          // --- 1:1 HARDWARE LAYER HIGHLIGHTING & DIMMING (luxqmk.c parity) ---
          if (isLayerActive && this.state.custom.layerLightingEnable) {
            const isKeyProgrammed = this._isKeyProgrammedOnLayer(k, activeLyr);
            if (isKeyProgrammed) {
              curRgb = this._hsvToRgb(layerTargetColor[0], layerTargetColor[1], 255 * brightness);
            } else {
              curRgb = {
                r: Math.round(curRgb.r * layerDim),
                g: Math.round(curRgb.g * layerDim),
                b: Math.round(curRgb.b * layerDim)
              };
            }
          }

          // --- WIN LOCK LED INDICATOR (1:1 QMK luxqmk.c) ---
          if (k.id === "LWIN" && (this.state.custom.winLockActive || this.activeTab === "winlock") && this.state.custom.winLockMode !== 0) {
            if (this.state.custom.winLockMode === 1) {
              curRgb = { r: 0, g: 0, b: 0 };
            } else if (this.state.custom.winLockMode === 2) {
              curRgb = this._hsvToRgb(this.state.custom.winLockColor[0], this.state.custom.winLockColor[1], 255 * brightness);
            }
          }

          const rgb = curRgb;
          const avgBri = (rgb.r + rgb.g + rgb.b) / 3;
          const glowAlpha = Math.min(0.85, (avgBri / 255) * 0.75);
          const textColor = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 140 ? '#111827' : '#ffffff';

          const targets = (k.els || [k.el]).filter(el => !el.id || !el.id.includes("studioLightingKeyboardCanvas"));
          for (let t = 0; t < targets.length; t++) {
            const el = targets[t];
            if (!el) continue;
            el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
            el.style.borderColor = `rgba(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)}, 0.5)`;
            el.style.boxShadow = `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowAlpha}), inset 0 1px 0 rgba(255, 255, 255, 0.2)`;
            el.style.color = textColor;
          }
        }

        // 2. Render Left & Right Side Diffuser Segments (20 LEDs)
        for (let sIdx = 0; sIdx < this.sideDiffusers.length; sIdx++) {
          const sd = this.sideDiffusers[sIdx];
          if (!sd) continue;
          const res = this._evalQmkEffect(effect, sd, tByte, baseH, baseS, baseV, rev, now, speed);
          let v = res.v * (isLayerActive ? layerDim : 1.0);
          const rgb = res.rgb ? res.rgb : this._hsvToRgb(res.h, res.s, v);

          const sdTargets = (sd.els || [sd.el]).filter(el => !el.closest || !el.closest("#studioLightingKeyboardCanvas"));
          for (let t = 0; t < sdTargets.length; t++) {
            const el = sdTargets[t];
            if (!el) continue;
            el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
            el.style.boxShadow = `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
          }
        }

        // 3. Update Status Badge
        this._updateStatusBadge(effect, brightness, isLayerActive, activeLyr);
      } catch (err) {
        console.warn("Visualizer tick loop warning:", err);
      } finally {
        if (this.isVisualizerRunning) {
          this.animFrameId = requestAnimationFrame(this._tickBound);
        }
      }
    }

    _updateStatusBadge(effectId, brightness, isLayerActive, activeLyr) {
      const badge = document.getElementById("lightingStatusBadge");
      if (!badge) return;

      const eff = RGB_EFFECTS.find(e => e.id === effectId) || RGB_EFFECTS[13];
      const pct = Math.round(brightness * 100);

      if (isLayerActive) {
        const dimVal = Math.round((this.state.custom.layerDimLevel / 255) * 100);
        badge.innerHTML = window.i18n ? window.i18n.t("badgeLayerActive", { layer: activeLyr, dim: dimVal }) : `Layer ${activeLyr} Active • Dimming: ${dimVal}%`;
      } else if (this.activeTab === "reactive") {
        const rEffNames = ["Disabled", "Fade", "Splash Ripple", "Rainbow Splash", "Cross +", "Nexus X", "Wide Wave", "Typing Heatmap"];
        const curRMode = this.state.custom.reactiveMode || 0;
        const modeLabel = rEffNames[curRMode] || 'Active';
        badge.innerHTML = this.state.custom.reactiveEnable
          ? (window.i18n ? window.i18n.t("badgeReactiveActive", { mode: modeLabel }) : `Reactive Layer: Enabled (${modeLabel})`)
          : (window.i18n ? window.i18n.t("badgeReactiveDisabled") : `Reactive Layer: Disabled`);
      } else if (this.activeTab === "logo") {
        badge.innerHTML = window.i18n ? window.i18n.t("badgeLogoPreview") : `Logo & Knob Lock Indicator Preview`;
      } else if (this.activeTab === "winlock") {
        badge.innerHTML = window.i18n ? window.i18n.t("badgeWinLockPreview") : `Windows Key Lock Preview (Win Lock)`;
      } else {
        badge.innerHTML = window.i18n ? window.i18n.t("badgeEffectBrightness", { name: eff.name, pct }) : `${eff.name} • ${pct}% Brightness`;
      }
    }

    _hsvToRgb(hByte, sByte, vByte) {
      const normH = (((hByte % 256) + 256) % 256) / 256;
      const h = normH * 360;
      const s = Math.max(0, Math.min(255, sByte)) / 255;
      const v = Math.max(0, Math.min(255, vByte)) / 255;

      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;

      let r = 0, g = 0, b = 0;
      if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
      else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
      else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
      else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
      else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      return {
        r: Math.max(0, Math.min(255, Math.round((r + m) * 255))),
        g: Math.max(0, Math.min(255, Math.round((g + m) * 255))),
        b: Math.max(0, Math.min(255, Math.round((b + m) * 255)))
      };
    }

    _hexToRgb(hex) {
      let c = (hex || "#ffffff").replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      return {
        r: parseInt(c.substring(0, 2), 16) || 255,
        g: parseInt(c.substring(2, 4), 16) || 255,
        b: parseInt(c.substring(4, 6), 16) || 255
      };
    }

    _hexToHs(hex) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const r = parseInt(c.substring(0, 2), 16) / 255;
      const g = parseInt(c.substring(2, 4), 16) / 255;
      const b = parseInt(c.substring(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;

      let h = 0;
      const s = max === 0 ? 0 : d / max;

      if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = h * 60;
        if (h < 0) h += 360;
      }

      return [
        Math.round((h / 360) * 255),
        Math.round(s * 255)
      ];
    }

    _switchTab(tab) {
      this.activeTab = tab;
      document.querySelectorAll(".lighting-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
      document.querySelectorAll(".lighting-subview").forEach(v => v.classList.toggle("active", v.id === `lighting-tab-${tab}`));
    }

    _bindTabs() {
      document.querySelectorAll(".lighting-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this._switchTab(btn.dataset.tab);
        });
      });
      if (window.i18n && typeof window.i18n.onChange === "function") {
        window.i18n.onChange(() => {
          this.updateUI();
        });
      }
    }

    clearStaleHits() {
      this.hits = [];
      this.lastHitPerKey.clear();
      this.keyHeat.clear();
    }

    async loadFromDevice() {
      if (!this.protocol || !this.protocol.device) return;

      this.clearStaleHits();
      const C = window.GMMK3_CONSTANTS;
      try {
        // Monochrome Backlight values (if supported / Tier 2)
        try {
          const monoBriRes = await this.protocol.getBacklightValue?.(1);
          if (monoBriRes && monoBriRes[0] !== 0xFF && Number.isFinite(monoBriRes[3])) {
            if (!this.state.monochrome) this.state.monochrome = { enabled: true, brightness: 255, breathing: false, tint: '#ffffff' };
            this.state.monochrome.brightness = monoBriRes[3];
            this.state.monochrome.enabled = monoBriRes[3] > 0;
          }
        } catch (err) {}

        // 1. RGB Matrix values
        const bRes = await this.protocol.getRGBMatrixValue(C.RGB_MATRIX_VAL.BRIGHTNESS);
        if (bRes && bRes[0] !== 0xFF && Number.isFinite(bRes[3])) this.state.rgb.brightness = bRes[3];

        const eRes = await this.protocol.getRGBMatrixValue(C.RGB_MATRIX_VAL.EFFECT);
        if (eRes && eRes[0] !== 0xFF && Number.isFinite(eRes[3])) this.state.rgb.effect = eRes[3];

        const sRes = await this.protocol.getRGBMatrixValue(C.RGB_MATRIX_VAL.EFFECT_SPEED);
        if (sRes && sRes[0] !== 0xFF && Number.isFinite(sRes[3])) this.state.rgb.speed = Math.max(10, sRes[3]);

        const cRes = await this.protocol.getRGBMatrixValue(C.RGB_MATRIX_VAL.COLOR);
        if (cRes && cRes[0] !== 0xFF && Number.isFinite(cRes[3]) && Number.isFinite(cRes[4])) {
          this.state.rgb.hs = [cRes[3], cRes[4]];
        }

        // 2. Custom values
        const revRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.RGB_REVERSE);
        if (revRes && revRes[0] !== 0xFF) this.state.rgb.reverse = revRes[3] === 1;

        const lEnRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_LIGHTING_ENABLE);
        if (lEnRes && lEnRes[0] !== 0xFF) this.state.custom.layerLightingEnable = lEnRes[3] === 1;

        const lDimRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_DIM_LEVEL);
        if (lDimRes && lDimRes[0] !== 0xFF && Number.isFinite(lDimRes[3])) this.state.custom.layerDimLevel = lDimRes[3];

        const l1Res = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_1_COLOR);
        if (l1Res && l1Res[0] !== 0xFF && Number.isFinite(l1Res[3]) && Number.isFinite(l1Res[4])) {
          this.state.custom.layer1Color = [l1Res[3], l1Res[4]];
        }

        const l2Res = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_2_COLOR);
        if (l2Res && l2Res[0] !== 0xFF && Number.isFinite(l2Res[3]) && Number.isFinite(l2Res[4])) {
          this.state.custom.layer2Color = [l2Res[3], l2Res[4]];
        }

        const l3Res = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_3_COLOR);
        if (l3Res && l3Res[0] !== 0xFF && Number.isFinite(l3Res[3]) && Number.isFinite(l3Res[4])) {
          this.state.custom.layer3Color = [l3Res[3], l3Res[4]];
        }

        const logoRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_MODE);
        if (logoRes && logoRes[0] !== 0xFF && Number.isFinite(logoRes[3])) this.state.custom.logoMode = logoRes[3];

        // 7 lock indicator colors
        const capsRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_COLOR_CAPS);
        if (capsRes && capsRes[0] !== 0xFF && Number.isFinite(capsRes[3]) && Number.isFinite(capsRes[4])) {
          this.state.custom.lockColors.caps = [capsRes[3], capsRes[4]];
        }

        const numRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_COLOR_NUM);
        if (numRes && numRes[0] !== 0xFF && Number.isFinite(numRes[3]) && Number.isFinite(numRes[4])) {
          this.state.custom.lockColors.num = [numRes[3], numRes[4]];
        }

        const scrlRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_COLOR_SCROLL);
        if (scrlRes && scrlRes[0] !== 0xFF && Number.isFinite(scrlRes[3]) && Number.isFinite(scrlRes[4])) {
          this.state.custom.lockColors.scroll = [scrlRes[3], scrlRes[4]];
        }

        const capsNumRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_COLOR_CAPS_NUM);
        if (capsNumRes && capsNumRes[0] !== 0xFF && Number.isFinite(capsNumRes[3]) && Number.isFinite(capsNumRes[4])) {
          this.state.custom.lockColors.capsNum = [capsNumRes[3], capsNumRes[4]];
        }

        const capsScrlRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_COLOR_CAPS_SCROLL);
        if (capsScrlRes && capsScrlRes[0] !== 0xFF && Number.isFinite(capsScrlRes[3]) && Number.isFinite(capsScrlRes[4])) {
          this.state.custom.lockColors.capsScroll = [capsScrlRes[3], capsScrlRes[4]];
        }

        const numScrlRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_COLOR_NUM_SCROLL);
        if (numScrlRes && numScrlRes[0] !== 0xFF && Number.isFinite(numScrlRes[3]) && Number.isFinite(numScrlRes[4])) {
          this.state.custom.lockColors.numScroll = [numScrlRes[3], numScrlRes[4]];
        }

        const allRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_COLOR_ALL);
        if (allRes && allRes[0] !== 0xFF && Number.isFinite(allRes[3]) && Number.isFinite(allRes[4])) {
          this.state.custom.lockColors.all = [allRes[3], allRes[4]];
        }

        // Win Lock settings
        const winModeRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.WIN_LOCK_MODE);
        if (winModeRes && winModeRes[0] !== 0xFF && Number.isFinite(winModeRes[3])) this.state.custom.winLockMode = winModeRes[3];

        const winColRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.WIN_LOCK_COLOR);
        if (winColRes && winColRes[0] !== 0xFF && Number.isFinite(winColRes[3]) && Number.isFinite(winColRes[4])) {
          this.state.custom.winLockColor = [winColRes[3], winColRes[4]];
        }

        const winStateRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.WIN_LOCK_STATE);
        if (winStateRes && winStateRes[0] !== 0xFF) this.state.custom.winLockActive = winStateRes[3] === 1;

        // Reactive Layer overlay settings
        const rEnRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_ENABLE);
        if (rEnRes && rEnRes[0] !== 0xFF) this.state.custom.reactiveEnable = rEnRes[3] === 1;

        const rModeRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_MODE);
        if (rModeRes && rModeRes[0] !== 0xFF && Number.isFinite(rModeRes[3])) this.state.custom.reactiveMode = rModeRes[3];

        const rColRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_COLOR);
        if (rColRes && rColRes[0] !== 0xFF && Number.isFinite(rColRes[3]) && Number.isFinite(rColRes[4])) {
          this.state.custom.reactiveColor = [rColRes[3], rColRes[4]];
        }

        const rSpdRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_SPEED);
        if (rSpdRes && rSpdRes[0] !== 0xFF && Number.isFinite(rSpdRes[3])) {
          this.state.custom.reactiveSpeed = rSpdRes[3] < 10 ? 128 : rSpdRes[3];
        }

        const rBlendRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_BLEND);
        if (rBlendRes && rBlendRes[0] !== 0xFF && Number.isFinite(rBlendRes[3])) {
          this.state.custom.reactiveBlend = rBlendRes[3];
        }

        const densityRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, 36);
        if (densityRes && densityRes[0] !== 0xFF && Number.isFinite(densityRes[3])) {
          this.state.custom.effectDensity = densityRes[3];
        }

        // Hardware Multi-Stop Gradient Query
        const gradPresetRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, 33);
        if (gradPresetRes && gradPresetRes[0] !== 0xFF && Number.isFinite(gradPresetRes[3])) {
          this.state.custom.activeGradient = gradPresetRes[3];
          const selHwGrad = document.getElementById("hardwareGradientPresetSelect");
          if (selHwGrad) selHwGrad.value = String(gradPresetRes[3]);
          const hwGradEditorGroup = document.getElementById("hardwareGradientEditorGroup");
          if (hwGradEditorGroup) {
            hwGradEditorGroup.style.display = (gradPresetRes[3] === 8 || gradPresetRes[3] === 9) ? "block" : "none";
          }
        }

        // Query both Custom Gradient Profiles (0 and 1) from EEPROM
        for (let p = 0; p < 2; p++) {
          try {
            const countRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, 34, p);
            if (countRes && countRes[0] !== 0xFF && Number.isFinite(countRes[4]) && countRes[4] >= 2 && countRes[4] <= 8) {
              const count = countRes[4];
              const loadedStops = [];
              for (let s = 0; s < count; s++) {
                const stopRes = await this.protocol.getCustomValue(C.CHANNELS.CUSTOM, 35, p, s);
                if (stopRes && stopRes[0] !== 0xFF && Number.isFinite(stopRes[5])) {
                  loadedStops.push({
                    pos: stopRes[5],
                    r: stopRes[6],
                    g: stopRes[7],
                    b: stopRes[8]
                  });
                }
              }
              if (loadedStops.length >= 2) {
                this.state.custom.customProfiles[p] = loadedStops;
              }
            }
          } catch (err) {
            console.warn(`Could not load custom gradient profile ${p}:`, err);
          }
        }

        if (this.hardwareGradientEditor) {
          const activeProfIdx = (this.state.custom.activeGradient === 9) ? 1 : 0;
          if (this.state.custom.customProfiles && this.state.custom.customProfiles[activeProfIdx]) {
            this.hardwareGradientEditor.setStops(this.state.custom.customProfiles[activeProfIdx], false);
          }
        }
        this._rebuildGradientLut();

        this.updateUI();
      } catch (e) {
        console.warn("Could not load full lighting config from device:", e);
      }
    }

    updateUI() {
      // 1. Backlight Tab
      const selEffect = document.getElementById("rgbEffectSelect");
      if (selEffect) selEffect.value = this.state.rgb.effect;

      const sliderBri = document.getElementById("rgbBrightnessSlider");
      if (sliderBri) sliderBri.value = this.state.rgb.brightness;
      const lblBri = document.getElementById("rgbBriVal");
      if (lblBri) lblBri.textContent = this.state.rgb.brightness;

      const sliderSpd = document.getElementById("rgbSpeedSlider");
      if (sliderSpd) sliderSpd.value = this.state.rgb.speed;
      const lblSpd = document.getElementById("rgbSpdVal");
      if (lblSpd) lblSpd.textContent = this.state.rgb.speed;

      const sliderDensity = document.getElementById("rgbDensitySlider");
      if (sliderDensity) sliderDensity.value = this.state.custom.effectDensity ?? 128;
      const lblDensity = document.getElementById("rgbDensityVal");
      if (lblDensity) lblDensity.textContent = this.state.custom.effectDensity ?? 128;

      const colorRgb = document.getElementById("rgbColorPicker");
      if (colorRgb) colorRgb.value = this._hsToHex(this.state.rgb.hs[0], this.state.rgb.hs[1]);

      const chkReverse = document.getElementById("chkRgbReverse");
      if (chkReverse) chkReverse.checked = this.state.rgb.reverse;

      // Update Color Picker visibility/state according to active effect
      const curEff = RGB_EFFECTS.find(e => e.id === this.state.rgb.effect);
      const colorGroup = document.getElementById("rgbColorGroup");
      if (colorGroup && curEff) {
        const descSpan = colorGroup.querySelector("span");
        if (descSpan) {
          if (curEff.isRainbow) {
            if (this.state.custom.activeGradient > 0) {
              descSpan.textContent = window.i18n ? window.i18n.t("hintGradientColor") : "Gradient palette active — color adjusts palette phase shift (starting hue) and saturation";
            } else {
              descSpan.textContent = window.i18n ? window.i18n.t("hintRainbowColor") : "Rainbow effect — color sets initial hue phase offset and saturation";
            }
          } else {
            descSpan.textContent = window.i18n ? window.i18n.t("hintSingleColor") : "Set color for single-color effects";
          }
        }
      }

      // Reactive Layer UI
      const chkReactive = document.getElementById("chkReactiveEnable");
      if (chkReactive) chkReactive.checked = this.state.custom.reactiveEnable;

      const badgeReactive = document.getElementById("reactiveStatusBadge");
      if (badgeReactive) {
        badgeReactive.textContent = this.state.custom.reactiveEnable
          ? (window.i18n ? window.i18n.t("badgeEnabled") : "Enabled")
          : (window.i18n ? window.i18n.t("badgeDisabled") : "Disabled");
        badgeReactive.className = this.state.custom.reactiveEnable ? "badge-pill badge-success" : "badge-pill";
      }

      const selReactiveMode = document.getElementById("reactiveModeSelect");
      if (selReactiveMode) selReactiveMode.value = this.state.custom.reactiveMode;

      const colorReactive = document.getElementById("reactiveColorPicker");
      if (colorReactive) colorReactive.value = this._hsToHex(this.state.custom.reactiveColor[0], this.state.custom.reactiveColor[1]);

      const reactiveColorGrp = document.getElementById("reactiveColorGroup");
      if (reactiveColorGrp) {
        reactiveColorGrp.style.display = (this.state.custom.reactiveMode === 3 || this.state.custom.reactiveMode === 7) ? "none" : "block";
      }

      const sliderReactiveSpd = document.getElementById("reactiveSpeedSlider");
      if (sliderReactiveSpd) sliderReactiveSpd.value = this.state.custom.reactiveSpeed;
      const lblReactiveSpd = document.getElementById("reactiveSpdVal");
      if (lblReactiveSpd) lblReactiveSpd.textContent = this.state.custom.reactiveSpeed;

      const selReactiveBlend = document.getElementById("reactiveBlendSelect");
      if (selReactiveBlend) selReactiveBlend.value = this.state.custom.reactiveBlend;

      // Win Lock UI
      const selWinLockMode = document.getElementById("winLockModeSelect");
      if (selWinLockMode) selWinLockMode.value = this.state.custom.winLockMode;

      const winLockColorGroup = document.getElementById("winLockColorGroup");
      if (winLockColorGroup) {
        winLockColorGroup.style.display = this.state.custom.winLockMode === 2 ? "block" : "none";
      }

      const colorWinLock = document.getElementById("winLockColorPicker");
      if (colorWinLock) colorWinLock.value = this._hsToHex(this.state.custom.winLockColor[0], this.state.custom.winLockColor[1]);

      const chkWinLock = document.getElementById("chkWinLockToggle");
      if (chkWinLock) chkWinLock.checked = this.state.custom.winLockActive;

      const badgeWinLock = document.getElementById("winLockStatusBadge");
      if (badgeWinLock) {
        badgeWinLock.textContent = this.state.custom.winLockActive
          ? (window.i18n ? window.i18n.t("badgeLocked") : "Locked")
          : (window.i18n ? window.i18n.t("badgeUnlocked") : "Unlocked");
        badgeWinLock.className = this.state.custom.winLockActive ? "badge-pill badge-warning" : "badge-pill";
      }

      // 2. Layers Tab
      const chkLayerLighting = document.getElementById("chkLayerLighting");
      if (chkLayerLighting) chkLayerLighting.checked = this.state.custom.layerLightingEnable;

      const sliderDim = document.getElementById("layerDimSlider");
      if (sliderDim) sliderDim.value = this.state.custom.layerDimLevel;
      const lblDim = document.getElementById("layerDimVal");
      if (lblDim) lblDim.textContent = this.state.custom.layerDimLevel;

      const colorL1 = document.getElementById("layer1ColorPicker");
      if (colorL1) colorL1.value = this._hsToHex(this.state.custom.layer1Color[0], this.state.custom.layer1Color[1]);

      const colorL2 = document.getElementById("layer2ColorPicker");
      if (colorL2) colorL2.value = this._hsToHex(this.state.custom.layer2Color[0], this.state.custom.layer2Color[1]);

      const colorL3 = document.getElementById("layer3ColorPicker");
      if (colorL3) colorL3.value = this._hsToHex(this.state.custom.layer3Color[0], this.state.custom.layer3Color[1]);

      // 3. Logo LED Tab
      const selLogo = document.getElementById("logoModeSelect");
      if (selLogo) selLogo.value = this.state.custom.logoMode;

      const logoColorsWrap = document.getElementById("logoColorsContainer");
      if (logoColorsWrap) {
        logoColorsWrap.style.display = this.state.custom.logoMode === 0 ? "none" : "grid";
      }

      const colCaps = document.getElementById("colorCaps");
      if (colCaps) colCaps.value = this._hsToHex(this.state.custom.lockColors.caps[0], this.state.custom.lockColors.caps[1]);

      const colNum = document.getElementById("colorNum");
      if (colNum) colNum.value = this._hsToHex(this.state.custom.lockColors.num[0], this.state.custom.lockColors.num[1]);

      const colScroll = document.getElementById("colorScroll");
      if (colScroll) colScroll.value = this._hsToHex(this.state.custom.lockColors.scroll[0], this.state.custom.lockColors.scroll[1]);

      const colCapsNum = document.getElementById("colorCapsNum");
      if (colCapsNum) colCapsNum.value = this._hsToHex(this.state.custom.lockColors.capsNum[0], this.state.custom.lockColors.capsNum[1]);

      const colCapsScroll = document.getElementById("colorCapsScroll");
      if (colCapsScroll) colCapsScroll.value = this._hsToHex(this.state.custom.lockColors.capsScroll[0], this.state.custom.lockColors.capsScroll[1]);

      const colNumScroll = document.getElementById("colorNumScroll");
      if (colNumScroll) colNumScroll.value = this._hsToHex(this.state.custom.lockColors.numScroll[0], this.state.custom.lockColors.numScroll[1]);

      const colAll = document.getElementById("colorAll");
      if (colAll) colAll.value = this._hsToHex(this.state.custom.lockColors.all[0], this.state.custom.lockColors.all[1]);

      // 4. Monochrome Backlight UI
      const chkMonoPower = document.getElementById("chkMonochromePower");
      if (chkMonoPower) chkMonoPower.checked = this.state.monochrome?.enabled ?? true;

      const sliderMonoBri = document.getElementById("monochromeBrightnessSlider");
      if (sliderMonoBri) sliderMonoBri.value = this.state.monochrome?.brightness ?? 255;
      const lblMonoBri = document.getElementById("monochromeBriVal");
      if (lblMonoBri) {
        const val = this.state.monochrome?.brightness ?? 255;
        lblMonoBri.textContent = `${Math.round(val / 2.55)}% (${val})`;
      }

      const chkMonoBrtg = document.getElementById("chkMonochromeBreathing");
      if (chkMonoBrtg) chkMonoBrtg.checked = this.state.monochrome?.breathing ?? false;

      const tintPicker = document.getElementById("monochromeTintPicker");
      if (tintPicker) tintPicker.value = this.state.monochrome?.tint ?? "#ffffff";

      const badgeMono = document.getElementById("monochromeStatusBadge");
      if (badgeMono) {
        const isEn = this.state.monochrome?.enabled ?? true;
        const bri = this.state.monochrome?.brightness ?? 255;
        badgeMono.textContent = isEn ? `Active • ${Math.round(bri / 2.55)}%` : "Disabled";
        badgeMono.className = isEn ? "badge-pill badge-success" : "badge-pill";
      }
    }

    _populateEffectsDropdown() {
      const sel = document.getElementById("rgbEffectSelect");
      if (!sel) return;
      sel.innerHTML = RGB_EFFECTS.map(eff => `<option value="${eff.id}">${eff.name}</option>`).join("");
    }

    _throttleHid(key, fn, delay = 80) {
      if (!this._throttleTimers) this._throttleTimers = new Map();
      const existing = this._throttleTimers.get(key);
      if (existing) clearTimeout(existing);
      this._throttleTimers.set(key, setTimeout(async () => {
        this._throttleTimers.delete(key);
        try {
          await fn();
        } catch (e) {
          console.warn(`Throttled HID write failed (${key}):`, e);
        }
      }, delay));
    }

    _sendCustomGradientStopsThrottled(prof, stops) {
      this._pendingStopsProf = prof;
      this._pendingStops = stops;
      if (this._stopsThrottleTimer) clearTimeout(this._stopsThrottleTimer);
      this._stopsThrottleTimer = setTimeout(() => {
        this._flushCustomGradientStops();
      }, 120);
    }

    async _flushCustomGradientStops() {
      if (this._isSendingCustomStops) {
        this._stopsResendNeeded = true;
        return;
      }
      if (!this.protocol || !this.protocol.isConnected || !this._pendingStops) return;
      this._isSendingCustomStops = true;
      this._stopsResendNeeded = false;
      const prof = this._pendingStopsProf;
      const stops = this._pendingStops;
      const C = window.GMMK3_CONSTANTS;
      try {
        await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 34, prof, stops.length);
        for (let s = 0; s < stops.length && s < 8; s++) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 35, prof, s, stops[s].pos, stops[s].r, stops[s].g, stops[s].b);
        }
      } catch (err) {
        console.warn("Failed to stream custom gradient stops:", err);
      } finally {
        this._isSendingCustomStops = false;
        if (this._stopsResendNeeded) {
          this._stopsResendNeeded = false;
          this._flushCustomGradientStops();
        }
      }
    }

    setControlsEnabled(enabled) {
      const controlIds = [
        "rgbBrightnessSlider", "rgbEffectSelect", "rgbSpeedSlider", "rgbDensitySlider", "rgbColorPicker", "chkRgbReverse",
        "chkReactiveEnable", "reactiveModeSelect", "reactiveColorPicker", "reactiveSpeedSlider", "reactiveBlendSelect",
        "winLockModeSelect", "winLockColorPicker", "chkWinLockToggle",
        "chkLayerLighting", "layerDimSlider", "layer1ColorPicker", "layer2ColorPicker", "layer3ColorPicker",
        "logoModeSelect", "colorCaps", "colorNum", "colorScroll", "colorCapsNum", "colorCapsScroll", "colorNumScroll", "colorAll",
        "chkMonochromePower", "monochromeBrightnessSlider", "chkMonochromeBreathing", "monochromeTintPicker"
      ];
      controlIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !enabled;
      });
    }

    _bindEvents() {
      const C = window.GMMK3_CONSTANTS;

      // 0. Monochrome Backlight Events
      document.getElementById("chkMonochromePower")?.addEventListener("change", async (e) => {
        const isEnabled = e.target.checked;
        if (!this.state.monochrome) this.state.monochrome = { enabled: true, brightness: 255, breathing: false, tint: '#ffffff' };
        this.state.monochrome.enabled = isEnabled;
        const badge = document.getElementById("monochromeStatusBadge");
        if (badge) {
          badge.textContent = isEnabled ? `Active • ${Math.round(this.state.monochrome.brightness / 2.55)}%` : "Disabled";
          badge.className = isEnabled ? "badge-pill badge-success" : "badge-pill";
        }
        if (this.protocol && this.protocol.device) {
          try {
            await this.protocol.setBacklightValue?.(1, isEnabled ? this.state.monochrome.brightness : 0);
          } catch (err) {}
        }
      });

      document.getElementById("monochromeBrightnessSlider")?.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        if (!this.state.monochrome) this.state.monochrome = { enabled: true, brightness: 255, breathing: false, tint: '#ffffff' };
        this.state.monochrome.brightness = val;
        const lbl = document.getElementById("monochromeBriVal");
        if (lbl) lbl.textContent = `${Math.round(val / 2.55)}% (${val})`;
        const badge = document.getElementById("monochromeStatusBadge");
        if (badge && this.state.monochrome.enabled) {
          badge.textContent = `Active • ${Math.round(val / 2.55)}%`;
        }
        if (this.protocol && this.protocol.device) {
          this._throttleHid("mono_bri", async () => {
            await this.protocol.setBacklightValue?.(1, val);
          }, 80);
        }
      });

      document.getElementById("chkMonochromeBreathing")?.addEventListener("change", async (e) => {
        const isBreathing = e.target.checked;
        if (!this.state.monochrome) this.state.monochrome = { enabled: true, brightness: 255, breathing: false, tint: '#ffffff' };
        this.state.monochrome.breathing = isBreathing;
        if (this.protocol && this.protocol.device) {
          try {
            await this.protocol.setBacklightValue?.(2, isBreathing ? 1 : 0);
          } catch (err) {}
        }
      });

      document.getElementById("monochromeTintPicker")?.addEventListener("change", (e) => {
        if (!this.state.monochrome) this.state.monochrome = { enabled: true, brightness: 255, breathing: false, tint: '#ffffff' };
        this.state.monochrome.tint = e.target.value;
      });

      // 1. Backlight Events
      document.getElementById("rgbEffectSelect")?.addEventListener("change", async (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.rgb.effect = val;
        this.updateUI();
        if (this.protocol && this.protocol.device) {
          await this.protocol.setRGBMatrixValue(C.RGB_MATRIX_VAL.EFFECT, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.RGB_MATRIX);
        }
      });

      document.getElementById("rgbBrightnessSlider")?.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.rgb.brightness = val;
        const lbl = document.getElementById("rgbBriVal");
        if (lbl) lbl.textContent = val;
        if (this.protocol && this.protocol.device) {
          this._throttleHid("rgb_bri", async () => {
            await this.protocol.setRGBMatrixValue(C.RGB_MATRIX_VAL.BRIGHTNESS, val);
          }, 80);
        }
      });

      document.getElementById("rgbBrightnessSlider")?.addEventListener("change", async () => {
        if (this.protocol && this.protocol.device) {
          await this.protocol.setRGBMatrixValue(C.RGB_MATRIX_VAL.BRIGHTNESS, this.state.rgb.brightness);
          await this.protocol.saveCustomConfig(C.CHANNELS.RGB_MATRIX);
        }
      });

      document.getElementById("rgbSpeedSlider")?.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.rgb.speed = val;
        const lbl = document.getElementById("rgbSpdVal");
        if (lbl) lbl.textContent = val;
        if (this.protocol && this.protocol.device) {
          this._throttleHid("rgb_spd", async () => {
            await this.protocol.setRGBMatrixValue(C.RGB_MATRIX_VAL.EFFECT_SPEED, val);
          }, 80);
        }
      });

      document.getElementById("rgbSpeedSlider")?.addEventListener("change", async () => {
        if (this.protocol && this.protocol.device) {
          await this.protocol.setRGBMatrixValue(C.RGB_MATRIX_VAL.EFFECT_SPEED, this.state.rgb.speed);
          await this.protocol.saveCustomConfig(C.CHANNELS.RGB_MATRIX);
        }
      });

      document.getElementById("rgbDensitySlider")?.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.custom.effectDensity = val;
        const lbl = document.getElementById("rgbDensityVal");
        if (lbl) lbl.textContent = val;
        if (this.protocol && this.protocol.device) {
          this._throttleHid("rgb_density", async () => {
            await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 36, val);
          }, 80);
        }
      });

      document.getElementById("rgbDensitySlider")?.addEventListener("change", async () => {
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 36, this.state.custom.effectDensity ?? 128);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("rgbColorPicker")?.addEventListener("change", async (e) => {
        const [h, s] = this._hexToHs(e.target.value);
        this.state.rgb.hs = [h, s];
        if (this.protocol && this.protocol.device) {
          await this.protocol.setRGBMatrixValue(C.RGB_MATRIX_VAL.COLOR, h, s);
          await this.protocol.saveCustomConfig(C.CHANNELS.RGB_MATRIX);
        }
      });

      document.getElementById("chkRgbReverse")?.addEventListener("change", async (e) => {
        const val = e.target.checked ? 1 : 0;
        this.state.rgb.reverse = e.target.checked;
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.RGB_REVERSE, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      // Reactive Layer Events
      document.getElementById("chkReactiveEnable")?.addEventListener("change", async (e) => {
        const val = e.target.checked ? 1 : 0;
        this.state.custom.reactiveEnable = e.target.checked;
        const badge = document.getElementById("reactiveStatusBadge");
        if (badge) {
          badge.textContent = e.target.checked ? (window.i18n ? window.i18n.t("badgeEnabled") : "Enabled") : (window.i18n ? window.i18n.t("badgeDisabled") : "Disabled");
          badge.className = e.target.checked ? "badge-pill badge-success" : "badge-pill";
        }
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_ENABLE, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("reactiveModeSelect")?.addEventListener("change", async (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.custom.reactiveMode = val;
        const colorGrp = document.getElementById("reactiveColorGroup");
        if (colorGrp) {
          colorGrp.style.display = (val === 3 || val === 7) ? "none" : "block";
        }
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_MODE, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("reactiveColorPicker")?.addEventListener("change", async (e) => {
        const [h, s] = this._hexToHs(e.target.value);
        this.state.custom.reactiveColor = [h, s];
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_COLOR, h, s);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("reactiveSpeedSlider")?.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.custom.reactiveSpeed = val;
        const lbl = document.getElementById("reactiveSpdVal");
        if (lbl) lbl.textContent = val;
        if (this.protocol && this.protocol.device) {
          this._throttleHid("reactive_spd", async () => {
            await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_SPEED, val);
          }, 80);
        }
      });

      document.getElementById("reactiveSpeedSlider")?.addEventListener("change", async () => {
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_SPEED, this.state.custom.reactiveSpeed);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("reactiveBlendSelect")?.addEventListener("change", async (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.custom.reactiveBlend = val;
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.REACTIVE_BLEND, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      // Win Lock Events
      document.getElementById("winLockModeSelect")?.addEventListener("change", async (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.custom.winLockMode = val;
        const colorGrp = document.getElementById("winLockColorGroup");
        if (colorGrp) colorGrp.style.display = val === 2 ? "block" : "none";
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.WIN_LOCK_MODE, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("winLockColorPicker")?.addEventListener("change", async (e) => {
        const [h, s] = this._hexToHs(e.target.value);
        this.state.custom.winLockColor = [h, s];
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.WIN_LOCK_COLOR, h, s);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("chkWinLockToggle")?.addEventListener("change", async (e) => {
        const isLocked = e.target.checked;
        this.state.custom.winLockActive = isLocked;
        const badge = document.getElementById("winLockStatusBadge");
        if (badge) {
          badge.textContent = isLocked ? (window.i18n ? window.i18n.t("badgeLocked") : "Locked") : (window.i18n ? window.i18n.t("badgeUnlocked") : "Unlocked");
          badge.className = isLocked ? "badge-pill badge-warning" : "badge-pill";
        }
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.WIN_LOCK_STATE, isLocked ? 1 : 0);
        }
      });

      // 2. Layer Events
      document.getElementById("chkLayerLighting")?.addEventListener("change", async (e) => {
        const val = e.target.checked ? 1 : 0;
        this.state.custom.layerLightingEnable = e.target.checked;
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_LIGHTING_ENABLE, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      document.getElementById("layerDimSlider")?.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.custom.layerDimLevel = val;
        const lbl = document.getElementById("layerDimVal");
        if (lbl) lbl.textContent = val;
        if (this.protocol && this.protocol.device) {
          this._throttleHid("layer_dim", async () => {
            await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_DIM_LEVEL, val);
          }, 80);
        }
      });

      document.getElementById("layerDimSlider")?.addEventListener("change", async () => {
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LAYER_DIM_LEVEL, this.state.custom.layerDimLevel);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      this._bindColorPicker("layer1ColorPicker", C.CUSTOM_VAL.LAYER_1_COLOR, "layer1Color");
      this._bindColorPicker("layer2ColorPicker", C.CUSTOM_VAL.LAYER_2_COLOR, "layer2Color");
      this._bindColorPicker("layer3ColorPicker", C.CUSTOM_VAL.LAYER_3_COLOR, "layer3Color");

      // 3. Logo LED Events
      document.getElementById("logoModeSelect")?.addEventListener("change", async (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.custom.logoMode = val;
        const logoColorsWrap = document.getElementById("logoColorsContainer");
        if (logoColorsWrap) {
          logoColorsWrap.style.display = val === 0 ? "none" : "grid";
        }
        if (this.protocol && this.protocol.device) {
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, C.CUSTOM_VAL.LOGO_MODE, val);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });

      this._bindLockColorPicker("colorCaps", C.CUSTOM_VAL.LOGO_COLOR_CAPS, "caps");
      this._bindLockColorPicker("colorNum", C.CUSTOM_VAL.LOGO_COLOR_NUM, "num");
      this._bindLockColorPicker("colorScroll", C.CUSTOM_VAL.LOGO_COLOR_SCROLL, "scroll");
      this._bindLockColorPicker("colorCapsNum", C.CUSTOM_VAL.LOGO_COLOR_CAPS_NUM, "capsNum");
      this._bindLockColorPicker("colorCapsScroll", C.CUSTOM_VAL.LOGO_COLOR_CAPS_SCROLL, "capsScroll");
      this._bindLockColorPicker("colorNumScroll", C.CUSTOM_VAL.LOGO_COLOR_NUM_SCROLL, "numScroll");
      this._bindLockColorPicker("colorAll", C.CUSTOM_VAL.LOGO_COLOR_ALL, "all");

      // 4. Hardware Multi-Stop Gradient Events
      const selHwGrad = document.getElementById("hardwareGradientPresetSelect");
      const hwGradEditorGroup = document.getElementById("hardwareGradientEditorGroup");
      if (selHwGrad) {
        selHwGrad.addEventListener("change", async (e) => {
          const val = parseInt(e.target.value, 10);
          this.state.custom.activeGradient = val;
          this._rebuildGradientLut();
          this.updateUI();
          if (hwGradEditorGroup) {
            hwGradEditorGroup.style.display = (val === 8 || val === 9) ? "block" : "none";
          }
          if (val === 8 || val === 9) {
            const profIdx = (val === 9) ? 1 : 0;
            if (this.hardwareGradientEditor && this.state.custom.customProfiles && this.state.custom.customProfiles[profIdx]) {
              this.hardwareGradientEditor.setStops(this.state.custom.customProfiles[profIdx], false);
            }
          }
          // The gradient palette applies globally to ALL animations without switching the active effect
          if (this.protocol && this.protocol.isConnected) {
            this._throttleHid("hw_gradient", async () => {
              try {
                await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 33, val);
                await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
              } catch (err) {
                console.warn("Could not set hardware gradient preset:", err);
              }
            }, 50);
          }
        });
      }

      if (document.getElementById("hardwareGradientEditorContainer") && window.GradientEditor) {
        const initialProfIdx = (this.state.custom.activeGradient === 9) ? 1 : 0;
        this.hardwareGradientEditor = new window.GradientEditor("hardwareGradientEditorContainer", {
          stops: (this.state.custom.customProfiles && this.state.custom.customProfiles[initialProfIdx]) || [
            { pos: 0, r: 0, g: 255, b: 255 },
            { pos: 85, r: 255, g: 0, b: 128 },
            { pos: 170, r: 255, g: 255, b: 0 }
          ],
          onChange: (stops) => {
            const prof = (this.state.custom.activeGradient === 9) ? 1 : 0;
            this.state.custom.customProfiles[prof] = stops;
            this._rebuildGradientLut();
            if (this.protocol && this.protocol.isConnected && (this.state.custom.activeGradient === 8 || this.state.custom.activeGradient === 9)) {
              this._sendCustomGradientStopsThrottled(prof, stops);
            }
          }
        });
      }

      const btnSaveHwGrad = document.getElementById("btnSaveHardwareGradient");
      if (btnSaveHwGrad) {
        btnSaveHwGrad.addEventListener("click", async () => {
          if (!this.protocol || !this.protocol.isConnected) {
            if (window.gUI) window.gUI.showToast(window.i18n ? window.i18n.t("toastConnectKeyboardFirst") : "Connect keyboard first", "warning");
            return;
          }
          const prof = (this.state.custom.activeGradient === 9) ? 1 : 0;
          const stops = this.hardwareGradientEditor ? this.hardwareGradientEditor.getStops() : (this.state.custom.customProfiles[prof] || []);
          this.state.custom.customProfiles[prof] = stops;
          try {
            await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 34, prof, stops.length);
            for (let s = 0; s < stops.length && s < 8; s++) {
              await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 35, prof, s, stops[s].pos, stops[s].r, stops[s].g, stops[s].b);
            }
            await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, 37, prof, 1);
            if (window.gUI) window.gUI.showToast(window.i18n ? window.i18n.t("toastGradientSavedToEeprom") : "Gradient profile saved to EEPROM", "success");
          } catch (err) {
            if (window.gUI) window.gUI.showToast(err.message, "error");
          }
        });
      }
    }

    _bindColorPicker(id, valId, stateKey) {
      document.getElementById(id)?.addEventListener("change", async (e) => {
        const [h, s] = this._hexToHs(e.target.value);
        this.state.custom[stateKey] = [h, s];
        if (this.protocol && this.protocol.device) {
          const C = window.GMMK3_CONSTANTS;
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, valId, h, s);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });
    }

    _bindLockColorPicker(id, valId, lockKey) {
      document.getElementById(id)?.addEventListener("change", async (e) => {
        const [h, s] = this._hexToHs(e.target.value);
        this.state.custom.lockColors[lockKey] = [h, s];
        if (this.protocol && this.protocol.device) {
          const C = window.GMMK3_CONSTANTS;
          await this.protocol.setCustomValue(C.CHANNELS.CUSTOM, valId, h, s);
          await this.protocol.saveCustomConfig(C.CHANNELS.CUSTOM);
        }
      });
    }

    _hexToHs(hex) {
      hex = hex.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;

      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const d = max - min;
      s = max === 0 ? 0 : d / max;

      if (max !== min) {
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return [
        Math.round(h * 255),
        Math.round(s * 255)
      ];
    }

    _hsToHex(hByte, sByte) {
      if (hByte === undefined || sByte === undefined) return "#00ffff";
      const h = (hByte / 255) * 360;
      const s = sByte / 255;
      const v = 1.0;

      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;

      let r = 0, g = 0, b = 0;
      if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
      else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
      else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
      else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
      else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      const toHex = (n) => {
        const val = Math.round((n + m) * 255);
        return Math.min(255, Math.max(0, val)).toString(16).padStart(2, "0");
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }

  window.LightingController = LightingController;
})();
