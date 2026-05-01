const fs = require('fs')
let css = fs.readFileSync('src/style.css', 'utf8')

css += `
/* ── DRAWER MENU ── */
#menuDrawer { display:flex; flex-direction:column; }
#menuDrawer button { transition: background 0.15s; }
#menuDrawer button:hover { background: var(--bg-card-subtle) !important; }
#menuNotifBtn, #menuProfileBtn, #menuWalletBtn,
#menuContractsBtn, #menuFindWorkersBtn, #menuSignOutBtn,
#menuThemeBtn {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 11px 12px !important;
  background: none !important;
  border: none !important;
  border-radius: 12px !important;
  cursor: pointer !important;
  margin-bottom: 2px !important;
  text-align: left !important;
}
#menuSignOutBtn span:last-child { color: var(--danger) !important; }
`

fs.writeFileSync('src/style.css', css, 'utf8')
console.log('CSS drawer fix applied')
