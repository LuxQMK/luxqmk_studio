/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

interface Window {
  electronAPI?: {
    isDesktop: boolean;
    getAutostart: () => Promise<boolean>;
    setAutostart: (enable: boolean) => Promise<boolean>;
    minimizeToTray: () => void;
    getDesktopSources: () => Promise<Array<{ id: string; name: string }>>;
    getAppDataPath: () => Promise<string>;
    openAppDataFolder: () => Promise<string>;
    saveUserConfig: (cfg: any) => Promise<{ success: boolean; path?: string; error?: string }>;
    loadUserConfig: () => Promise<any>;
    openExternal: (url: string) => Promise<boolean>;
    onAutostartChanged: (callback: (enabled: boolean) => void) => () => void;
    getFlasherToolsStatus: () => Promise<{ wb32Available: boolean; wb32Path?: string; dfuUtilAvailable: boolean; dfuUtilPath?: string }>;
    selectFirmwareFile: () => Promise<{ filePath: string; fileName: string; fileSize: number; extension: string } | null>;
    savePreflashBackup: (snapshot: any) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    loadPreflashBackup: () => Promise<any>;
    saveTempFirmware: (params: { fileName: string; buffer: ArrayBuffer | Uint8Array }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    flashFirmware: (params: { filePath: string; toolType?: string }) => Promise<{ success: boolean; error?: string; timeout?: boolean }>;
    cancelFlash: () => Promise<{ success: boolean; error?: string }>;
    onFlasherProgress: (callback: (data: { percent: number; phase: string; log: string }) => void) => () => void;
    checkForStudioUpdates: () => Promise<{ success: boolean; updateInfo?: any; error?: string }>;
    downloadStudioUpdate: () => Promise<{ success: boolean; error?: string }>;
    quitAndInstallStudioUpdate: () => Promise<{ success: boolean }>;
    setAllowPrerelease: (enabled: boolean) => Promise<{ success: boolean; allowPrerelease: boolean }>;
    getAllowPrerelease: () => Promise<boolean>;
    onUpdateStatus: (callback: (data: { status: string; percent?: number; bytesPerSecond?: number; transferred?: number; total?: number; version?: string; releaseDate?: string; releaseNotes?: any; error?: string }) => void) => () => void;
  };
}
