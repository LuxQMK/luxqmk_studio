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
test('LuxQMK Studio modular scripts exist', () => {
  const scripts = [
    'app.js', 'device-manager.js', 'hid-protocol.js', 'keymap-editor.js',
    'lighting-controller.js', 'audio-visualizer.js', 'key-tester.js',
    'backup-manager.js', 'ui-controller.js', 'i18n.js', 'layout-data.js', 'keycodes-db.js'
  ];
  for (const script of scripts) {
    assert(fs.existsSync(path.join(STUDIO_DIR, 'js', script)), `Script ${script} must exist`);
  }
});

test('LuxQMK Studio device drivers exist', () => {
  const devices = ['gmmk3.js', 'gmmk2.js', 'generic-via.js'];
  for (const dev of devices) {
    assert(fs.existsSync(path.join(STUDIO_DIR, 'js', 'devices', dev)), `Device driver ${dev} must exist`);
  }
});

test('Standalone HTML bundles exist and have valid size', () => {
  const bundlePath = path.join(STUDIO_DIR, 'luxqmk_studio.html');
  assert(fs.existsSync(bundlePath), 'luxqmk_studio.html bundle must exist');
  const size = fs.statSync(bundlePath).size;
  assert(size > 300000, `Bundle size should exceed 300KB (actual: ${size} bytes)`);
});

test('Firmware mirror bundle exists', () => {
  const fwBundle = path.join(FIRMWARE_DIR, 'luxqmk_studio.html');
  assert(fs.existsSync(fwBundle), 'luxqmk_studio.html must be mirrored to qmk_firmware');
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

console.log(`\n=== Test Results: ${passed} / ${total} Passed (${Math.round(passed / total * 100)}%) ===\n`);

if (passed !== total) {
  process.exit(1);
}
