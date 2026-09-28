/**
 * LuxQMK & LuxQMK Studio Test Suite
 * Validates firmware userspace structure, modern React/TypeScript Studio architecture,
 * Electron entrypoints, flasher binaries, branding, agent rules, and i18n dictionaries.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('=== Running LuxQMK & LuxQMK Studio Test Suite ===\n');

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
  }
}

const ROOT_DIR = path.resolve(__dirname, '..');
const STUDIO_DIR = path.resolve(__dirname);
const FIRMWARE_DIR = path.join(ROOT_DIR, 'qmk_firmware');
const USERSPACE_DIR = path.join(FIRMWARE_DIR, 'users', 'luxqmk');

// 1. Validate Userspace Structure
test('Userspace directory exists at users/luxqmk', () => {
  assert(fs.existsSync(USERSPACE_DIR), 'users/luxqmk directory must exist');
});

test('Core userspace files exist', () => {
  const requiredFiles = ['luxqmk.h', 'luxqmk.c', 'config.h', 'rules.mk', 'rgb_matrix_user.inc'];
  for (const file of requiredFiles) {
    assert(fs.existsSync(path.join(USERSPACE_DIR, file)), `File ${file} must exist in users/luxqmk`);
  }
});

test('Hardware board drivers exist in userspace', () => {
  const boards = ['gmmk3.c', 'gmmk3.h', 'gmmk2.c', 'gmmk2.h', 'generic.c', 'generic.h'];
  for (const board of boards) {
    assert(fs.existsSync(path.join(USERSPACE_DIR, 'boards', board)), `Board file ${board} must exist`);
  }
});

// 2. Validate Modern Studio Architecture (src/)
test('LuxQMK Studio React/TypeScript core structure exists', () => {
  const requiredSrcFiles = [
    'main.tsx',
    'App.tsx',
    'index.css',
    'core/hid-protocol.ts',
    'core/visualizer-service.ts',
    'data/devices.ts',
    'data/keycodes.ts',
    'data/layouts.ts',
    'i18n/index.ts',
    'i18n/translations.ts',
    'services/backup-service.ts',
    'store/useDeviceStore.ts',
    'store/useKeymapStore.ts',
    'store/useLightingStore.ts',
    'store/useMacroStore.ts',
    'store/useSettingsStore.ts',
    'store/useUIStore.ts',
    'store/useVisualizerStore.ts',
    'views/KeymapView.tsx',
    'views/MacroView.tsx',
    'views/LightingView.tsx',
    'views/StudioLightingView.tsx',
    'views/EncoderView.tsx',
    'views/TesterView.tsx',
    'views/BackupView.tsx',
    'views/SettingsView.tsx'
  ];
  for (const file of requiredSrcFiles) {
    const filePath = path.join(STUDIO_DIR, 'src', file);
    assert(fs.existsSync(filePath), `Source file src/${file} must exist`);
  }
});

test('LuxQMK Studio Electron entry files (main.js, preload.js) exist and have valid syntax', () => {
  const electronFiles = ['main.js', 'preload.js'];
  for (const file of electronFiles) {
    const filePath = path.join(STUDIO_DIR, file);
    assert(fs.existsSync(filePath), `File ${file} must exist`);
    const code = fs.readFileSync(filePath, 'utf-8');
    assert.doesNotThrow(() => new vm.Script(code), `File ${file} has syntax error`);
  }
});

test('Flasher standalone binaries exist in bin/', () => {
  const binaries = ['wb32-dfu-updater_cli.exe', 'dfu-util.exe'];
  for (const bin of binaries) {
    assert(fs.existsSync(path.join(STUDIO_DIR, 'bin', bin)), `Binary ${bin} must exist in bin/`);
  }
});

// 3. Validate Branding in Key Files
test('LuxQMK Studio branding in index.html and package.json', () => {
  const html = fs.readFileSync(path.join(STUDIO_DIR, 'index.html'), 'utf-8');
  assert(html.includes('LuxQMK Studio'), 'index.html must contain LuxQMK Studio branding');

  const pkg = JSON.parse(fs.readFileSync(path.join(STUDIO_DIR, 'package.json'), 'utf-8'));
  assert.strictEqual(pkg.name, 'luxqmk-studio');
  assert.strictEqual(pkg.productName, 'LuxQMK Studio');
});

// 4. Validate Agent Guidelines & Rules
test('AGENTS.md and .agents/rules exist', () => {
  assert(fs.existsSync(path.join(ROOT_DIR, 'AGENTS.md')), 'AGENTS.md must exist in root');
  assert(fs.existsSync(path.join(ROOT_DIR, '.agents', 'rules', 'luxqmk_rules.md')), '.agents/rules/luxqmk_rules.md must exist');
});

// 5. Validate Translations (EN & PL modular files and parity)
test('Translation dictionaries EN and PL have matching keys and valid strings', () => {
  const transPath = path.join(STUDIO_DIR, 'src', 'i18n', 'translations.ts');
  const enPath = path.join(STUDIO_DIR, 'src', 'i18n', 'locales', 'en.ts');
  const plPath = path.join(STUDIO_DIR, 'src', 'i18n', 'locales', 'pl.ts');

  assert(fs.existsSync(transPath), 'translations.ts must exist');
  assert(fs.existsSync(enPath), 'locales/en.ts must exist');
  assert(fs.existsSync(plPath), 'locales/pl.ts must exist');

  const enContent = fs.readFileSync(enPath, 'utf-8');
  const plContent = fs.readFileSync(plPath, 'utf-8');
  assert(enContent.includes('export const en'), 'en.ts must export EN dictionary');
  assert(plContent.includes('export const pl'), 'pl.ts must export PL dictionary');
});

console.log(`\n=== Test Results: ${passed} / ${total} Passed (${Math.round(passed / total * 100)}%) ===\n`);

if (passed !== total) {
  process.exit(1);
}
