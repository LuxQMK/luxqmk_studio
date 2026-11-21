import { useEffect, useState } from 'react';
import { ChangelogRelease } from '../data/changelog';
import { FIRMWARE_CHANGELOG } from '../data/firmwareChangelog';

const GITHUB_RAW_FW_MASTER = [
  'https://raw.githubusercontent.com/LuxQMK/qmk_firmware/master/CHANGELOG.md',
  'https://raw.githubusercontent.com/LuxQMK/LuxQMK/master/qmk_firmware/CHANGELOG.md',
];

/**
 * Parses Keep-a-Changelog formatted markdown into structured release objects.
 */
export function parseMarkdownChangelog(raw: string): ChangelogRelease[] {
  if (!raw || typeof raw !== 'string') return [];

  const lines = raw.split(/\r?\n/);
  const releases: ChangelogRelease[] = [];
  let currentRelease: ChangelogRelease | null = null;
  let currentSection = 'General';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## [')) {
      if (currentRelease) {
        releases.push(currentRelease);
      }
      const header = trimmed.slice(3).trim();
      const verEnd = header.indexOf(']');
      const ver = verEnd !== -1 ? header.slice(1, verEnd) : header;
      const datePart = verEnd !== -1 ? header.slice(verEnd + 1).replace(/^[\s-]+/, '').trim() : '';

      currentRelease = {
        version: ver,
        date: datePart,
        sections: {},
        bullets: [],
      };
      currentSection = 'General';
    } else if (trimmed.startsWith('### ') && currentRelease) {
      currentSection = trimmed.slice(4).trim();
      if (!currentRelease.sections[currentSection]) {
        currentRelease.sections[currentSection] = [];
      }
    } else if (trimmed.startsWith('- ') && currentRelease) {
      const bullet = trimmed.slice(2).trim();
      if (!currentRelease.sections[currentSection]) {
        currentRelease.sections[currentSection] = [];
      }
      currentRelease.sections[currentSection].push(bullet);
      currentRelease.bullets.push(`[${currentSection}] ${bullet}`);
    }
  }

  if (currentRelease) {
    releases.push(currentRelease);
  }

  return releases;
}

/**
 * Fetches the latest firmware CHANGELOG.md from GitHub master with fallback to bundled entries.
 */
export async function fetchLiveFirmwareChangelog(): Promise<ChangelogRelease[] | null> {
  for (const url of GITHUB_RAW_FW_MASTER) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const text = await res.text();
      const parsed = parseMarkdownChangelog(text);
      if (parsed.length > 0) return parsed;
    } catch {
      // Try next mirror or fall back to bundled changelog.
    }
  }
  return null;
}

/**
 * React hook providing bundled firmware release notes immediately and refreshing from GitHub master.
 */
export function useLiveFirmwareChangelog(): ChangelogRelease[] {
  const [entries, setEntries] = useState<ChangelogRelease[]>(FIRMWARE_CHANGELOG);

  useEffect(() => {
    let active = true;
    fetchLiveFirmwareChangelog().then((live) => {
      if (active && live && live.length > 0) {
        setEntries(live);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return entries;
}
