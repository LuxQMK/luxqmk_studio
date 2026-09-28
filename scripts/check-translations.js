const fs = require('fs');
const path = require('path');

function loadLocale(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/import\s+type[\s\S]*?;/g, '');
  content = content.replace(/export const (en|pl)[^=]*=/, 'module.exports =');
  content = content.replace(/} as const;[\s\S]*$/, '};');
  content = content.replace(/export type[\s\S]*$/, '');
  const tempPath = path.join(__dirname, 'temp-' + path.basename(filePath) + '.cjs');
  fs.writeFileSync(tempPath, content);
  const data = require(tempPath);
  fs.unlinkSync(tempPath);
  return data;
}

const en = loadLocale(path.join(__dirname, '../src/i18n/locales/en.ts'));
const pl = loadLocale(path.join(__dirname, '../src/i18n/locales/pl.ts'));

const enKeys = new Set(Object.keys(en));
const plKeys = new Set(Object.keys(pl));

console.log(`Total EN keys: ${enKeys.size}`);
console.log(`Total PL keys: ${plKeys.size}`);

// Check symmetry
const enOnly = [...enKeys].filter(k => !plKeys.has(k));
const plOnly = [...plKeys].filter(k => !enKeys.has(k));

if (enOnly.length > 0) console.log('Keys in EN but not in PL:', enOnly);
if (plOnly.length > 0) console.log('Keys in PL but not in EN:', plOnly);

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(full)) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(path.join(__dirname, '../src'));
const missingEn = new Map();
const missingPl = new Map();

for (const file of files) {
  if (file.includes('i18n')) continue;
  const code = fs.readFileSync(file, 'utf8');
  
  const regex1 = /\bt\(\s*['"`]([a-zA-Z0-9_]+)['"`]/g;
  let m;
  while ((m = regex1.exec(code)) !== null) {
    const key = m[1];
    if (!enKeys.has(key)) {
      if (!missingEn.has(key)) missingEn.set(key, []);
      missingEn.get(key).push({ file, match: m[0] });
    }
    if (!plKeys.has(key)) {
      if (!missingPl.has(key)) missingPl.set(key, []);
      missingPl.get(key).push({ file, match: m[0] });
    }
  }
}

console.log('\n--- Missing in EN ---');
for (const [k, fl] of missingEn) {
  console.log(`${k} (in ${fl.map(f => path.basename(f.file)).join(', ')})`);
}

console.log('\n--- Missing in PL ---');
for (const [k, fl] of missingPl) {
  console.log(`${k} (in ${fl.map(f => path.basename(f.file)).join(', ')})`);
}
