#!/usr/bin/env node
/**
 * One-shot UI color tokenization for Patient views/components.
 * Presentation only — does not touch store/api/controllers.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TARGETS = [
  path.join(ROOT, 'src/views'),
  path.join(ROOT, 'src/components'),
];

/** Hex (any case) → colors token name */
const HEX_TO_TOKEN = new Map(
  Object.entries({
    '#000000': 'ink',
    '#000': 'ink',
    '#1F1F1F': 'ink',
    '#181C1B': 'ink',
    '#0F172A': 'ink',
    '#595959': 'muted',
    '#404946': 'muted',
    '#64748B': 'muted',
    '#707976': 'outline',
    '#8A8A8A': 'outline',
    '#BF C9C5': null, // skip broken
    '#BFC9C5': 'outlineVariant',
    '#E6E6E6': 'outlineVariant',
    '#DDDFE2': 'outlineVariant',
    '#E0E3E1': 'outlineVariant',
    '#F5F6F7': 'page',
    '#FAFAFA': 'surfaceContainerLow',
    '#F2F2F2': 'surfaceVariant',
    '#FFFFFF': 'card',
    '#FFF': 'card',
    '#2A7BA3': 'primary',
    '#276F93': 'primaryOutline',
    '#2186BD': 'primary',
    '#17739F': 'link',
    '#3AA9E0': 'secondary',
    '#5CCEF7': 'iconFill',
    '#2E9AD1': 'iconFill',
    '#E6F5FE': 'primaryContainer',
    '#B9D4E2': 'primaryFixedDim',
    '#0F7A4E': 'success',
    '#059669': 'success',
    '#047857': 'success',
    '#E9F5EF': 'successContainer',
    '#A3231A': 'error',
    '#BA1A1A': 'error',
    '#FBEBE9': 'errorContainer',
    '#FFDAD6': 'errorContainer',
    '#8A5109': 'warning',
    '#E08A2E': 'warning',
    '#FCF3E4': 'warningContainer',
    '#F2C14E': 'tertiaryContainer',
    '#FDF3DC': 'tertiaryFixed',
    '#6B3FA0': 'astro',
    '#F3EEFA': 'astroContainer',
    '#0F0F0F': 'darkSurface',
    '#101816': 'darkSurface',
    '#121212': 'darkSurface',
    '#1A1A1A': 'darkSurfaceContainer',
    '#1E1E1E': 'darkSurfaceContainer',
    '#2E2E2E': 'darkOutlineVariant',
    '#2A2A2A': 'darkOutlineVariant',
  }).filter(([, v]) => v),
);

/** Local const name → colors token (when value matches known palette) */
const LOCAL_CONST_TO_TOKEN = {
  INK: 'ink',
  MUTED: 'muted',
  HAIRLINE: 'outlineVariant',
  PAGE: 'page',
  CARD: 'card',
  ACTION: 'primary',
  ACTION_OUTLINE: 'primaryOutline',
  CHART: 'secondary',
  ICON_CYAN: 'iconFill',
  OTP_FILL: 'primaryContainer',
  SUCCESS: 'success',
  SUCCESS_TEXT: 'success',
  SUCCESS_FILL: 'successContainer',
  DANGER: 'error',
  DANGER_FILL: 'errorContainer',
  STAR: 'tertiaryContainer',
  GOLD_BANNER: 'tertiaryContainer',
  GOLD_STAR: 'tertiaryContainer',
  SPONSORED_FILL: 'tertiaryFixed',
  CHIP_FILL: 'primaryContainer',
  PRIMARY: 'primary',
  ACCENT: 'primary',
};

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

function ensureColorsImport(src, filePath) {
  if (/from ['"][^'"]*theme\/colors['"]/.test(src)) return src;
  const rel = path
    .relative(path.dirname(filePath), path.join(ROOT, 'src/theme/colors'))
    .replace(/\\/g, '/');
  const importPath = rel.startsWith('.') ? rel : `./${rel}`;
  const importLine = `import { colors } from '${importPath}';\n`;
  // After last import block
  const m = src.match(/^(?:import[\s\S]*?;\n)+/);
  if (m) {
    return m[0] + importLine + src.slice(m[0].length);
  }
  return importLine + src;
}

function stripLocalColorConsts(src) {
  // Remove lines like: const INK = '#1F1F1F';
  return src.replace(
    /^const\s+([A-Z][A-Z0-9_]*)\s*=\s*['"]#[0-9A-Fa-f]{3,8}['"]\s*;\s*\n/gm,
    (full, name) => (LOCAL_CONST_TO_TOKEN[name] ? '' : full),
  );
}

function replaceLocalConstUsages(src) {
  for (const [name, token] of Object.entries(LOCAL_CONST_TO_TOKEN)) {
    const re = new RegExp(`\\b${name}\\b`, 'g');
    src = src.replace(re, `colors.${token}`);
  }
  return src;
}

function replaceHexLiterals(src) {
  // StyleSheet / JS: '#ABC' or "#ABC"
  src = src.replace(/(['"])(#[0-9A-Fa-f]{3,8})\1/g, (full, q, hex) => {
    const token = HEX_TO_TOKEN.get(hex.toUpperCase()) || HEX_TO_TOKEN.get(hex);
    // normalize lookup
    const key = hex.toUpperCase();
    const t =
      HEX_TO_TOKEN.get(key) ||
      HEX_TO_TOKEN.get(key.length === 4 ? expandShort(key) : key);
    if (!t) return full;
    return `colors.${t}`;
  });

  // JSX color="#ABC"
  src = src.replace(/color=(['"])(#[0-9A-Fa-f]{3,8})\1/g, (full, q, hex) => {
    const key = hex.toUpperCase();
    const t =
      HEX_TO_TOKEN.get(key) ||
      HEX_TO_TOKEN.get(key.length === 4 ? expandShort(key) : key);
    if (!t) return full;
    return `color={colors.${t}}`;
  });

  return src;
}

function expandShort(hex) {
  // #RGB -> #RRGGBB
  if (hex.length !== 4) return hex;
  return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  const original = src;

  // Skip theme itself
  if (filePath.includes(`${path.sep}theme${path.sep}`)) return false;

  src = stripLocalColorConsts(src);
  src = replaceLocalConstUsages(src);
  src = replaceHexLiterals(src);

  if (src !== original) {
    src = ensureColorsImport(src, filePath);
    // Fix double colors.colors.
    src = src.replace(/colors\.colors\./g, 'colors.');
    fs.writeFileSync(filePath, src);
    return true;
  }
  return false;
}

let changed = 0;
for (const dir of TARGETS) {
  for (const file of walk(dir)) {
    if (processFile(file)) {
      changed += 1;
      console.log('updated', path.relative(ROOT, file));
    }
  }
}
console.log(`Done. ${changed} files updated.`);
