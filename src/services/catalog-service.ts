import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';

/**
 * LuxQMK Cloud Firmware Catalog & Studio Update Service
 * Connects to files.luxqmk.click CDN (and Cloudflare Pages fallbacks) to fetch:
 * 1. Global firmware catalog for connected keyboards (OTA firmware update detection).
 * 2. LuxQMK Studio version manifests (Desktop installer & Web app update detection).
 */

export interface CatalogKeyboardEntry {
  id: string;
  name: string;
  filename: string;
  version: string;
  release_tag: string;
  vendor_id?: string;
  product_id?: string;
  mcu: string;
  flasher: string;
  layout: string;
  tier: string;
  features: string[];
  file_size_bytes: number;
  sha256: string;
  download_url: string;
  latest_url?: string;
  studio_url?: string;
}

export interface FirmwareCatalog {
  version: string;
  release_tag: string;
  generated_at?: string;
  updated_at?: string;
  domain?: string;
  base_url?: string;
  total_keyboards: number;
  keyboards: CatalogKeyboardEntry[];
}

export interface StudioVersionInfo {
  version: string;
  release_tag: string;
  release_name?: string;
  release_date?: string;
  min_compatible_firmware?: string;
  changelog?: string[];
  downloads?: {
    windows_installer?: string;
    web_app?: string;
  };
  sha256?: string;
}

const FIRMWARE_CATALOG_URLS = [
  'https://files.luxqmk.click/firmware/catalog.json',
  'https://files.luxqmk.click/catalog.json',
  'https://luxqmk-firmware.pages.dev/firmware/catalog.json',
  'https://luxqmk-firmware.pages.dev/catalog.json',
];

const STUDIO_VERSION_URLS = [
  'https://files.luxqmk.click/studio/version.json',
  'https://files.luxqmk.click/studio/latest.json',
  'https://luxqmk-firmware.pages.dev/studio/version.json',
];

export function parseSemVer(v: string | number | null | undefined): [number, number, number] {
  if (v === null || v === undefined) return [0, 0, 0];
  const clean = String(v).replace(/^v/i, '').trim();
  const parts = clean.split('.').map((p) => parseInt(p, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function compareSemVer(
  v1: string | { major: number; minor: number; patch: number } | null | undefined,
  v2: string | { major: number; minor: number; patch: number } | null | undefined
): number {
  const [maj1, min1, pat1] = typeof v1 === 'object' && v1 !== null
    ? [v1.major || 0, v1.minor || 0, v1.patch || 0]
    : parseSemVer(v1);

  const [maj2, min2, pat2] = typeof v2 === 'object' && v2 !== null
    ? [v2.major || 0, v2.minor || 0, v2.patch || 0]
    : parseSemVer(v2);

  if (maj1 !== maj2) return maj1 - maj2;
  if (min1 !== min2) return min1 - min2;
  return pat1 - pat2;
}

export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return '';
}

class CatalogService {
  private cachedCatalog: FirmwareCatalog | null = null;
  private lastCatalogFetchTime = 0;
  private cachedStudioVersion: StudioVersionInfo | null = null;
  private lastStudioFetchTime = 0;
  private readonly CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

  /**
   * Fetches the global firmware catalog from files.luxqmk.click or Cloudflare Pages fallbacks.
   */
  async getCatalog(forceRefresh = false): Promise<FirmwareCatalog | null> {
    const now = Date.now();
    if (!forceRefresh && this.cachedCatalog && now - this.lastCatalogFetchTime < this.CACHE_TTL_MS) {
      return this.cachedCatalog;
    }

    for (const url of FIRMWARE_CATALOG_URLS) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const data: FirmwareCatalog = await res.json();
          if (data && Array.isArray(data.keyboards) && data.keyboards.length > 0) {
            this.cachedCatalog = data;
            this.lastCatalogFetchTime = now;
            return data;
          }
        }
      } catch (e) {
        // Continue to next mirror
      }
    }

    return this.cachedCatalog;
  }

  /**
   * Fetches the latest LuxQMK Studio version manifest from files.luxqmk.click or fallbacks.
   */
  async getStudioVersion(forceRefresh = false): Promise<StudioVersionInfo | null> {
    const now = Date.now();
    if (!forceRefresh && this.cachedStudioVersion && now - this.lastStudioFetchTime < this.CACHE_TTL_MS) {
      return this.cachedStudioVersion;
    }

    for (const url of STUDIO_VERSION_URLS) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const data: StudioVersionInfo = await res.json();
          if (data && data.version) {
            this.cachedStudioVersion = data;
            this.lastStudioFetchTime = now;
            return data;
          }
        }
      } catch (e) {
        // Continue to next mirror
      }
    }

    return this.cachedStudioVersion;
  }

  /**
   * Finds the best matching keyboard entry in the catalog for the currently connected device.
   */
  findMatchingEntry(
    catalog: FirmwareCatalog,
    vendorId: number | null,
    productId: number | null,
    productName?: string
  ): CatalogKeyboardEntry | null {
    if (!catalog || !catalog.keyboards || catalog.keyboards.length === 0) return null;

    const vidHex = vendorId !== null ? `0x${vendorId.toString(16).toUpperCase().padStart(4, '0')}` : null;
    const pidHex = productId !== null ? `0x${productId.toString(16).toUpperCase().padStart(4, '0')}` : null;

    // 1. Exact VID & PID Match
    if (vidHex && pidHex) {
      const match = catalog.keyboards.find((kb) => {
        if (!kb.vendor_id || !kb.product_id) return false;
        const kbVid = kb.vendor_id.toUpperCase();
        const kbPid = kb.product_id.toUpperCase();
        return kbVid === vidHex && kbPid === pidHex;
      });
      if (match) return match;
    }

    // 2. Normalized String Match
    if (productName) {
      const pNorm = productName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = catalog.keyboards.find((kb) => {
        const kNorm = kb.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const idNorm = kb.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        return pNorm.includes(kNorm) || kNorm.includes(pNorm) || pNorm.includes(idNorm);
      });
      if (match) return match;

      // 3. Keyword Heuristics
      const isGmmk3 = pNorm.includes('gmmk3') || (pNorm.includes('gmmk') && pNorm.includes('3'));
      const isGmmk2 = pNorm.includes('gmmk2') || (pNorm.includes('gmmk') && pNorm.includes('2'));
      const is100 = pNorm.includes('100') || pNorm.includes('full');
      const is75 = pNorm.includes('75');
      const is65 = pNorm.includes('65');
      const is96 = pNorm.includes('96');
      const isIso = pNorm.includes('iso') || pNorm.includes('uk') || pNorm.includes('de') || pNorm.includes('nordic');

      if (isGmmk3) {
        if (is100) return catalog.keyboards.find((k) => k.id.includes('gmmk3') && (k.id.includes('100') || k.id.includes('p100')) && k.id.includes(isIso ? 'iso' : 'ansi')) || null;
        if (is75) return catalog.keyboards.find((k) => k.id.includes('gmmk3') && (k.id.includes('75') || k.id.includes('p75')) && k.id.includes(isIso ? 'iso' : 'ansi')) || null;
        if (is65) return catalog.keyboards.find((k) => k.id.includes('gmmk3') && (k.id.includes('65') || k.id.includes('p65')) && k.id.includes(isIso ? 'iso' : 'ansi')) || null;
      }
      if (isGmmk2) {
        if (is96) return catalog.keyboards.find((k) => k.id.includes('gmmk2') && (k.id.includes('96') || k.id.includes('p96')) && k.id.includes(isIso ? 'iso' : 'ansi')) || null;
        if (is65) return catalog.keyboards.find((k) => k.id.includes('gmmk2') && (k.id.includes('65') || k.id.includes('p65')) && k.id.includes(isIso ? 'iso' : 'ansi')) || null;
      }
    }

    return null;
  }

  /**
   * Checks if the catalog has a newer firmware version than currently running on the keyboard.
   */
  hasNewerFirmwareVersion(
    currentFw: { major: number; minor: number; patch: number } | null | undefined,
    cloudEntry: CatalogKeyboardEntry
  ): boolean {
    if (!currentFw || !cloudEntry) return false;
    return compareSemVer(cloudEntry.version, currentFw) > 0;
  }

  /**
   * Checks if a newer LuxQMK Studio version is available.
   */
  hasNewerStudioVersion(currentStudioVersion: string, cloudStudio: StudioVersionInfo): boolean {
    if (!currentStudioVersion || !cloudStudio || !cloudStudio.version) return false;
    return compareSemVer(cloudStudio.version, currentStudioVersion) > 0;
  }

  /**
   * Downloads a firmware binary directly from files.luxqmk.click into a local File object ready for flasher.
   * Performs SHA-256 integrity validation if checksum is provided in manifest.
   */
  async downloadFirmwareFile(entry: CatalogKeyboardEntry): Promise<{ file: File; sha256: string; verified: boolean }> {
    const downloadUrl = entry.download_url || entry.latest_url;
    if (!downloadUrl) {
      throw new Error('Missing download URL in catalog entry');
    }

    const res = await fetch(downloadUrl, { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`Failed to download firmware binary (${res.status} ${res.statusText})`);
    }

    const arrayBuf = await res.arrayBuffer();
    const calculatedHash = await computeSha256(arrayBuf);
    const expectedHash = (entry.sha256 || '').trim().toLowerCase();

    const verified = Boolean(expectedHash && calculatedHash && calculatedHash.toLowerCase() === expectedHash);

    const blob = new Blob([arrayBuf], { type: 'application/octet-stream' });
    const file = new File([blob], entry.filename, { type: 'application/octet-stream' });

    return {
      file,
      sha256: calculatedHash,
      verified,
    };
  }
}

export const catalogService = new CatalogService();


