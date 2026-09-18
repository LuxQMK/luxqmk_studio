/**
 * GMMK Studio - Real-time Audio Reactive Visualizer Engine
 * Universal support for both Native Electron Desktop (WASAPI Loopback)
 * and Web Browsers (Web Audio API / DisplayMedia Audio).
 */

(function () {
  class AudioVisualizer {
    constructor(protocol, lightingController) {
      this.protocol = protocol;
      this.lighting = lightingController;

      this.audioCtx = null;
      this.analyser = null;
      this.mediaStream = null;
      this.sourceNode = null;
      this.animFrameId = null;

      this.isRunning = false;
      this.dataArray = null;
      this.frequencyBands = new Float32Array(16);

      this.bassEnergy = 0;
      this.bassHistory = [];
      this.isBeat = false;
      this.beatDecay = 0;

      this.config = {
        enabled: false,
        mode: "equalizer", // equalizer, bassPulse, audioWave, vuMeter
        colorMode: "rainbow", // rainbow, reactive, singleColor
        color: [0, 255], // HSV [H, S]
        sensitivity: 1.2, // Multiplier
        smoothing: 0.82, // Analyser smoothingTimeConstant
        streamToHardware: true
      };

      this._boundTick = this._tick.bind(this);
    }

    init() {
      this._bindUI();
      this._updateUI();
      if (window.i18n) {
        window.i18n.onChange(() => this._updateUI());
      }
    }

    async start() {
      if (this.isRunning) return;

      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
        if (this.audioCtx.state === "suspended") {
          await this.audioCtx.resume();
        }

        // Capture system audio loopback / tab audio / mic
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          try {
            this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
              }
            });
          } catch (displayErr) {
            // Fallback to audio user media
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: false, noiseSuppression: false }
            });
          }
        } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        if (!this.mediaStream || this.mediaStream.getAudioTracks().length === 0) {
          throw new Error("No audio stream track found");
        }

        this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = this.config.smoothing;

        this.sourceNode.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.isRunning = true;
        this.config.enabled = true;
        this._updateUI();
        this.animFrameId = requestAnimationFrame(this._boundTick);

        if (window.gUI) {
          window.gUI.showToast(window.i18n ? window.i18n.t("toastAudioStarted") : "Audio Visualizer started", "success");
        }
      } catch (err) {
        console.warn("Could not start audio visualizer:", err);
        this.stop();
        if (window.gUI) {
          const errMsg = window.i18n ? window.i18n.t("toastAudioError", { err: err.message }) : ("Audio error: " + err.message);
          window.gUI.showToast(errMsg, "error");
        }
      }
    }

    stop() {
      this.isRunning = false;
      this.config.enabled = false;

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }

      if (this.sourceNode) {
        try { this.sourceNode.disconnect(); } catch (e) {}
        this.sourceNode = null;
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => t.stop());
        this.mediaStream = null;
      }

      if (this.audioCtx) {
        try { this.audioCtx.close(); } catch (e) {}
        this.audioCtx = null;
      }

      this._updateUI();
    }

    _tick() {
      if (!this.isRunning || !this.analyser) return;

      this.analyser.getByteFrequencyData(this.dataArray);

      // 1. Compute 16 frequency bands
      const binCount = this.analyser.frequencyBinCount; // 128
      const step = Math.floor(binCount / 16);

      for (let i = 0; i < 16; i++) {
        let sum = 0;
        const start = i * step;
        const end = start + step;
        for (let b = start; b < end; b++) {
          sum += this.dataArray[b];
        }
        const avg = (sum / step) * this.config.sensitivity;
        this.frequencyBands[i] = Math.min(255, avg);
      }

      // 2. Bass Beat Detection (Bins 0..4, 20Hz-150Hz)
      let bassSum = 0;
      for (let b = 0; b < 4; b++) {
        bassSum += this.dataArray[b];
      }
      const curBass = (bassSum / 4) * this.config.sensitivity;
      this.bassHistory.push(curBass);
      if (this.bassHistory.length > 30) this.bassHistory.shift();

      const avgBassHistory = this.bassHistory.reduce((acc, v) => acc + v, 0) / this.bassHistory.length;
      if (curBass > avgBassHistory * 1.35 && curBass > 90) {
        this.isBeat = true;
        this.beatDecay = 255;
      } else {
        this.isBeat = false;
        this.beatDecay = Math.max(0, this.beatDecay - 18);
      }
      this.bassEnergy = curBass;

      // 3. Render Audio Visualizer Frame to on-screen keyboard
      this._renderAudioFrame();

      this.animFrameId = requestAnimationFrame(this._boundTick);
    }

    _renderAudioFrame() {
      if (!this.lighting || !this.lighting.visualizerKeys) return;

      const keys = this.lighting.visualizerKeys;
      const now = performance.now();

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.isLogo || k.isKnob) continue;

        let h = 0, s = 255, v = 0;

        switch (this.config.mode) {
          case "equalizer": {
            const bandIdx = Math.min(15, Math.max(0, Math.floor((k.x / 22.5) * 16)));
            const bandVal = this.frequencyBands[bandIdx];

            const heightThreshold = ((5.5 - k.y) / 5.5) * 255;
            if (bandVal >= heightThreshold) {
              v = Math.min(255, bandVal);
              if (this.config.colorMode === "rainbow") {
                h = Math.round((k.x / 22.5) * 255);
              } else {
                h = this.config.color[0];
                s = this.config.color[1];
              }
            } else {
              v = 20;
              h = (this.config.colorMode === "rainbow") ? Math.round((k.x / 22.5) * 255) : this.config.color[0];
              s = 200;
            }
            break;
          }

          case "bassPulse": {
            v = Math.max(20, this.beatDecay);
            if (this.config.colorMode === "rainbow") {
              h = Math.round((now * 0.05 + k.dist) % 256);
            } else {
              h = this.config.color[0];
              s = this.config.color[1];
            }
            break;
          }

          case "audioWave": {
            const waveFront = (now * 0.12) % 255;
            const diff = Math.abs(k.dist - (waveFront / 2));
            if (diff < 20) {
              v = Math.min(255, (20 - diff) * 12 * (this.bassEnergy / 255));
              h = (Math.round(k.dist + now * 0.05)) & 0xFF;
            } else {
              v = 15;
            }
            break;
          }

          case "vuMeter": {
            const isRightChannel = k.x > 11;
            const band = isRightChannel ? this.frequencyBands[12] : this.frequencyBands[3];
            const xNorm = isRightChannel ? ((k.x - 11) / 11.5) : ((11 - k.x) / 11);
            if ((xNorm * 255) <= band) {
              v = 255;
              h = Math.round(85 - (xNorm * 85));
            } else {
              v = 15;
            }
            break;
          }
        }

        const rgb = this.lighting._hsvToRgb(h, s, v);
        k.el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
        k.el.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
        k.el.style.boxShadow = `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${v / 255})`;
      }
    }

    _bindUI() {
      const btnToggle = document.getElementById("btnAudioToggle");
      if (btnToggle) {
        btnToggle.addEventListener("click", () => {
          if (this.isRunning) {
            this.stop();
          } else {
            this.start();
          }
        });
      }

      const selMode = document.getElementById("audioModeSelect");
      if (selMode) {
        selMode.addEventListener("change", (e) => {
          this.config.mode = e.target.value;
        });
      }

      const selColorMode = document.getElementById("audioColorModeSelect");
      if (selColorMode) {
        selColorMode.addEventListener("change", (e) => {
          this.config.colorMode = e.target.value;
          const colorWrap = document.getElementById("audioSingleColorGroup");
          if (colorWrap) {
            colorWrap.style.display = e.target.value === "singleColor" ? "block" : "none";
          }
        });
      }

      const pickerColor = document.getElementById("audioColorPicker");
      if (pickerColor && this.lighting) {
        pickerColor.addEventListener("change", (e) => {
          this.config.color = this.lighting._hexToHs(e.target.value);
        });
      }

      const sliderSens = document.getElementById("audioSensitivitySlider");
      if (sliderSens) {
        sliderSens.addEventListener("input", (e) => {
          this.config.sensitivity = parseFloat(e.target.value);
          const lbl = document.getElementById("audioSensVal");
          if (lbl) lbl.textContent = e.target.value + "x";
        });
      }
    }

    _updateUI() {
      const btnToggle = document.getElementById("btnAudioToggle");
      const badge = document.getElementById("audioStatusBadge");

      if (btnToggle) {
        const startText = window.i18n ? window.i18n.t("btnAudioStart") : "▶️ Start Audio Visualizer";
        const stopText = window.i18n ? window.i18n.t("btnAudioStop") : "⏹️ Stop Audio Visualizer";
        btnToggle.textContent = this.isRunning ? stopText : startText;
        btnToggle.className = this.isRunning ? "btn btn-danger" : "btn btn-primary";
      }

      if (badge) {
        const activeText = window.i18n ? window.i18n.t("audioStatusActive") : "Active (Live 60 FPS)";
        const stoppedText = window.i18n ? window.i18n.t("audioStatusStopped") : "Stopped";
        badge.textContent = this.isRunning ? activeText : stoppedText;
        badge.className = this.isRunning ? "badge-pill badge-success" : "badge-pill";
      }
    }
  }

  window.AudioVisualizer = AudioVisualizer;
})();
