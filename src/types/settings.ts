/**
 * Device Settings, Performance, Diagnostics & Flasher Types
 */

export interface PerformanceConfig {
  debounceType: number; // 0=Symmetric Defer, 1=Asymmetric Eager, 2=Symmetric Eager
  debounceTimeMs: number; // 0, 2, 5, 8, 16
  nkroEnabled: boolean;
  pollingRateHz: number; // 125, 500, 1000, 2000, 4000, 8000
}

export interface HardwareInfo {
  keyboardModel: string;
  mcuChip: string;
  usbVidPid: string;
  protocolVersion: string;
  matrixLayout: string;
  eepromSize: string;
  compatibilityStatus: string;
}

export interface StudioUpdateState {
  isChecking: boolean;
  available: boolean;
  isDownloading: boolean;
  downloadPercent: number;
  downloadSpeedText: string;
  isDownloaded: boolean;
  error: string | null;
  currentVersion: string;
  latestVersion: string;
  releaseTag: string;
  releaseDate: string;
  downloadUrl: string;
  webAppUrl: string;
  changelog: string[];
}

export interface FlasherState {
  file: File | null;
  filePath?: string;
  fileName: string;
  fileSizeText: string;
  currentStep: number; // 0=idle, 1=auto-backup, 2=bootloader, 3=flash-write, 4=auto-restore, 5=complete
  progressPercent: number;
  statusLabel: string;
  isFlashing: boolean;
  isCheckingCloud: boolean;
  isDownloadingCloud: boolean;
  cloudUpdateAvailable: boolean;
  cloudEntry: any | null;
  consoleLogs: Array<{ time: string; text: string; isError?: boolean }>;
}

