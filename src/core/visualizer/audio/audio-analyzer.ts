/**
 * LuxQMK Studio - Audio Analyzer (Web Audio API, WASAPI Loopback, FFT 16-Band Decomposition, Peak Hold)
 */

import { useVisualizerStore } from '../../../store/useVisualizerStore';
import { useUIStore } from '../../../store/useUIStore';

export class AudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  public isRunning: boolean = false;
  private isRestartingAudio: boolean = false;
  private deviceChangeDebounceTimer: any = null;
  private lastAudioRestartTime: number = 0;
  private lastAudioDeviceSignature: string = '';
  private dataArray: Uint8Array = new Uint8Array(128);

  public frequencyBands: Float32Array = new Float32Array(16);
  public peakBands: Float32Array = new Float32Array(16);
  public peakHoldTimes: Float32Array = new Float32Array(16);
  public bassEnergy: number = 0;

  constructor() {
    this._bindDeviceEvents();
  }

  public async getAudioInputDevices(): Promise<Array<{ id: string; label: string }>> {
    const list: Array<{ id: string; label: string }> = [
      { id: 'system_loopback', label: 'Windows System Audio (Loopback WASAPI)' }
    ];
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((d) => d.kind === 'audioinput');
        inputs.forEach((dev, idx) => {
          list.push({
            id: dev.deviceId,
            label: dev.label || `Audio Input / Microphone ${idx + 1}`
          });
        });
      } catch (e) {
        console.warn('Could not enumerate audio devices:', e);
      }
    }
    return list;
  }

  public async enumerateAudioSources(): Promise<Array<{ id: string; label: string }>> {
    return this.getAudioInputDevices();
  }

  public async startAudioStream(): Promise<void> {
    const config = useVisualizerStore.getState().config;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio API not supported in this browser');

    this.audioCtx = new AudioContextClass();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.audioCtx.onstatechange = () => {
      if (this.audioCtx && this.audioCtx.state === 'suspended' && this.isRunning) {
        this.audioCtx.resume().catch(() => {});
      }
    };

    if (config.audioSource === 'system_loopback') {
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
          this.mediaStream.getVideoTracks().forEach((t) => t.stop());
        } catch (displayErr) {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            },
            video: false
          });
        }
      } else {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      }
    } else {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: config.audioSource },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });
    }

    if (!this.mediaStream || this.mediaStream.getAudioTracks().length === 0) {
      throw new Error('No audio stream track found');
    }

    this.mediaStream.getAudioTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        console.log('[AudioVisualizer] Audio track ended (device switched or disconnected).');
        const activeTab = useUIStore.getState().studioSubTab;
        if (this.isRunning && activeTab === 'audio') {
          this.restartAudioStream();
        }
      });
      track.addEventListener('mute', () => {
        console.log('[AudioVisualizer] Audio track muted by OS.');
      });
      track.addEventListener('unmute', () => {
        console.log('[AudioVisualizer] Audio track unmuted by OS.');
      });
    });

    this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = config.audioSmoothing || 0.82;

    this.sourceNode.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.isRunning = true;
  }

  public stopAudioStream(): void {
    this.isRunning = false;
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
    this.frequencyBands.fill(0);
    this.peakBands.fill(0);
    this.bassEnergy = 0;
  }

  public async restartAudioStream(): Promise<void> {
    if (this.isRestartingAudio) return;
    this.isRestartingAudio = true;
    this.lastAudioRestartTime = performance.now();

    try {
      console.log('[AudioVisualizer] Seamlessly reconnecting audio capture stream...');
      this.stopAudioStream();
      await new Promise((resolve) => setTimeout(resolve, 200));

      const activeTab = useUIStore.getState().studioSubTab;
      const isGlobalRunning = useVisualizerStore.getState().config.isRunning;
      if (isGlobalRunning && activeTab === 'audio') {
        await this.startAudioStream();
        console.log('[AudioVisualizer] Audio capture reconnected successfully.');
      }
    } catch (err) {
      console.warn('[AudioVisualizer] Could not restart audio capture stream:', err);
    } finally {
      this.isRestartingAudio = false;
    }
  }

  public processAudioAnalysis(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    const tracks = this.mediaStream ? this.mediaStream.getAudioTracks() : [];
    const isEnded = tracks.length === 0 || tracks.some((t) => t.readyState === 'ended');
    if (isEnded && this.isRunning && !this.isRestartingAudio) {
      const now = performance.now();
      if (now - this.lastAudioRestartTime > 2500) {
        this.restartAudioStream();
        return;
      }
    }

// Perceptually spaced 16 frequency band boundaries across 128 FFT bins (from ~40Hz sub-bass to ~20kHz brilliance)
const LOG_BAND_BOUNDARIES: Array<[number, number]> = [
  [0, 2],    // Band 0:  0 - 375 Hz (Sub-Bass & Bass)
  [2, 3],    // Band 1:  375 - 562 Hz (Low Mids)
  [3, 4],    // Band 2:  562 - 750 Hz (Warmth)
  [4, 6],    // Band 3:  750 - 1125 Hz (Midrange)
  [6, 8],    // Band 4:  1.1k - 1.5k Hz
  [8, 11],   // Band 5:  1.5k - 2.0k Hz
  [11, 15],  // Band 6:  2.0k - 2.8k Hz (Presence)
  [15, 20],  // Band 7:  2.8k - 3.75k Hz
  [20, 26],  // Band 8:  3.75k - 4.8k Hz
  [26, 34],  // Band 9:  4.8k - 6.3k Hz (Treble)
  [34, 44],  // Band 10: 6.3k - 8.2k Hz
  [44, 56],  // Band 11: 8.2k - 10.5k Hz
  [56, 70],  // Band 12: 10.5k - 13.1k Hz (Air)
  [70, 86],  // Band 13: 13.1k - 16.1k Hz
  [86, 105], // Band 14: 16.1k - 19.6k Hz
  [105, 128] // Band 15: 19.6k - 24.0k Hz
];

    if (!this.analyser) return;

    const config = useVisualizerStore.getState().config;
    const targetSmoothing = config.audioSmoothing !== undefined ? config.audioSmoothing : 0.82;
    if (this.analyser.smoothingTimeConstant !== targetSmoothing) {
      this.analyser.smoothingTimeConstant = targetSmoothing;
    }

    this.analyser.getByteFrequencyData(this.dataArray as any);

    const now = performance.now();

    const levels: number[] = [];
    for (let i = 0; i < 16; i++) {
      const [start, end] = LOG_BAND_BOUNDARIES[i];
      let sum = 0;
      const count = end - start;
      for (let b = start; b < end; b++) {
        sum += this.dataArray[b];
      }
      const avg = (sum / count) * (config.audioSensitivity || 1.2);
      const val = Math.min(255, avg);
      this.frequencyBands[i] = val;
      levels.push(val);

      // Peak Hold indicator with smooth gravity decay (~250ms hold, then drop)
      if (val >= this.peakBands[i]) {
        this.peakBands[i] = val;
        this.peakHoldTimes[i] = now + 250;
      } else if (now > this.peakHoldTimes[i]) {
        this.peakBands[i] = Math.max(0, this.peakBands[i] - 5.0);
      }
    }
    useVisualizerStore.getState().setAudioLevels(levels);

    // Direct bass level (0..255)
    const b0 = this.frequencyBands[0] || 0;
    const b1 = this.frequencyBands[1] || 0;
    const b2 = this.frequencyBands[2] || 0;
    const b3 = this.frequencyBands[3] || 0;
    this.bassEnergy = Math.min(255, Math.max(b0 * 1.15, b1 * 1.05, b2 * 0.95, (b0 + b1 + b2 + b3) * 0.35));
  }

  private _bindDeviceEvents(): void {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === 'function') {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        if (this.deviceChangeDebounceTimer) {
          clearTimeout(this.deviceChangeDebounceTimer);
        }
        this.deviceChangeDebounceTimer = setTimeout(() => {
          this._checkAudioDeviceChange();
        }, 300);
      });
    }

    if (typeof window !== 'undefined') {
      setInterval(() => {
        this._checkAudioDeviceChange();
      }, 1200);
    }
  }

  private async _checkAudioDeviceChange(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const newSignature = devices.map((d) => `${d.deviceId}:${d.kind}:${d.label}:${d.groupId}`).join('|');
      if (this.lastAudioDeviceSignature && this.lastAudioDeviceSignature !== newSignature) {
        console.log('[AudioVisualizer] Windows audio device configuration changed.');
        this.lastAudioDeviceSignature = newSignature;
        const activeTab = useUIStore.getState().studioSubTab;
        const isGlobalRunning = useVisualizerStore.getState().config.isRunning;
        if (isGlobalRunning && activeTab === 'audio') {
          this.restartAudioStream();
        }
      } else if (!this.lastAudioDeviceSignature) {
        this.lastAudioDeviceSignature = newSignature;
      }
    } catch (e) {}
  }
}

export const audioAnalyzer = new AudioAnalyzer();
