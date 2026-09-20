/**
 * LuxQMK & LuxQMK Studio Test Suite
 * Validates file structure, branding, English comments, and bundle integrity.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

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

test('Hardware board drivers exist', () => {
  const boards = ['gmmk3.c', 'gmmk3.h', 'gmmk2.c', 'gmmk2.h', 'generic.c', 'generic.h'];
  for (const board of boards) {
    assert(fs.existsSync(path.join(USERSPACE_DIR, 'boards', board)), `Board file ${board} must exist`);
  }
});

// 2. Validate Studio Application Structure
test('LuxQMK Studio modular scripts exist and have valid syntax', () => {
  const vm = require('vm');
  const scripts = [
    'app.js', 'device-manager.js', 'hid-protocol.js', 'keymap-editor.js',
    'lighting-controller.js', 'audio-visualizer.js', 'studio-lighting.js', 'key-tester.js',
    'backup-manager.js', 'macro-manager.js', 'firmware-flasher.js', 'ui-controller.js', 'i18n.js', 'layout-data.js', 'keycodes-db.js'
  ];
  for (const script of scripts) {
    const filePath = path.join(STUDIO_DIR, 'js', script);
    assert(fs.existsSync(filePath), `Script ${script} must exist`);
    const code = fs.readFileSync(filePath, 'utf-8');
    assert.doesNotThrow(() => new vm.Script(code), `Script ${script} has syntax error`);
  }
});

test('LuxQMK Studio device drivers exist', () => {
  const devices = ['gmmk3.js', 'gmmk2.js', 'generic-via.js'];
  for (const dev of devices) {
    assert(fs.existsSync(path.join(STUDIO_DIR, 'js', 'devices', dev)), `Device driver ${dev} must exist`);
  }
});

test('Flasher standalone binaries exist in bin/', () => {
  const binaries = ['wb32-dfu-updater_cli.exe', 'dfu-util.exe'];
  for (const bin of binaries) {
    assert(fs.existsSync(path.join(STUDIO_DIR, 'bin', bin)), `Binary ${bin} must exist in bin/`);
  }
});

test('Standalone HTML bundles exist and have valid size', () => {
  const bundlePath = path.join(STUDIO_DIR, 'luxqmk_studio.html');
  assert(fs.existsSync(bundlePath), 'luxqmk_studio.html bundle must exist');
  const size = fs.statSync(bundlePath).size;
  assert(size > 300000, `Bundle size should exceed 300KB (actual: ${size} bytes)`);
});

test('Alias bundle exists and has valid size', () => {
  const aliasBundle = path.join(STUDIO_DIR, 'gmmk_studio.html');
  assert(fs.existsSync(aliasBundle), 'gmmk_studio.html bundle must exist in luxqmk-studio');
  const size = fs.statSync(aliasBundle).size;
  assert(size > 300000, `Alias bundle size should exceed 300KB (actual: ${size} bytes)`);
});

// 3. Validate Branding in Key Files
test('LuxQMK Studio branding in index.html', () => {
  const html = fs.readFileSync(path.join(STUDIO_DIR, 'index.html'), 'utf-8');
  assert(html.includes('LuxQMK Studio'), 'index.html must contain LuxQMK Studio branding');
});

test('LuxQMK Studio branding in package.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(STUDIO_DIR, 'package.json'), 'utf-8'));
  assert.strictEqual(pkg.name, 'luxqmk-studio');
  assert.strictEqual(pkg.productName, 'LuxQMK Studio');
});

// 4. Validate Agent Rules
test('AGENTS.md and .agents/rules exist', () => {
  assert(fs.existsSync(path.join(ROOT_DIR, 'AGENTS.md')), 'AGENTS.md must exist in root');
  assert(fs.existsSync(path.join(ROOT_DIR, '.agents', 'rules', 'luxqmk_rules.md')), '.agents/rules/luxqmk_rules.md must exist');
});

// 5. Validate i18n Translation Completeness
test('100% of HTML data-i18n keys are translated in EN and PL dictionaries', () => {
  const vm = require('vm');
  const html = fs.readFileSync(path.join(STUDIO_DIR, 'index.html'), 'utf8');
  const i18nJs = fs.readFileSync(path.join(STUDIO_DIR, 'js', 'i18n.js'), 'utf8');
  const regex = /data-i18n="([^"]+)"/g;
  let match;
  const htmlKeys = new Set();
  while ((match = regex.exec(html)) !== null) {
    htmlKeys.add(match[1]);
  }
  const sandbox = { window: {}, document: { documentElement: {}, addEventListener: () => {}, querySelectorAll: () => [] }, localStorage: { getItem: () => null, setItem: () => {} } };
  vm.createContext(sandbox);
  vm.runInContext(i18nJs, sandbox);
  const inst = sandbox.window.i18n;
  inst.setLang('en');
  const missingEn = [];
  for (const k of htmlKeys) {
    if (inst.t(k) === k) missingEn.push(k);
  }
  inst.setLang('pl');
  const missingPl = [];
  for (const k of htmlKeys) {
    if (inst.t(k) === k) missingPl.push(k);
  }
  assert.strictEqual(missingEn.length, 0, `Missing EN keys: ${missingEn.join(', ')}`);
  assert.strictEqual(missingPl.length, 0, `Missing PL keys: ${missingPl.join(', ')}`);
});

// 6. Validate MacroManager Bytecode Encoding & Decoding
test('MacroManager encodes and decodes QMK send_string bytecode correctly', () => {
  const vm = require('vm');
  const macroJs = fs.readFileSync(path.join(STUDIO_DIR, 'js', 'macro-manager.js'), 'utf8');
  const sandbox = { window: {}, document: { getElementById: () => null, querySelectorAll: () => [] }, localStorage: { getItem: () => null, setItem: () => {} } };
  vm.createContext(sandbox);
  vm.runInContext(macroJs, sandbox);
  const manager = new sandbox.window.MacroManager();

  // Test 1: Delay and taps
  const inputStr = "{1484ms}{KC_A}{472ms}{KC_S}{430ms}{KC_D}";
  const encoded = manager.encodeMacroBuffer([{ id: 0, text: inputStr }], 64);

  // Expected bytes for {1484ms}: 0x01, 0x04, '1', '4', '8', '4', '|' (0x7C)
  // Expected bytes for {KC_A}: 0x01, 0x01, 0x04 (KC_A is 4)
  // Expected bytes for {472ms}: 0x01, 0x04, '4', '7', '2', '|' (0x7C)
  // Expected bytes for {KC_S}: 0x01, 0x01, 0x16 (KC_S is 22)
  // Expected bytes for {430ms}: 0x01, 0x04, '4', '3', '0', '|' (0x7C)
  // Expected bytes for {KC_D}: 0x01, 0x01, 0x07 (KC_D is 7)
  // Terminating null: 0x00
  const expectedPrefix = [
    0x01, 0x04, 0x31, 0x34, 0x38, 0x34, 0x7C,
    0x01, 0x01, 0x04,
    0x01, 0x04, 0x34, 0x37, 0x32, 0x7C,
    0x01, 0x01, 0x16,
    0x01, 0x04, 0x34, 0x33, 0x30, 0x7C,
    0x01, 0x01, 0x07,
    0x00
  ];

  for (let i = 0; i < expectedPrefix.length; i++) {
    assert.strictEqual(encoded[i], expectedPrefix[i], `Byte mismatch at index ${i}: got 0x${encoded[i].toString(16)} expected 0x${expectedPrefix[i].toString(16)}`);
  }

  // Test roundtrip decoding
  const decoded = manager.decodeMacroBuffer(encoded, 1);
  assert.strictEqual(decoded[0], inputStr, `Roundtrip decoded mismatch: got "${decoded[0]}" expected "${inputStr}"`);
});

console.log(`\n=== Test Results: ${passed} / ${total} Passed (${Math.round(passed / total * 100)}%) ===\n`);

if (passed !== total) {
  process.exit(1);
}
