import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';

/**
 * LuxQMK Cloud Firmware Catalog Service
 * Connects to GitHub Releases API (and optionally browse.luxqmk.click) to fetch firmware releases,
 * match connected keyboard profiles, detect available OTA updates, and download binaries.
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
  studio_url: string;
}

export interface FirmwareCatalog {
  version: string;
  release_tag: string;
  updated_at: string;
  portal_url: string;
  api_url: string;
  github_repo: string;
  total_keyboards: number;
  keyboards: CatalogKeyboardEntry[];
}

const PRIMARY_CATALOG_URL = 'https://browse.luxqmk.click/catalog.json';
const FALLBACK_GITHUB_API = 'https://api.github.com/repos/LuxQMK/qmk_firmware/releases/latest';

class CatalogService {
  private cachedCatalog: FirmwareCatalog | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Fetches the global firmware catalog from GitHub Releases API or primary catalog.
   */
  async getCatalog(forceRefresh = false): Promise<FirmwareCatalog | null> {
    const now = Date.now();
    if (!forceRefresh && this.cachedCatalog && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedCatalog;
    }

    try {
      // 1. Try primary browse.luxqmk.click catalog endpoint if available
      const res = await fetch(PRIMARY_CATALOG_URL, { cache: 'no-cache' });
      if (res.ok) {
        const data: FirmwareCatalog = await res.json();
        this.cachedCatalog = data;
        this.lastFetchTime = now;
        return data;
      }
    } catch {
      // Standalone website not yet deployed or unreachable — use GitHub Releases API
    }

    try {
      // 2. Fetch directly from GitHub Releases API
      const res = await fetch(FALLBACK_GITHUB_API);
      if (res.ok) {
        const release = await res.json();

        // Check if catalog.json was explicitly attached
        const catalogAsset = release.assets?.find((a: any) => a.name === 'catalog.json');
        if (catalogAsset?.browser_download_url) {
          try {
            const catRes = await fetch(catalogAsset.browser_download_url);
            if (catRes.ok) {
              const data: FirmwareCatalog = await catRes.json();
              this.cachedCatalog = data;
              this.lastFetchTime = now;
              return data;
            }
          } catch {
            // fallback to asset synthesizing
          }
        }

        // Synthesize catalog directly from GitHub Release binary assets
        if (release.assets && Array.isArray(release.assets)) {
          const synthesized = this.synthesizeCatalogFromRelease(release);
          this.cachedCatalog = synthesized;
          this.lastFetchTime = now;
          return synthesized;
        }
      }
    } catch (e) {
      console.error('Failed to fetch cloud firmware catalog from GitHub Releases:', e);
    }

    return this.cachedCatalog;
  }

  /**
   * Synthesizes a structured firmware catalog directly from GitHub Release assets.
   */
  private synthesizeCatalogFromRelease(release: any): FirmwareCatalog {
    const tag = release.tag_name || 'v0.3.1';
    const binaryAssets = (release.assets || []).filter((a: any) => {
      const name = (a.name || '').toLowerCase();
      return name.endsWith('.bin') || name.endsWith('.hex') || name.endsWith('.uf2');
    });

    const keyboards: CatalogKeyboardEntry[] = binaryAssets.map((asset: any) => {
      const fn = asset.name.toLowerCase();

      // Find matching device descriptor from built-in database
      const matchedDesc = ALL_DEVICE_DESCRIPTORS.find((d) => {
        if (fn.includes('gmmk3') && fn.includes('100') && d.id.includes('gmmk3-100')) return true;
        if (fn.includes('gmmk3') && fn.includes('75') && d.id.includes('gmmk3-75')) return true;
        if (fn.includes('gmmk3') && fn.includes('65') && d.id.includes('gmmk3-65')) return true;
        if (fn.includes('gmmk2') && fn.includes('96') && d.id.includes('gmmk2-96')) return true;
        if (fn.includes('gmmk2') && fn.includes('65') && d.id.includes('gmmk2-65')) return true;
        return false;
      });

      const id = matchedDesc?.id || asset.name.replace(/\.(bin|hex|uf2)$/i, '');
      const name = matchedDesc?.name || asset.name.replace(/_via\.(bin|hex|uf2)$/i, '').replace(/_/g, ' ').toUpperCase();
      const mcu = matchedDesc?.mcu || (fn.endsWith('.hex') ? 'ATmega32U4' : 'ARM Cortex-M4');
      const flasher = fn.includes('gmmk') ? 'wb32-dfu-updater_cli' : 'dfu-util';
      const vidHex = matchedDesc?.vendorId ? `0x${matchedDesc.vendorId.toString(16).toUpperCase()}` : undefined;
      const pidHex = matchedDesc?.productId ? `0x${matchedDesc.productId.toString(16).toUpperCase()}` : undefined;

      return {
        id,
        name,
        filename: asset.name,
        version: tag,
        release_tag: tag,
        vendor_id: vidHex,
        product_id: pidHex,
        mcu,
        flasher,
        layout: matchedDesc?.layout || 'ANSI',
        tier: 'LuxQMK Dual-Layer Reactive',
        features: ['RGB Matrix', 'Reactive Lighting', 'WebHID VIA', 'Full NKRO', 'Hardware Debounce'],
        file_size_bytes: asset.size || 0,
        sha256: '',
        download_url: asset.browser_download_url,
        studio_url: `https://studio.luxqmk.click/#/settings?flash=${encodeURIComponent(asset.name)}`,
      };
    });

    return {
      version: tag,
      release_tag: tag,
      updated_at: release.published_at || new Date().toISOString(),
      portal_url: 'https://browse.luxqmk.click',
      api_url: FALLBACK_GITHUB_API,
      github_repo: 'LuxQMK/qmk_firmware',
      total_keyboards: keyboards.length,
      keyboards,
    };
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

    const vidHex = vendorId !== null ? `0x${vendorId.toString(16).toUpperCase()}` : null;
    const pidHex = productId !== null ? `0x${productId.toString(16).toUpperCase()}` : null;

    // 1. Exact VID & PID Match
    if (vidHex && pidHex) {
      const match = catalog.keyboards.find(
        (kb) =>
          kb.vendor_id?.toUpperCase() === vidHex &&
          kb.product_id?.toUpperCase() === pidHex
      );
      if (match) return match;
    }

    // 2. Fallback: Fuzzy Name Match (e.g., GMMK 3, GMMK 2, Keychron)
    if (productName) {
      const pLower = productName.toLowerCase();
      const nameMatch = catalog.keyboards.find((kb) => {
        const kLower = kb.name.toLowerCase();
        if (pLower.includes('100') && kLower.includes('100') && pLower.includes('gmmk 3') && kLower.includes('gmmk 3')) return true;
        if (pLower.includes('75') && kLower.includes('75') && pLower.includes('gmmk 3') && kLower.includes('gmmk 3')) return true;
        if (pLower.includes('65') && kLower.includes('65') && pLower.includes('gmmk 3') && kLower.includes('gmmk 3')) return true;
        if (pLower.includes('96') && kLower.includes('96') && pLower.includes('gmmk 2') && kLower.includes('gmmk 2')) return true;
        if (pLower.includes('65') && kLower.includes('65') && pLower.includes('gmmk 2') && kLower.includes('gmmk 2')) return true;
        return false;
      });
      if (nameMatch) return nameMatch;
    }

    return null;
  }

  /**
   * Checks if the catalog has a newer firmware version than currently running on the keyboard.
   */
  hasNewerVersion(currentFw: { major: number; minor: number; patch: number } | null, cloudEntry: CatalogKeyboardEntry): boolean {
    if (!currentFw) return false;
    const cloudVersionStr = cloudEntry.version.replace(/^v/, '');
    const parts = cloudVersionStr.split('.').map(Number);
    const [cMajor = 0, cMinor = 0, cPatch = 0] = parts;

    if (cMajor > currentFw.major) return true;
    if (cMajor === currentFw.major && cMinor > currentFw.minor) return true;
    if (cMajor === currentFw.major && cMinor === currentFw.minor && cPatch > currentFw.patch) return true;

    return false;
  }

  /**
   * Downloads a firmware binary directly from the cloud repository into a local File object ready for flasher.
   */
  async downloadFirmwareFile(entry: CatalogKeyboardEntry): Promise<File> {
    const res = await fetch(entry.download_url);
    if (!res.ok) {
      throw new Error(`Failed to download firmware (${res.status} ${res.statusText})`);
    }
    const blob = await res.blob();
    const file = new File([blob], entry.filename, { type: 'application/octet-stream' });
    return file;
  }
}

export const catalogService = new CatalogService();

