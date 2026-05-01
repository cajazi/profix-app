/**
 * ProFix — OPay Theme Applicator
 * Production-safe, idempotent, verified
 */
const fs = require('fs')

// ── 1. WRITE style.css ────────────────────────────────────────────────────────
// Only [data-theme] selectors — NO @media conflicts.
// JS detects system preference and sets data-theme on <html>.
const CSS = `
/* ProFix — OPay Design System */
@keyframes spin    { to   { transform: rotate(360deg) } }
@keyframes fadeIn  { from { opacity:0;transform:translateY(8px) } to { opacity:1;transform:translateY(0) } }
@keyframes slideUp { from { transform:translateY(100%) }         to { transform:translateY(0) } }

/* ── LIGHT (default) ── */
:root, [data-theme="light"] {
  --primary:        #00C259;
  --primary-dark:   #009944;
  --primary-light:  #33CE7A;
  --primary-pale:   #E6F9EE;
  --primary-shadow: rgba(0,194,89,0.28);
  --gradient-hero:  linear-gradient(135deg,#00C259,#009944);

  --bg-page:        #F2F4F3;
  --bg-card:        #FFFFFF;
  --bg-card-subtle: #F7F8F7;
  --bg-nav:         rgba(255,255,255,0.97);
  --bg-input:       #F7F8F7;
  --bg-overlay:     rgba(0,0,0,0.45);
  --bg-drawer:      #FFFFFF;

  --text-primary:   #111111;
  --text-secondary: #555555;
  --text-muted:     #999999;
  --text-on-green:  #FFFFFF;

  --border:         #E2E5E2;
  --border-nav:     rgba(0,0,0,0.08);
  --border-active:  rgba(0,194,89,0.35);
  --divider:        #EEEEEE;

  --danger:         #E03131;
  --warning:        #F08C00;
  --success:        #00C259;

  --shadow-sm:      0 2px 8px rgba(0,0,0,0.06);
  --shadow-md:      0 8px 24px rgba(0,0,0,0.10);
  --shadow-modal:   0 24px 60px rgba(0,0,0,0.14);
  --shadow-green:   0 8px 24px rgba(0,194,89,0.25);
}

/* ── DARK ── */
[data-theme="dark"] {
  --primary:        #00C259;
  --primary-dark:   #009944;
  --primary-light:  #33CE7A;
  --primary-pale:   rgba(0,194,89,0.12);
  --primary-shadow: rgba(0,194,89,0.20);
  --gradient-hero:  linear-gradient(135deg,#00C259,#007A38);

  --bg-page:        #0D0D0D;
  --bg-card:        #1A1A1A;
  --bg-card-subtle: #141414;
  --bg-nav:         rgba(13,13,13,0.97);
  --bg-input:       #222222;
  --bg-overlay:     rgba(0,0,0,0.65);
  --bg-drawer:      #111111;

  --text-primary:   #F0F0F0;
  --text-secondary: #AAAAAA;
  --text-muted:     #666666;
  --text-on-green:  #FFFFFF;

  --border:         #2A2A2A;
  --border-nav:     rgba(255,255,255,0.07);
  --border-active:  rgba(0,194,89,0.30);
  --divider:        #222222;

  --danger:         #FF6B6B;
  --warning:        #FFA94D;
  --success:        #00C259;

  --shadow-sm:      0 2px 8px rgba(0,0,0,0.3);
  --shadow-md:      0 8px 24px rgba(0,0,0,0.4);
  --shadow-modal:   0 24px 60px rgba(0,0,0,0.6);
  --shadow-green:   0 8px 24px rgba(0,194,89,0.15);
}

/* ── BASE ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
html, body {
  height: 100%;
  overscroll-behavior: none;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  line-height: 1.5;
}
#app { min-height: 100dvh; }
input, textarea, select, button {
  font-family: inherit;
  -webkit-appearance: none;
  appearance: none;
}
img { max-width: 100%; display: block; }
::-webkit-scrollbar { display: none; }
* { scrollbar-width: none; }

/* ── RESPONSIVE BREAKPOINTS ── */
/* Mobile first — 380px base (Android compact) */
/* Tablet: 600px+ */
@media (min-width: 600px) {
  body { font-size: 16px; }
}
`

fs.writeFileSync('src/style.css', CSS, 'utf8')
console.log('✅ style.css written')

// ── 2. PATCH main.js ─────────────────────────────────────────────────────────
let c = fs.readFileSync('src/main.js', 'utf8')

// Guard: don't run twice (idempotent check)
if (c.includes('/* OPAY_THEME_APPLIED */')) {
  console.log('⚠️  Theme already applied. Skipping.')
  process.exit(0)
}

// ── 2a. FULL rgba replacements (not partial — avoids corruption) ──────────────
const rgbaMap = [
  // Old purple shadow → green shadow
  [/rgba\(79,70,229,0\.4\)/g,   'rgba(0,194,89,0.28)'],
  [/rgba\(79,70,229,0\.5\)/g,   'rgba(0,194,89,0.38)'],
  [/rgba\(79,70,229,0\.3\)/g,   'rgba(0,194,89,0.22)'],
  [/rgba\(79,70,229,0\.2\)/g,   'rgba(0,194,89,0.15)'],
  [/rgba\(79,70,229,0\.1\)/g,   'rgba(0,194,89,0.08)'],
  // Old indigo tints → green tints
  [/rgba\(99,102,241,0\.4\)/g,  'rgba(0,194,89,0.28)'],
  [/rgba\(99,102,241,0\.3\)/g,  'var(--border-nav)'],
  [/rgba\(99,102,241,0\.25\)/g, 'var(--border-active)'],
  [/rgba\(99,102,241,0\.2\)/g,  'rgba(0,194,89,0.15)'],
  [/rgba\(99,102,241,0\.15\)/g, 'rgba(0,194,89,0.10)'],
  [/rgba\(99,102,241,0\.1\)/g,  'rgba(0,194,89,0.07)'],
  // Dark page overlays → theme vars
  [/rgba\(30,27,75,0\.97\)/g,   'var(--bg-nav)'],
  [/rgba\(30,27,75,0\.9\)/g,    'var(--bg-nav)'],
  [/rgba\(0,0,0,0\.6\)/g,       'var(--bg-overlay)'],
]
rgbaMap.forEach(([from, to]) => { c = c.replace(from, to) })

// ── 2b. Hex color replacements ─────────────────────────────────────────────────
const hexMap = [
  // Purples → OPay green
  ['#4f46e5', '#00C259'], ['#4F46E5', '#00C259'],
  ['#7c3aed', '#009944'], ['#6d28d9', '#009944'],
  ['#6366f1', '#00C259'],
  // Purple tints → green tints
  ['#818cf8', '#33CE7A'], ['#a5b4fc', '#80D4A8'],
  ['#c4b5fd', '#B3EDCF'], ['#e0e7ff', '#E6F9EE'],
  ['#c7d2fe', '#C8EDDA'],
  // Dark purple backgrounds → use CSS vars via JS theme
  ['#1e1b4b', '#0A1F14'], ['#312e81', '#092B16'],
]
hexMap.forEach(([from, to]) => {
  c = c.replace(new RegExp(from.replace(/#/,'\\#'), 'g'), to)
})

// ── 2c. Replace dark bg gradients → var(--bg-page) ────────────────────────────
c = c.replace(
  /background:linear-gradient\(135deg,#0A1F14 0%,#092B16 50%,#0A1F14 100%\)/g,
  'background:var(--bg-page)'
)
c = c.replace(
  /background:linear-gradient\(135deg,#0A1F14,#092B16\)/g,
  'background:var(--bg-page)'
)
// Dashboard hero gradient → OPay green
c = c.replace(
  /background:linear-gradient\(135deg,#00C259,#009944\)/g,
  'background:var(--gradient-hero)'
)

// ── 2d. Card backgrounds → CSS vars ──────────────────────────────────────────
const bgMap = [
  [/background:rgba\(255,255,255,0\.0[3-8]\)/g, 'background:var(--bg-card-subtle)'],
  [/background:rgba\(255,255,255,0\.1[0-5]\)/g, 'background:var(--bg-card)'],
  [/border:1px solid rgba\(255,255,255,0\.0[5-9]\)/g,  'border:1px solid var(--border)'],
  [/border:1px solid rgba\(255,255,255,0\.1[0-5]\)/g,  'border:1px solid var(--border)'],
  [/border-bottom:1px solid rgba\(255,255,255,0\.0[5-9]\)/g, 'border-bottom:1px solid var(--divider)'],
  [/border-bottom:1px solid rgba\(255,255,255,0\.0[3-4]\)/g, 'border-bottom:1px solid var(--divider)'],
  [/height:1px;background:rgba\(255,255,255,0\.08\)/g,  'height:1px;background:var(--divider)'],
  [/border-bottom:1px solid var\(--border-nav\)/g, 'border-bottom:1px solid var(--border-nav)'],
  // Input borders
  [/border:1\.5px solid rgba\(255,255,255,0\.1[0-9]\)/g, 'border:1.5px solid var(--border)'],
  [/border:2px solid rgba\(255,255,255,0\.2\)/g, 'border:2px solid var(--border)'],
  // White backgrounds (cards/modals) → theme var
  [/background:#fff(?=[;'"])/g,      'background:var(--bg-card)'],
  [/background:#ffffff/gi,           'background:var(--bg-card)'],
  [/background:#f9fafb/gi,           'background:var(--bg-input)'],
  [/background:#f8fafc/gi,           'background:var(--bg-input)'],
  // Text colors
  [/color:#111827/g, 'color:var(--text-primary)'],
  [/color:#1f2937/g, 'color:var(--text-primary)'],
  [/color:#374151/g, 'color:var(--text-primary)'],
  [/color:#6b7280/g, 'color:var(--text-secondary)'],
  [/color:#9ca3af/g, 'color:var(--text-muted)'],
  // Static shadows → theme vars
  [/box-shadow:0 24px 60px rgba\(0,0,0,0\.5\)/g, 'box-shadow:var(--shadow-modal)'],
  [/box-shadow:0 8px 28px rgba\(0,0,0,0\.[0-9]+\)/g, 'box-shadow:var(--shadow-md)'],
  [/box-shadow:0 16px 40px rgba\(0,194,89,0\.[0-9]+\)/g, 'box-shadow:var(--shadow-green)'],
  [/box-shadow:0 8px 28px rgba\(0,194,89,0\.[0-9]+\)/g, 'box-shadow:var(--shadow-green)'],
]
bgMap.forEach(([from, to]) => { c = c.replace(from, to) })

// Drawer background
c = c.replace(
  /background:#1e1b4b|background:#0A1F14/g,
  'background:var(--bg-drawer)'
)

// ── 2e. Inject theme system (after imports, before first function) ────────────
const THEME_JS = `/* OPAY_THEME_APPLIED */

// ── THEME SYSTEM ─────────────────────────────────────────────────────────────
let _themeMediaQuery = null

function applyTheme(mode) {
  // Remove old system listener
  if (_themeMediaQuery) {
    _themeMediaQuery.removeEventListener('change', _onSystemThemeChange)
    _themeMediaQuery = null
  }
  localStorage.setItem('profix_theme', mode)
  if (mode === 'system') {
    _applySystemTheme()
    _themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    _themeMediaQuery.addEventListener('change', _onSystemThemeChange)
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }
  // Update theme label if drawer is open
  const lbl = document.getElementById('themeLabel')
  if (lbl) lbl.textContent = _themeLabels[mode]
}

function _applySystemTheme() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

function _onSystemThemeChange() { _applySystemTheme() }

const _themeLabels = { light: '☀️ Light', dark: '🌙 Dark', system: '🔄 Auto' }
const _themeCycle  = ['light', 'dark', 'system']

function initTheme() {
  const saved = localStorage.getItem('profix_theme') || 'system'
  applyTheme(saved)
}
// ─────────────────────────────────────────────────────────────────────────────

`

// Insert after the global variable declarations, before first function
c = c.replace(
  /\n(function showLoading\(\))/,
  '\n' + THEME_JS + '$1'
)

// Call initTheme() at start of boot
c = c.replace(
  '  setupAndroidBack()\n  showLoading()',
  '  initTheme()\n  setupAndroidBack()\n  showLoading()'
)

// ── 2f. Add theme toggle to drawer (if not already there) ────────────────────
if (!c.includes('menuThemeBtn')) {
  // Add button before Sign Out
  c = c.replace(
    `"<div style='height:1px;background:var(--divider);margin:6px 14px;'></div>" +`,
    `"<div style='height:1px;background:var(--divider);margin:6px 14px;'></div>" +` +
    `\n      "<button id='menuThemeBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:12px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +` +
    `\n        "<span style='font-size:20px;'>&#127775;</span>" +` +
    `\n        "<span style='color:var(--text-primary);font-size:14px;font-weight:500;flex:1;text-align:left;'>Theme</span>" +` +
    `\n        "<span id='themeLabel' style='color:var(--text-secondary);font-size:12px;font-weight:600;background:var(--bg-card-subtle);padding:3px 8px;border-radius:8px;border:1px solid var(--border);'></span>" +` +
    `\n      "</button>" +`
  )

  // Wire up theme button after drawer is rendered
  c = c.replace(
    `  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`,
    `  // Theme toggle
  const _tBtn = document.getElementById("menuThemeBtn")
  const _tLbl = document.getElementById("themeLabel")
  if (_tBtn && _tLbl) {
    const _cur = localStorage.getItem('profix_theme') || 'system'
    _tLbl.textContent = _themeLabels[_cur]
    _tBtn.addEventListener("click", () => {
      const _idx = _themeCycle.indexOf(localStorage.getItem('profix_theme') || 'system')
      applyTheme(_themeCycle[(_idx + 1) % _themeCycle.length])
    })
  }
  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`
  )
}

// ── 2g. Fix box shadows on primary buttons ────────────────────────────────────
c = c.replace(/box-shadow:0 8px 24px rgba\(0,194,89,/g, 'box-shadow:0 8px 20px rgba(0,194,89,')

fs.writeFileSync('src/main.js', c, 'utf8')
const lines = c.split('\n').length
console.log(`✅ main.js patched. Lines: ${lines}`)

// ── 3. VERIFY key replacements happened ───────────────────────────────────────
const checks = [
  ['#4f46e5',    'Primary indigo removed'],
  ['#1e1b4b',    'Dark purple removed'],
  ['#312e81',    'Dark purple 2 removed'],
  ['initTheme',  'Theme init present'],
  ['applyTheme', 'Theme apply present'],
  ['--primary',  'CSS vars present'],
  ['menuThemeBtn','Theme toggle button present'],
]
let allPassed = true
checks.forEach(([str, label]) => {
  const shouldExist = !str.startsWith('#')
  const found = c.includes(str)
  const pass = shouldExist ? found : !found
  console.log((pass ? '✅' : '❌') + ' ' + label)
  if (!pass) allPassed = false
})
console.log(allPassed ? '\n🎉 All checks passed!' : '\n⚠️  Some checks failed — review above')
