/**
 * LuxQMK Studio - Software Lighting Controller & 60 FPS Real-Time FX Suite
 * Universal support for:
 * 1. Audio Visualizers (WASAPI Loopback, Microphone, Stereo Mix)
 * 2. Real-Time PC Animation Engines (Cyber Wave, Matrix Rain, Particle Flow, Aurora, Radial Bloom)
 * 3. Bidirectional per-user persistence (AppData / localStorage)
 */

(function () {
  class StudioLightingController {
    constructor(protocol, lightingController) {
      this.protocol = protocol;
      this.lighting = lightingController;

      this.activeTab = "audio"; // "audio" or "effects"
      this.isRunning = false;
      this.animFrameId = null;

      // Audio Context & Analyser
      this.audioCtx = null;
      this.analyser = null;
      this.mediaStream = null;
      this.sourceNode = null;
      this.dataArray = null;
      this.frequencyBands = new Float32Array(16);
      this.bassEnergy = 0;
      this.bassHistory = [];
      this.isBeat = false;
      this.beatDecay = 0;

      // Animation Engine State
      this.particles = [];
      this.matrixDrops = [];
      this.lastFrameTime = 0;

      // Configuration
      this.config = {
        enabled: false,
        activeTab: "audio",
        // Audio Visualizer settings
        sourceId: "system_loopback",
        audioMode: "equalizer", // equalizer, bassPulse, audioWave, vuMeter
        audioColorMode: "rainbow", // rainbow, singleColor
        audioColor: [0, 255], // HSV [H, S]
        sensitivity: 1.2,
        smoothing: 0.82,
        // PC Software Animation settings
        effectPreset: "neonWave", // neonWave, matrixRain, particleStorm, aurora, pulseBloom
        effectSpeed: 1.0,
        effectIntensity: 1.0,
        effectColor: [180, 255] // HSV
      };

      // Hardware Direct Lighting Streaming
      this._lastHardwareStreamTime = 0;
      this._isHardwareStreaming = false;
      this._logoCurRgb = { r: 0, g: 0, b: 0 };

      this._boundTick = this._tick.bind(this);
    }

    async init() {
      await this._loadConfig();
      this._bindUI();
      await this.enumerateAudioSources();
      this._initParticles();
      this._initMatrixDrops();
      this._syncFormControls();
      this._updateUI();

      if (window.i18n) {
        window.i18n.onChange(() => {
          this.enumerateAudioSources();
          this._updateUI();
        });
      }

      // Auto-resume state if user left studio lighting enabled when exiting
      if (this.config.enabled) {
        setTimeout(async () => {
          try {
            await this.start(true); // silent auto-resume
          } catch (e) {
            console.warn("Studio lighting auto-resume skipped on boot:", e);
          }
        }, 150);
      }
    }

    _initParticles() {
      this.particles = [];
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: Math.random() * 23,
          y: Math.random() * 6,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.06,
          hue: Math.floor(Math.random() * 256),
          radius: 1.5 + Math.random() * 2.0
        });
      }
    }

    _initMatrixDrops() {
      this.matrixDrops = [];
      for (let c = 0; c < 24; c++) {
        this.matrixDrops.push({
          x: c,
          y: Math.random() * -10,
          speed: 0.08 + Math.random() * 0.12,
          length: 3 + Math.floor(Math.random() * 4)
        });
      }
    }

    async enumerateAudioSources() {
      const sel = document.getElementById("audioSourceSelect");
      if (!sel) return;

      const currentVal = this.config.sourceId || "system_loopback";
      const isPl = window.i18n && window.i18n.currentLang === "pl";

      const optLoopback = document.createElement("option");
      optLoopback.value = "system_loopback";
      optLoopback.textContent = isPl
        ? "Dźwięk systemowy (Głośniki / Loopback)"
        : "System Audio Output (WASAPI / Loopback)";
      sel.appendChild(optLoopback);

      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter((d) => d.kind === "audioinput");

          audioInputs.forEach((dev, idx) => {
            const opt = document.createElement("option");
            opt.value = dev.deviceId;
            opt.textContent = `${dev.label || (isPl ? `Wejście Audio / Mikrofon ${idx + 1}` : `Audio Input / Microphone ${idx + 1}`)}`;
            sel.appendChild(opt);
          });
        } catch (e) {
          console.warn("Could not enumerate audio devices:", e);
        }
      }

      sel.value = currentVal;
      if (sel.value !== currentVal) {
        sel.value = "system_loopback";
        this.config.sourceId = "system_loopback";
        this._saveConfig();
      }
    }

    _syncFormControls() {
      const selSource = document.getElementById("audioSourceSelect");
      if (selSource) selSource.value = this.config.sourceId || "system_loopback";

      const selAudioMode = document.getElementById("audioModeSelect");
      if (selAudioMode) selAudioMode.value = this.config.audioMode || "equalizer";

      const selColorMode = document.getElementById("audioColorModeSelect");
      if (selColorMode) {
        selColorMode.value = this.config.audioColorMode || "rainbow";
        const colorWrap = document.getElementById("audioSingleColorGroup");
        if (colorWrap) {
          colorWrap.style.display = this.config.audioColorMode === "singleColor" ? "block" : "none";
        }
      }

      const sliderAudioSens = document.getElementById("audioSensitivitySlider");
      const lblSens = document.getElementById("audioSensVal");
      if (sliderAudioSens) {
        sliderAudioSens.value = String(this.config.sensitivity || 1.2);
        if (lblSens) lblSens.textContent = `${this.config.sensitivity}x`;
      }

      const selEffect = document.getElementById("softwareEffectSelect");
      if (selEffect) selEffect.value = this.config.effectPreset || "neonWave";

      const sliderEffectSpeed = document.getElementById("softwareEffectSpeedSlider");
      const lblSpeed = document.getElementById("softwareEffectSpeedVal");
      if (sliderEffectSpeed) {
        sliderEffectSpeed.value = String(this.config.effectSpeed || 1.0);
        if (lblSpeed) lblSpeed.textContent = `${this.config.effectSpeed}x`;
      }

      const sliderEffectIntensity = document.getElementById("softwareEffectIntensitySlider");
      const lblInt = document.getElementById("softwareEffectIntensityVal");
      if (sliderEffectIntensity) {
        sliderEffectIntensity.value = String(this.config.effectIntensity || 1.0);
        if (lblInt) lblInt.textContent = `${Math.round((this.config.effectIntensity || 1.0) * 100)}%`;
      }
    }

    switchSubTab(tabName) {
      this.activeTab = tabName;
      this.config.activeTab = tabName;
      this._saveConfig();

      document.querySelectorAll(".studio-lighting-tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
      });

      const audioPane = document.getElementById("pane-studio-audio");
      const fxPane = document.getElementById("pane-studio-effects");
      if (audioPane) audioPane.style.display = tabName === "audio" ? "block" : "none";
      if (fxPane) fxPane.style.display = tabName === "effects" ? "block" : "none";

      // If running and switched tabs, re-route capture/render seamlessly
      if (this.isRunning) {
        if (tabName === "effects" && this.audioCtx) {
          this._stopAudioStream();
        } else if (tabName === "audio" && !this.audioCtx) {
          this._startAudioStream();
        }
      }
    }

    async start(silent = false) {
      if (this.isRunning) return;

      try {
        if (this.activeTab === "audio") {
          await this._startAudioStream();
        }

        this.isRunning = true;
        this.config.enabled = true;
        this._saveConfig();
        this._updateUI();

        if (this.protocol && this.protocol.isConnected) {
          this.protocol.setDirectLightingEnable(true);
        }

        this.animFrameId = requestAnimationFrame(this._boundTick);

        if (!silent && window.gUI) {
          window.gUI.showToast(window.i18n ? window.i18n.t("toastStudioLightingStarted") : "LuxQMK Studio Lighting activated", "success");
        }
      } catch (err) {
        console.warn("Could not start studio lighting:", err);
        this.stop();
        if (!silent && window.gUI) {
          const errMsg = window.i18n ? window.i18n.t("toastAudioError", { err: err.message }) : ("Error: " + err.message);
          window.gUI.showToast(errMsg, "error");
        }
      }
    }

    stop() {
      this.isRunning = false;
      this.config.enabled = false;
      this._saveConfig();

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }

      if (this.protocol && this.protocol.isConnected) {
        this.protocol.setDirectLightingEnable(false);
      }

      this._stopAudioStream();
      this._updateUI();

      if (window.gUI) {
        window.gUI.showToast(window.i18n ? window.i18n.t("toastStudioLightingStopped") : "LuxQMK Studio Lighting stopped", "info");
      }
    }

    async _startAudioStream() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      if (this.config.sourceId === "system_loopback") {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
          // Stop unused video tracks immediately
          this.mediaStream.getVideoTracks().forEach((t) => t.stop());
        } else {
          throw new Error("System audio loopback is not supported in this environment");
        }
      } else {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: this.config.sourceId },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          },
          video: false
        });
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
    }

    _stopAudioStream() {
      if (this.sourceNode) {
        try { this.sourceNode.disconnect(); } catch (e) {}
        this.sourceNode = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
      }
      if (this.audioCtx) {
        try { this.audioCtx.close(); } catch (e) {}
        this.audioCtx = null;
      }
    }

    _tick(now) {
      if (!this.isRunning) return;

      if (this.activeTab === "audio" && this.analyser) {
        this._processAudioAnalysis();
        this._renderAudioFrame(now);
      } else {
        this._renderSoftwareFxFrame(now);
      }

      this._streamToHardware(now);

      this.animFrameId = requestAnimationFrame(this._boundTick);
    }

    _processAudioAnalysis() {
      this.analyser.getByteFrequencyData(this.dataArray);

      // 1. 16 Frequency Bands
      const binCount = this.analyser.frequencyBinCount;
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

      // 2. Bass Beat Detection
      let bassSum = 0;
      for (let b = 0; b < 4; b++) {
        bassSum += this.dataArray[b];
      }
      const curBass = (bassSum / 4) * this.config.sensitivity;
      this.bassHistory.push(curBass);
      if (this.bassHistory.length > 30) this.bassHistory.shift();

      const avgBass = this.bassHistory.reduce((a, v) => a + v, 0) / this.bassHistory.length;
      if (curBass > avgBass * 1.35 && curBass > 90) {
        this.isBeat = true;
        this.beatDecay = 255;
      } else {
        this.isBeat = false;
        this.beatDecay = Math.max(0, this.beatDecay - 18);
      }
      this.bassEnergy = curBass;
    }

    _renderAudioFrame(now) {
      if (!this.lighting || !this.lighting.visualizerKeys) return;

      const keys = this.lighting.visualizerKeys;

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.isLogo || k.isKnob) continue;

        let h = 0, s = 255, v = 0;

        switch (this.config.audioMode) {
          case "equalizer": {
            const bandIdx = Math.min(15, Math.max(0, Math.floor((k.x / 22.5) * 16)));
            const bandVal = this.frequencyBands[bandIdx];
            const heightThreshold = ((5.5 - k.y) / 5.5) * 255;
            if (bandVal >= heightThreshold) {
              v = Math.min(255, bandVal);
              h = (this.config.audioColorMode === "rainbow") ? Math.round((k.x / 22.5) * 255) : this.config.audioColor[0];
              s = (this.config.audioColorMode === "rainbow") ? 255 : this.config.audioColor[1];
            } else {
              v = 20;
              h = (this.config.audioColorMode === "rainbow") ? Math.round((k.x / 22.5) * 255) : this.config.audioColor[0];
              s = 200;
            }
            break;
          }

          case "bassPulse": {
            v = Math.max(20, this.beatDecay);
            h = (this.config.audioColorMode === "rainbow") ? Math.round((now * 0.05 + k.dist) % 256) : this.config.audioColor[0];
            s = (this.config.audioColorMode === "rainbow") ? 255 : this.config.audioColor[1];
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

        this._applyKeyColor(k, h, s, v);
      }

      // Render Left & Right Side Diffusers (Side light strips)
      const diffusers = this.lighting.sideDiffusers || [];
      for (let i = 0; i < diffusers.length; i++) {
        const sd = diffusers[i];
        if (!sd || !sd.el) continue;

        let h = 0, s = 255, v = 0;

        switch (this.config.audioMode) {
          case "equalizer": {
            const yFrac = Math.max(0, Math.min(1, 1 - (sd.qmkY / 64)));
            const bandIdx = sd.isLeft
              ? Math.min(7, Math.floor(yFrac * 8))
              : Math.min(15, 8 + Math.floor(yFrac * 8));
            const bandVal = this.frequencyBands[bandIdx];
            const heightThreshold = yFrac * 255;
            if (bandVal >= heightThreshold) {
              v = Math.min(255, bandVal * 1.15);
              h = (this.config.audioColorMode === "rainbow")
                ? (sd.isLeft ? Math.round(yFrac * 128) : Math.round(128 + yFrac * 127))
                : this.config.audioColor[0];
              s = (this.config.audioColorMode === "rainbow") ? 255 : this.config.audioColor[1];
            } else {
              v = 20;
              h = (this.config.audioColorMode === "rainbow") ? (sd.isLeft ? 0 : 160) : this.config.audioColor[0];
              s = 200;
            }
            break;
          }

          case "bassPulse": {
            v = Math.max(25, this.beatDecay);
            h = (this.config.audioColorMode === "rainbow") ? Math.round((now * 0.05 + sd.dist) % 256) : this.config.audioColor[0];
            s = (this.config.audioColorMode === "rainbow") ? 255 : this.config.audioColor[1];
            break;
          }

          case "audioWave": {
            const waveFront = (now * 0.12) % 255;
            const diff = Math.abs(sd.dist - (waveFront / 2));
            if (diff < 20) {
              v = Math.min(255, (20 - diff) * 12 * (this.bassEnergy / 255));
              h = (Math.round(sd.dist + now * 0.05)) & 0xFF;
            } else {
              v = 15;
            }
            break;
          }

          case "vuMeter": {
            const band = sd.isLeft ? this.frequencyBands[3] : this.frequencyBands[12];
            const yNorm = Math.max(0, Math.min(1, 1 - (sd.qmkY / 64)));
            if ((yNorm * 255) <= band) {
              v = 255;
              h = Math.round(85 - (yNorm * 85));
            } else {
              v = 15;
            }
            break;
          }
        }

        this._applyDiffuserColor(sd, h, s, v);
      }

      // Render Logo Badge LED (if present)
      if (this.lighting.logoBadgeEl) {
        const logoH = (this.config.audioColorMode === "rainbow") ? Math.round((now * 0.06) % 256) : this.config.audioColor[0];
        const logoV = Math.max(30, Math.min(255, this.bassEnergy * 1.2));
        this._applyLogoColor(this.lighting.logoBadgeEl, logoH, 255, logoV);
      }
    }

    _renderSoftwareFxFrame(now) {
      if (!this.lighting || !this.lighting.visualizerKeys) return;

      const keys = this.lighting.visualizerKeys;
      const speed = this.config.effectSpeed || 1.0;
      const intensity = this.config.effectIntensity || 1.0;
      const preset = this.config.effectPreset || "neonWave";

      // Advance particles / matrix drops
      this.particles.forEach((p) => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < 0 || p.x > 23) p.vx *= -1;
        if (p.y < 0 || p.y > 6) p.vy *= -1;
      });

      this.matrixDrops.forEach((d) => {
        d.y += d.speed * speed;
        if (d.y > 8) {
          d.y = -Math.random() * 4;
          d.speed = 0.08 + Math.random() * 0.12;
        }
      });

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.isLogo || k.isKnob) continue;

        let h = 0, s = 255, v = 0;

        switch (preset) {
          case "neonWave": {
            const wave = Math.sin((k.x * 0.35 + k.y * 0.2) + (now * 0.003 * speed));
            h = Math.round((now * 0.04 * speed + k.x * 8 + k.y * 12) % 256);
            v = Math.round((0.45 + 0.55 * wave) * 255 * intensity);
            s = 255;
            break;
          }

          case "matrixRain": {
            const col = Math.floor(k.x);
            const drop = this.matrixDrops[col % this.matrixDrops.length];
            const distY = k.y - drop.y;
            if (distY >= 0 && distY < drop.length) {
              if (distY < 0.8) {
                h = 100; s = 40; v = Math.round(255 * intensity);
              } else {
                h = 85; s = 255; v = Math.round((1 - (distY / drop.length)) * 240 * intensity);
              }
            } else {
              v = 15; h = 85; s = 255;
            }
            break;
          }

          case "particleStorm": {
            let maxBright = 15;
            let pColor = 180;
            this.particles.forEach((p) => {
              const dx = k.x - p.x;
              const dy = k.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < p.radius) {
                const b = (1 - (dist / p.radius)) * 255;
                if (b > maxBright) {
                  maxBright = b;
                  pColor = p.hue;
                }
              }
            });
            v = Math.round(maxBright * intensity);
            h = pColor;
            s = 255;
            break;
          }

          case "aurora": {
            const p1 = Math.sin(k.x * 0.2 + now * 0.002 * speed);
            const p2 = Math.cos(k.y * 0.4 - now * 0.0025 * speed);
            const combined = (p1 + p2) * 0.5;
            h = Math.round((120 + combined * 60) % 256);
            s = 240;
            v = Math.round((0.5 + 0.5 * Math.sin(now * 0.004 * speed + k.dist * 0.1)) * 255 * intensity);
            break;
          }

          case "pulseBloom": {
            const distCenter = Math.sqrt(Math.pow(k.x - 11.5, 2) + Math.pow(k.y - 3, 2));
            const ring = Math.sin(distCenter * 0.8 - now * 0.005 * speed);
            h = Math.round((now * 0.03 * speed + distCenter * 15) % 256);
            v = Math.round(Math.max(20, Math.pow(Math.max(0, ring), 2) * 255 * intensity));
            s = 255;
            break;
          }
        }

        this._applyKeyColor(k, h, s, v);
      }

      // Render Left & Right Side Diffusers
      const diffusers = this.lighting.sideDiffusers || [];
      for (let i = 0; i < diffusers.length; i++) {
        const sd = diffusers[i];
        if (!sd || !sd.el) continue;

        const x = sd.isLeft ? 0 : 22.5;
        const y = (sd.qmkY / 64) * 6;

        let h = 0, s = 255, v = 0;

        switch (preset) {
          case "neonWave": {
            const wave = Math.sin((x * 0.35 + y * 0.2) + (now * 0.003 * speed));
            h = Math.round((now * 0.04 * speed + x * 8 + y * 12) % 256);
            v = Math.round((0.45 + 0.55 * wave) * 255 * intensity);
            s = 255;
            break;
          }

          case "matrixRain": {
            const col = sd.isLeft ? 0 : 23;
            const drop = this.matrixDrops[col % this.matrixDrops.length];
            const distY = y - drop.y;
            if (distY >= 0 && distY < drop.length) {
              if (distY < 0.8) {
                h = 100; s = 40; v = Math.round(255 * intensity);
              } else {
                h = 85; s = 255; v = Math.round((1 - (distY / drop.length)) * 240 * intensity);
              }
            } else {
              v = 15; h = 85; s = 255;
            }
            break;
          }

          case "particleStorm": {
            let maxBright = 15;
            let pColor = 180;
            this.particles.forEach((p) => {
              const dx = x - p.x;
              const dy = y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < p.radius) {
                const b = (1 - (dist / p.radius)) * 255;
                if (b > maxBright) {
                  maxBright = b;
                  pColor = p.hue;
                }
              }
            });
            v = Math.round(maxBright * intensity);
            h = pColor;
            s = 255;
            break;
          }

          case "aurora": {
            const p1 = Math.sin(x * 0.2 + now * 0.002 * speed);
            const p2 = Math.cos(y * 0.4 - now * 0.0025 * speed);
            const combined = (p1 + p2) * 0.5;
            h = Math.round((120 + combined * 60) % 256);
            s = 240;
            v = Math.round((0.5 + 0.5 * Math.sin(now * 0.004 * speed + sd.dist * 0.1)) * 255 * intensity);
            break;
          }

          case "pulseBloom": {
            const distCenter = Math.sqrt(Math.pow(x - 11.5, 2) + Math.pow(y - 3, 2));
            const ring = Math.sin(distCenter * 0.8 - now * 0.005 * speed);
            h = Math.round((now * 0.03 * speed + distCenter * 15) % 256);
            v = Math.round(Math.max(20, Math.pow(Math.max(0, ring), 2) * 255 * intensity));
            s = 255;
            break;
          }
        }

        this._applyDiffuserColor(sd, h, s, v);
      }

      // Render Logo Badge LED
      if (this.lighting.logoBadgeEl) {
        const logoH = Math.round((now * 0.04 * speed + 180) % 256);
        const logoV = Math.round(220 * intensity);
        this._applyLogoColor(this.lighting.logoBadgeEl, logoH, 255, logoV);
      }
    }

    _applyKeyColor(k, h, s, v) {
      const rgb = this.lighting._hsvToRgb(h, s, v);
      k._curRgb = rgb;
      const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
      const border = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
      const shadow = `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${v / 255})`;
      const targets = k.els || [k.el];
      for (let t = 0; t < targets.length; t++) {
        const el = targets[t];
        if (!el) continue;
        el.style.backgroundColor = bg;
        el.style.borderColor = border;
        el.style.boxShadow = shadow;
      }
    }

    _applyDiffuserColor(sd, h, s, v) {
      if (!sd) return;
      const rgb = this.lighting._hsvToRgb(h, s, v);
      sd._curRgb = rgb;
      const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
      const shadow = `0 0 14px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0.15, (v / 255) * 0.95)})`;
      const targets = sd.els || [sd.el];
      for (let t = 0; t < targets.length; t++) {
        const el = targets[t];
        if (!el) continue;
        el.style.backgroundColor = bg;
        el.style.boxShadow = shadow;
      }
    }

    _applyLogoColor(logoEl, h, s, v) {
      if (!logoEl) return;
      const rgb = this.lighting._hsvToRgb(h, s, v);
      this._logoCurRgb = rgb;
      const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;
      const shadow = `0 0 14px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95), inset 0 0 4px rgba(255, 255, 255, 0.5)`;
      const targets = Array.isArray(logoEl) ? logoEl : [logoEl];
      for (let t = 0; t < targets.length; t++) {
        const el = targets[t];
        if (!el) continue;
        el.style.backgroundColor = bg;
        el.style.borderColor = `rgba(255, 255, 255, 0.6)`;
        el.style.boxShadow = shadow;
      }
    }

    async _streamToHardware(now) {
      if (!this.protocol || !this.protocol.isConnected || !this.protocol.device) return;
      if (this._isHardwareStreaming) return;
      if (now - this._lastHardwareStreamTime < 33) return; // 30 FPS throttle

      this._lastHardwareStreamTime = now;
      this._isHardwareStreaming = true;

      try {
        const keys = this.lighting?.visualizerKeys || [];
        const diffusers = this.lighting?.sideDiffusers || [];
        const leds = [];

        // 1. Physical matrix keys (skip logo/knob placeholder entries)
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (k.isLogo || k.isKnob) continue;
          const rgb = k._curRgb || { r: 0, g: 0, b: 0 };
          leds.push(rgb.r, rgb.g, rgb.b);
        }

        // 2. Left and Right side diffusers
        for (let i = 0; i < diffusers.length; i++) {
          const sd = diffusers[i];
          const rgb = sd._curRgb || { r: 0, g: 0, b: 0 };
          leds.push(rgb.r, rgb.g, rgb.b);
        }

        // 3. Glorious Logo Badge LED
        if (this._logoCurRgb) {
          leds.push(this._logoCurRgb.r, this._logoCurRgb.g, this._logoCurRgb.b);
        }

        // Stream to firmware in 8-LED blocks (24 RGB bytes per VIA packet)
        const CHUNK_LEDS = 8;
        const totalLeds = Math.floor(leds.length / 3);
        for (let startLed = 0; startLed < totalLeds; startLed += CHUNK_LEDS) {
          const count = Math.min(CHUNK_LEDS, totalLeds - startLed);
          const chunk = leds.slice(startLed * 3, (startLed + count) * 3);
          await this.protocol.sendDirectLightingBlock(startLed, chunk);
        }
      } catch (e) {
        // Suppress transient frame dropping
      } finally {
        this._isHardwareStreaming = false;
      }
    }

    _bindUI() {
      // 1. Sub-Tab Switcher
      document.querySelectorAll(".studio-lighting-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.switchSubTab(btn.dataset.tab);
        });
      });

      // 2. Master Toggle Button
      const btnToggle = document.getElementById("btnStudioLightingToggle");
      if (btnToggle) {
        btnToggle.addEventListener("click", () => {
          if (this.isRunning) {
            this.stop();
          } else {
            this.start();
          }
        });
      }

      // 3. Audio Controls
      const selSource = document.getElementById("audioSourceSelect");
      if (selSource) {
        selSource.addEventListener("change", async (e) => {
          this.config.sourceId = e.target.value;
          this._saveConfig();
          if (this.isRunning && this.activeTab === "audio") {
            this._stopAudioStream();
            await this._startAudioStream();
          }
        });
      }

      const btnRefresh = document.getElementById("btnRefreshAudioSources");
      if (btnRefresh) {
        btnRefresh.addEventListener("click", async () => {
          try {
            const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
            tmp.getTracks().forEach((t) => t.stop());
          } catch (e) {}
          await this.enumerateAudioSources();
          if (window.gUI) {
            window.gUI.showToast(window.i18n ? window.i18n.t("toastAudioSourcesRefreshed") : "Audio sources refreshed", "info");
          }
        });
      }

      const selAudioMode = document.getElementById("audioModeSelect");
      if (selAudioMode) {
        selAudioMode.addEventListener("change", (e) => {
          this.config.audioMode = e.target.value;
          this._saveConfig();
        });
      }

      const selColorMode = document.getElementById("audioColorModeSelect");
      if (selColorMode) {
        selColorMode.addEventListener("change", (e) => {
          this.config.audioColorMode = e.target.value;
          const colorWrap = document.getElementById("audioSingleColorGroup");
          if (colorWrap) {
            colorWrap.style.display = e.target.value === "singleColor" ? "block" : "none";
          }
          this._saveConfig();
        });
      }

      const pickerAudioColor = document.getElementById("audioColorPicker");
      if (pickerAudioColor && this.lighting) {
        pickerAudioColor.addEventListener("change", (e) => {
          this.config.audioColor = this.lighting._hexToHs(e.target.value);
          this._saveConfig();
        });
      }

      const sliderAudioSens = document.getElementById("audioSensitivitySlider");
      if (sliderAudioSens) {
        sliderAudioSens.addEventListener("input", (e) => {
          this.config.sensitivity = parseFloat(e.target.value);
          const lbl = document.getElementById("audioSensVal");
          if (lbl) lbl.textContent = e.target.value + "x";
          this._saveConfig();
        });
      }

      // 4. PC Software Animation Controls
      const selEffect = document.getElementById("softwareEffectSelect");
      if (selEffect) {
        selEffect.addEventListener("change", (e) => {
          this.config.effectPreset = e.target.value;
          this._saveConfig();
        });
      }

      const sliderSpeed = document.getElementById("softwareEffectSpeedSlider");
      if (sliderSpeed) {
        sliderSpeed.addEventListener("input", (e) => {
          this.config.effectSpeed = parseFloat(e.target.value);
          const lbl = document.getElementById("softwareEffectSpeedVal");
          if (lbl) lbl.textContent = `${e.target.value}x`;
          this._saveConfig();
        });
      }

      const sliderIntensity = document.getElementById("softwareEffectIntensitySlider");
      if (sliderIntensity) {
        sliderIntensity.addEventListener("input", (e) => {
          this.config.effectIntensity = parseFloat(e.target.value);
          const lbl = document.getElementById("softwareEffectIntensityVal");
          if (lbl) lbl.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
          this._saveConfig();
        });
      }
    }

    _saveConfig() {
      const cfg = {
        enabled: this.config.enabled,
        activeTab: this.activeTab,
        sourceId: this.config.sourceId,
        audioMode: this.config.audioMode,
        audioColorMode: this.config.audioColorMode,
        audioColor: this.config.audioColor,
        sensitivity: this.config.sensitivity,
        smoothing: this.config.smoothing,
        effectPreset: this.config.effectPreset,
        effectSpeed: this.config.effectSpeed,
        effectIntensity: this.config.effectIntensity
      };

      localStorage.setItem("luxqmk_studio_lighting_config", JSON.stringify(cfg));
      localStorage.setItem("luxqmk_audio_source", this.config.sourceId);

      if (window.electronAPI && window.electronAPI.saveUserConfig) {
        window.electronAPI.saveUserConfig({ studioLighting: cfg });
      }
    }

    async _loadConfig() {
      let cfg = null;
      if (window.electronAPI && window.electronAPI.loadUserConfig) {
        try {
          const userCfg = await window.electronAPI.loadUserConfig();
          if (userCfg && userCfg.studioLighting) {
            cfg = userCfg.studioLighting;
          }
        } catch (e) {}
      }

      if (!cfg) {
        try {
          const raw = localStorage.getItem("luxqmk_studio_lighting_config");
          if (raw) cfg = JSON.parse(raw);
        } catch (e) {}
      }

      if (cfg) {
        if (typeof cfg.enabled === "boolean") this.config.enabled = cfg.enabled;
        if (cfg.activeTab) this.activeTab = cfg.activeTab;
        if (cfg.sourceId) this.config.sourceId = cfg.sourceId;
        if (cfg.audioMode) this.config.audioMode = cfg.audioMode;
        if (cfg.audioColorMode) this.config.audioColorMode = cfg.audioColorMode;
        if (cfg.audioColor) this.config.audioColor = cfg.audioColor;
        if (typeof cfg.sensitivity === "number") this.config.sensitivity = cfg.sensitivity;
        if (typeof cfg.smoothing === "number") this.config.smoothing = cfg.smoothing;
        if (cfg.effectPreset) this.config.effectPreset = cfg.effectPreset;
        if (typeof cfg.effectSpeed === "number") this.config.effectSpeed = cfg.effectSpeed;
        if (typeof cfg.effectIntensity === "number") this.config.effectIntensity = cfg.effectIntensity;
      }
    }

    _updateUI() {
      const btnToggle = document.getElementById("btnStudioLightingToggle");
      const badge = document.getElementById("studioLightingStatusBadge");

      if (btnToggle) {
        const playSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        const stopSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';
        const textKey = this.isRunning ? "btnStopSoftwareFx" : "btnStartSoftwareFx";
        const labelText = window.i18n ? window.i18n.t(textKey) : (this.isRunning ? "Stop Studio Lighting" : "Start Studio Lighting");
        btnToggle.innerHTML = `${this.isRunning ? stopSvg : playSvg} <span data-i18n="${textKey}">${labelText}</span>`;
        btnToggle.className = this.isRunning ? "btn btn-danger" : "btn btn-primary";
      }

      if (badge) {
        badge.dataset.i18n = this.isRunning ? "lblSoftwareActiveBadge" : "lblSoftwareStoppedBadge";
        const activeText = window.i18n ? window.i18n.t("lblSoftwareActiveBadge") : "Active (Running 60 FPS)";
        const stoppedText = window.i18n ? window.i18n.t("lblSoftwareStoppedBadge") : "Stopped";
        badge.textContent = this.isRunning ? activeText : stoppedText;
        badge.className = this.isRunning ? "badge-pill badge-success" : "badge-pill";
      }

      // Also ensure sub-tab buttons match active tab
      document.querySelectorAll(".studio-lighting-tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === this.activeTab);
      });
      const audioPane = document.getElementById("pane-studio-audio");
      const fxPane = document.getElementById("pane-studio-effects");
      if (audioPane) audioPane.style.display = this.activeTab === "audio" ? "block" : "none";
      if (fxPane) fxPane.style.display = this.activeTab === "effects" ? "block" : "none";
    }

    updateUI() {
      this._updateUI();
    }
  }

  window.StudioLightingController = StudioLightingController;
})();
