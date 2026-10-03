/**
 * LuxQMK Studio - 60 FPS Real-Time Software Lighting & Audio Visualizer Engine
 * Coordinates audio analysis, procedural effects, geometry mapping, and direct WebHID streaming.
 */

import { hidProtocol } from '../hid-protocol';
import { useVisualizerStore } from '../../store/useVisualizerStore';
import { useKeymapStore } from '../../store/useKeymapStore';
import { useUIStore } from '../../store/useUIStore';
import { useI18n } from '../../i18n';
import { HARDWARE_LIGHTING_PROFILES, getHardwareLedIndex } from '../../data/led-mappings';
import { KeyGeometry, AudioRenderContext, RenderContext } from './types';
import { geometryManager } from './geometry';
import { audioAnalyzer } from './audio/audio-analyzer';
import { audioEffectsRegistry } from './audio/audio-effects-registry';
import { softwareEffectsRegistry } from './effects/software-effects-registry';
import { sidelightManager } from './sidelights/sidelight-manager';

export class VisualizerEngineService {
  private animFrameId: number | null = null;
  private bgTimer: any = null;
  public isRunning: boolean = false;
  private lastTickTime: number = 0;

  private isHardwareStreaming: boolean = false;
  private lastHardwareStreamTime: number = 0;
  private isWindowMinimized: boolean = false;

  constructor() {
    this._bindVisibility();
  }

  private _bindVisibility() {
    if (typeof document === 'undefined') return;

    const switchToBgTimer = () => {
      if (!this.isRunning) return;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.bgTimer) clearInterval(this.bgTimer);
      // High-precision 60 FPS background timer (16ms)
      this.bgTimer = setInterval(() => this._tick(performance.now()), 16);
    };

    const switchToRaf = () => {
      if (!this.isRunning) return;
      if (this.bgTimer) {
        clearInterval(this.bgTimer);
        this.bgTimer = null;
      }
      if (!this.animFrameId) {
        this.animFrameId = requestAnimationFrame((t) => this._tick(t));
      }
    };

    const updateVisibilityState = () => {
      if (document.hidden || this.isWindowMinimized) {
        switchToBgTimer();
      } else {
        switchToRaf();
      }
    };

    document.addEventListener('visibilitychange', updateVisibilityState);

    if (typeof window !== 'undefined' && (window as any).electronAPI?.onWindowMinimized) {
      (window as any).electronAPI.onWindowMinimized((minimized: boolean) => {
        this.isWindowMinimized = minimized;
        updateVisibilityState();
      });
    }
  }

  public get audioAnalyzer(): typeof audioAnalyzer {
    return audioAnalyzer;
  }

  public get frequencyBands(): Float32Array {
    return audioAnalyzer.frequencyBands;
  }

  public get peakBands(): Float32Array {
    return audioAnalyzer.peakBands;
  }

  public get peakHoldTimes(): Float32Array {
    return audioAnalyzer.peakHoldTimes;
  }

  public get bassEnergy(): number {
    return audioAnalyzer.bassEnergy;
  }

  public get maxX(): number {
    return geometryManager.maxX;
  }

  public get maxY(): number {
    return geometryManager.maxY;
  }

  public rebuildKeyGeometry(presetId: string): void {
    geometryManager.rebuildKeyGeometry(presetId);
  }

  public getAudioInputDevices(): Promise<Array<{ id: string; label: string }>> {
    return audioAnalyzer.getAudioInputDevices();
  }

  public enumerateAudioSources(): Promise<Array<{ id: string; label: string }>> {
    return audioAnalyzer.getAudioInputDevices();
  }

  public restartAudioStream(): Promise<void> {
    return audioAnalyzer.restartAudioStream();
  }

  public async start(): Promise<void> {
    const activeTab = useUIStore.getState().studioSubTab;
    if (this.isRunning) {
      if (activeTab === 'audio' && !audioAnalyzer.isRunning) {
        await audioAnalyzer.restartAudioStream();
      }
      return;
    }
    try {
      if (activeTab === 'audio') {
        await audioAnalyzer.startAudioStream();
      }

      this.isRunning = true;
      this.lastTickTime = performance.now();
      useVisualizerStore.getState().setConfig({ isRunning: true });

      if (hidProtocol.isConnected()) {
        await hidProtocol.setDirectLightingEnable(true);
      }

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.bgTimer) {
        clearInterval(this.bgTimer);
        this.bgTimer = null;
      }

      if (document.hidden || this.isWindowMinimized) {
        this.bgTimer = setInterval(() => this._tick(performance.now()), 16);
      } else {
        this.animFrameId = requestAnimationFrame((t) => this._tick(t));
      }

      useUIStore.getState().showToast(useI18n.getState().t('toastStudioLightingStarted'), 'success');
    } catch (err: any) {
      console.warn('Could not start studio lighting:', err);
      this.stop();
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${err.message || err}`, 'error');
    }
  }

  public stop(): void {
    this.isRunning = false;
    useVisualizerStore.getState().setConfig({ isRunning: false });

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.bgTimer) {
      clearInterval(this.bgTimer);
      this.bgTimer = null;
    }

    if (hidProtocol.isConnected()) {
      hidProtocol.setDirectLightingEnable(false);
    }

    audioAnalyzer.stopAudioStream();
    audioEffectsRegistry.resetAll();
    this._resetDomElements();
    useUIStore.getState().showToast(useI18n.getState().t('toastStudioLightingStopped'), 'info');
  }

  public toggle(): void {
    if (this.isRunning) this.stop();
    else this.start();
  }

  private _tick(now: number): void {
    if (!this.isRunning) return;

    try {
      const dt = Math.min(50, Math.max(1, now - (this.lastTickTime || now)));
      this.lastTickTime = now;

      const keys = geometryManager.ensureGeometry();
      const config = useVisualizerStore.getState().config;
      const activeTab = useUIStore.getState().studioSubTab;

      if (activeTab === 'audio' && audioAnalyzer.isRunning) {
        audioAnalyzer.processAudioAnalysis();

        const audioEff = audioEffectsRegistry.get(config.audioMode);
        if (audioEff?.updateAnalysis) {
          audioEff.updateAnalysis(
            now,
            audioAnalyzer.frequencyBands,
            audioAnalyzer.bassEnergy,
            config,
            geometryManager.maxX,
            geometryManager.maxY,
            audioAnalyzer.rawBassFlux,
            audioAnalyzer.rawBassEnergy
          );
        }

        const audioCtx: AudioRenderContext = {
          now,
          dt,
          config,
          keys,
          frequencyBands: audioAnalyzer.frequencyBands,
          peakBands: audioAnalyzer.peakBands,
          bassEnergy: audioAnalyzer.bassEnergy,
          rawBassFlux: audioAnalyzer.rawBassFlux,
          rawBassEnergy: audioAnalyzer.rawBassEnergy,
          maxX: geometryManager.maxX,
          maxY: geometryManager.maxY,
          applyKeyStyle: (k, r, g, b, bright) => this._applyKeyStyle(k, r, g, b, bright)
        };

        if (audioEff) {
          audioEff.render(audioCtx);
        }

        sidelightManager.renderSidelightDom(
          now,
          config,
          audioAnalyzer.frequencyBands,
          audioAnalyzer.bassEnergy,
          0,
          geometryManager.maxX,
          geometryManager.maxY
        );
      } else {
        const renderCtx: RenderContext = {
          now,
          dt,
          config,
          keys,
          maxX: geometryManager.maxX,
          maxY: geometryManager.maxY,
          applyKeyStyle: (k, r, g, b, bright) => this._applyKeyStyle(k, r, g, b, bright)
        };

        softwareEffectsRegistry.render(renderCtx);

        sidelightManager.renderSidelightDom(
          now,
          config,
          audioAnalyzer.frequencyBands,
          audioAnalyzer.bassEnergy,
          0,
          geometryManager.maxX,
          geometryManager.maxY
        );
      }

      this._streamToHardware(now);
    } catch (err) {
      console.error('Error during studio lighting frame render:', err);
    }

    if (this.isRunning && !this.bgTimer && !document.hidden && !this.isWindowMinimized && typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame((t) => this._tick(t));
    }
  }

  private _applyKeyStyle(k: KeyGeometry, r: number, g: number, b: number, bright: number): void {
    if (k.isKnob) return;

    const safeBright = Number.isFinite(bright) ? Math.max(0, Math.min(1.5, bright)) : 0;
    const safeR = Number.isFinite(r) ? r : 0;
    const safeG = Number.isFinite(g) ? g : 0;
    const safeB = Number.isFinite(b) ? b : 0;

    const finalR = Math.max(0, Math.min(255, Math.round(safeR * safeBright)));
    const finalG = Math.max(0, Math.min(255, Math.round(safeG * safeBright)));
    const finalB = Math.max(0, Math.min(255, Math.round(safeB * safeBright)));

    k.curRgb = { r: finalR, g: finalG, b: finalB };

    if (!k.el) return;

    if (finalR === 0 && finalG === 0 && finalB === 0) {
      k.el.style.backgroundColor = 'rgba(11, 15, 25, 0.85)';
      k.el.style.borderColor = 'rgba(255, 255, 255, 0.04)';
      k.el.style.boxShadow = 'none';
      return;
    }

    const alpha = Math.max(0.2, Math.min(0.95, safeBright));
    k.el.style.backgroundColor = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
    k.el.style.borderColor = `rgba(${Math.min(255, finalR + 40)}, ${Math.min(255, finalG + 40)}, ${Math.min(255, finalB + 40)}, 0.85)`;
    k.el.style.boxShadow = `0 0 ${Math.round(4 + safeBright * 10)}px rgba(${finalR}, ${finalG}, ${finalB}, ${Math.min(1.0, safeBright)})`;
  }

  private _resetDomElements(): void {
    const keys = geometryManager.ensureGeometry();
    keys.forEach((k) => {
      k.curRgb = { r: 0, g: 0, b: 0 };
      if (k.el) {
        k.el.style.backgroundColor = '';
        k.el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        k.el.style.boxShadow = 'none';
      }
    });

    const sideSegments = document.querySelectorAll<HTMLElement>('#studioLightingKeyboardCanvas .side-diffuser-segment');
    sideSegments.forEach((el) => {
      el.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
      el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      el.style.boxShadow = 'none';
    });
  }

  private async _streamToHardware(now: number): Promise<void> {
    if (!hidProtocol.isConnected() || this.isHardwareStreaming) return;
    if (now - this.lastHardwareStreamTime < 32) return; // ~30 FPS hardware streaming

    this.lastHardwareStreamTime = now;
    this.isHardwareStreaming = true;

    try {
      const presetId = useKeymapStore.getState().presetLayoutId || 'gmmk3-100-ansi';
      const hwProfile = HARDWARE_LIGHTING_PROFILES[presetId] || { totalLeds: 125 };
      const totalLeds = hwProfile.totalLeds;
      const hwBuffer = new Uint8Array(totalLeds * 3);

      // 1. Map physical matrix keys to MCU driver index
      const keys = geometryManager.getCachedKeys();
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.isKnob) continue;

        let targetLed = k.hardwareLedIndex;
        if (targetLed === undefined && k.matrix) {
          targetLed = getHardwareLedIndex(presetId, k.matrix[0], k.matrix[1]);
        }

        if (targetLed !== undefined && targetLed < totalLeds) {
          const rgb = k.curRgb || { r: 0, g: 0, b: 0 };
          const offset = targetLed * 3;
          hwBuffer[offset + 0] = rgb.r;
          hwBuffer[offset + 1] = rgb.g;
          hwBuffer[offset + 2] = rgb.b;
        }
      }

      // 2. Map Sidelights (Underglow) if present
      if (hwProfile.sidelightRange) {
        const config = useVisualizerStore.getState().config;
        const leftRange = hwProfile.sidelightRange.left;
        const rightRange = hwProfile.sidelightRange.right;
        const leftCount = leftRange[1] - leftRange[0] + 1;
        const rightCount = rightRange[1] - rightRange[0] + 1;

        for (let i = 0; i < leftCount; i++) {
          const ledIndex = leftRange[0] + i;
          if (ledIndex < totalLeds) {
            const sideRgb = sidelightManager.computeSidelightRgb(
              'left',
              i,
              leftCount,
              now,
              config,
              audioAnalyzer.frequencyBands,
              audioAnalyzer.bassEnergy,
              0,
              geometryManager.maxX,
              geometryManager.maxY
            );
            const offset = ledIndex * 3;
            hwBuffer[offset + 0] = sideRgb.r;
            hwBuffer[offset + 1] = sideRgb.g;
            hwBuffer[offset + 2] = sideRgb.b;
          }
        }

        for (let i = 0; i < rightCount; i++) {
          const ledIndex = rightRange[0] + i;
          if (ledIndex < totalLeds) {
            const sideRgb = sidelightManager.computeSidelightRgb(
              'right',
              i,
              rightCount,
              now,
              config,
              audioAnalyzer.frequencyBands,
              audioAnalyzer.bassEnergy,
              0,
              geometryManager.maxX,
              geometryManager.maxY
            );
            const offset = ledIndex * 3;
            hwBuffer[offset + 0] = sideRgb.r;
            hwBuffer[offset + 1] = sideRgb.g;
            hwBuffer[offset + 2] = sideRgb.b;
          }
        }
      }

      // 3. Map Logo LED if present
      if (hwProfile.logoLedIndex !== undefined && hwProfile.logoLedIndex < totalLeds) {
        const logoKey = keys.find((k) => k.isLogo);
        if (logoKey) {
          const offset = hwProfile.logoLedIndex * 3;
          hwBuffer[offset + 0] = logoKey.curRgb.r;
          hwBuffer[offset + 1] = logoKey.curRgb.g;
          hwBuffer[offset + 2] = logoKey.curRgb.b;
        }
      }

      // 4. Stream to firmware in 9-LED blocks (27 RGB bytes per 32-byte VIA packet)
      const ledsPerPacket = 9;
      const numPackets = Math.ceil(totalLeds / ledsPerPacket);

      for (let p = 0; p < numPackets; p++) {
        const startLed = p * ledsPerPacket;
        const count = Math.min(ledsPerPacket, totalLeds - startLed);
        const rgbSlice = Array.from(hwBuffer.subarray(startLed * 3, (startLed + count) * 3));
        await hidProtocol.sendDirectLightingBlock(startLed, rgbSlice);
      }
    } catch (e) {
      console.warn('Hardware lighting streaming error:', e);
    } finally {
      this.isHardwareStreaming = false;
    }
  }
}

export const visualizerService = new VisualizerEngineService();
