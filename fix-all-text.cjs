const fs = require('fs')

// ── FIX 1: Update style.css with CSS overrides ────────────────────────────
const CSS = `
@keyframes spin    { to   { transform:rotate(360deg) } }
@keyframes fadeIn  { from { opacity:0;transform:translateY(8px) } to { opacity:1;transform:translateY(0) } }
@keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }

:root, [data-theme="light"] {
  --primary:#00C259; --primary-dark:#009944; --primary-light:#33CE7A;
  --primary-pale:#E6F9EE; --primary-shadow:rgba(0,194,89,0.25);
  --gradient-hero:linear-gradient(135deg,#00C259,#009944);
  --bg-page:#F2F4F3; --bg-card:#FFFFFF; --bg-card-subtle:#F7F8F7;
  --bg-nav:rgba(255,255,255,0.97); --bg-input:#F7F8F7;
  --bg-overlay:rgba(0,0,0,0.45); --bg-drawer:#FFFFFF;
  --text-primary:#111111; --text-secondary:#555555; --text-muted:#999999;
  --text-on-color:#FFFFFF;
  --border:#E2E5E2; --border-nav:rgba(0,0,0,0.08);
  --border-active:rgba(0,194,89,0.35); --divider:#EEEEEE;
  --danger:#E03131; --warning:#F08C00; --success:#00C259;
  --shadow-sm:0 2px 8px rgba(0,0,0,0.06);
  --shadow-md:0 8px 24px rgba(0,0,0,0.10);
  --shadow-modal:0 24px 60px rgba(0,0,0,0.14);
  --shadow-green:0 8px 24px rgba(0,194,89,0.22);
}

[data-theme="dark"] {
  --primary:#00C259; --primary-dark:#009944; --primary-light:#33CE7A;
  --primary-pale:rgba(0,194,89,0.12); --primary-shadow:rgba(0,194,89,0.18);
  --gradient-hero:linear-gradient(135deg,#00C259,#007A38);
  --bg-page:#0D0D0D; --bg-card:#1A1A1A; --bg-card-subtle:#141414;
  --bg-nav:rgba(13,13,13,0.97); --bg-input:#222222;
  --bg-overlay:rgba(0,0,0,0.65); --bg-drawer:#111111;
  --text-primary:#F0F0F0; --text-secondary:#AAAAAA; --text-muted:#666666;
  --text-on-color:#FFFFFF;
  --border:#2A2A2A; --border-nav:rgba(255,255,255,0.07);
  --border-active:rgba(0,194,89,0.28); --divider:#222222;
  --danger:#FF6B6B; --warning:#FFA94D; --success:#00C259;
  --shadow-sm:0 2px 8px rgba(0,0,0,0.3);
  --shadow-md:0 8px 24px rgba(0,0,0,0.4);
  --shadow-modal:0 24px 60px rgba(0,0,0,0.6);
  --shadow-green:0 8px 24px rgba(0,194,89,0.14);
}

/* ── LIGHT MODE TEXT FIX ─────────────────────────────────────────────────
   inline styles beat normal CSS — use !important to fix white text
   on white backgrounds in light mode                                    */

/* 1. Force ALL white/light text to dark in light mode */
[data-theme="light"] [style*="color:#fff"],
[data-theme="light"] [style*="color:#ffffff"],
[data-theme="light"] [style*="color:#FFFFFF"],
[data-theme="light"] [style*="color:var(--text-primary)"],
[data-theme="light"] [style*="color:#80D4A8"],
[data-theme="light"] [style*="color:#B3EDCF"],
[data-theme="light"] [style*="color:#C8EDDA"],
[data-theme="light"] [style*="color:#33CE7A"],
[data-theme="light"] [style*="color:var(--text-muted)"],
[data-theme="light"] [style*="color:var(--text-secondary)"],
[data-theme="light"] [style*="color:var(--text-light)"] {
  color: var(--text-primary) !important;
}

/* 2. Restore white text on COLORED backgrounds (green, red, amber etc.) */
[data-theme="light"] [style*="background:#00C259"],
[data-theme="light"] [style*="background:#009944"],
[data-theme="light"] [style*="background:#059669"],
[data-theme="light"] [style*="background:#d97706"],
[data-theme="light"] [style*="background:#ef4444"],
[data-theme="light"] [style*="background:#dc2626"],
[data-theme="light"] [style*="background:#7c3aed"],
[data-theme="light"] [style*="background:var(--primary)"],
[data-theme="light"] [style*="background:var(--gradient-hero)"],
[data-theme="light"] [style*="background:linear-gradient(135deg,#00C259"] {
  color: #FFFFFF !important;
}

/* 3. Children of colored backgrounds also get white text */
[data-theme="light"] [style*="background:#00C259"] *,
[data-theme="light"] [style*="background:#009944"] *,
[data-theme="light"] [style*="background:#059669"] *,
[data-theme="light"] [style*="background:#d97706"] *,
[data-theme="light"] [style*="background:var(--gradient-hero)"] *,
[data-theme="light"] [style*="background:linear-gradient(135deg,#00C259"] * {
  color: #FFFFFF !important;
}

/* 4. Nav bar - icons and text should be dark in light mode */
[data-theme="light"] nav [style*="color:#fff"],
[data-theme="light"] nav [style*="color:#ffffff"],
[data-theme="light"] nav [style*="color:#FFFFFF"],
[data-theme="light"] nav [style*="color:var(--text-primary)"],
[data-theme="light"] nav [style*="color:var(--text-secondary)"] {
  color: var(--text-primary) !important;
}

/* 5. Hamburger lines */
[data-theme="light"] [style*="background:#fff"][style*="height:2px"],
[data-theme="light"] [style*="background:#FFFFFF"][style*="height:2px"],
[data-theme="light"] [style*="background:var(--text-primary)"][style*="height:2px"] {
  background: var(--text-primary) !important;
}

/* 6. Secondary/muted text in light mode */
[data-theme="light"] [style*="color:#a5b4fc"],
[data-theme="light"] [style*="color:#c4b5fd"],
[data-theme="light"] [style*="color:#818cf8"],
[data-theme="light"] [style*="color:#e0e7ff"],
[data-theme="light"] [style*="color:#c7d2fe"],
[data-theme="light"] [style*="color:#6b7280"] {
  color: var(--text-secondary) !important;
}

/* 7. Back button arrows in nav bars */
[data-theme="light"] #backBtn {
  color: var(--text-primary) !important;
}

/* ── BASE STYLES ── */
*, *::before, *::after {
  box-sizing: border-box; margin: 0; padding: 0;
  -webkit-tap-highlight-color: transparent;
}
html, body { height:100%; overscroll-behavior:none; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app { min-height:100dvh; }
input, textarea, select, button { font-family:inherit; -webkit-appearance:none; appearance:none; }
img { max-width:100%; display:block; }
::-webkit-scrollbar { display:none; }
* { scrollbar-width:none; }
`

fs.writeFileSync('src/style.css', CSS, 'utf8')
console.log('style.css written')

// ── FIX 2: Fix hamburger lines in main.js specifically ──────────────────
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix hamburger lines - use explicit dark color with a CSS var reference
c = c.replace(
  /<div style='width:20px;height:2px;background:[^']+;border-radius:2px;'><\/div>/g,
  "<div style='width:20px;height:2px;background:var(--text-primary);border-radius:2px;'></div>"
)

// Fix back button arrows in navBar
c = c.replace(
  /color:#a5b4fc;font-size:24px;cursor:pointer/g,
  'color:var(--text-primary);font-size:24px;cursor:pointer'
)

// Fix notification bell
c = c.replace(
  /color:#a5b4fc;cursor:pointer;position:relative/g,
  'color:var(--text-primary);cursor:pointer;position:relative'
)

// Fix ProFix wordmark in nav
c = c.replace(
  /color:#ffffff;font-size:18px;font-weight:700/g,
  'color:var(--text-primary);font-size:18px;font-weight:700'
)
c = c.replace(
  /color:#fff;font-size:18px;font-weight:700/g,
  'color:var(--text-primary);font-size:18px;font-weight:700'
)

// Fix navBar helper function title text
c = c.replace(
  /color:#ffffff;font-size:17px;font-weight:700/g,
  'color:var(--text-primary);font-size:17px;font-weight:700'
)

// Fix drawer background and text
c = c.replace(
  /background:#111111(?=;)/g,
  'background:var(--bg-drawer)'
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('main.js fixed. Lines:', c.split('\n').length)
console.log('All done! Reload browser to see changes.')
