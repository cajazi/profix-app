const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Add My Contracts button before Sign Out in drawer
c = c.replace(
  `"<button id='menuSignOutBtn'`,
  `"<button id='menuContractsBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
        "<span style='font-size:20px;'>&#128196;</span>" +
        "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Contracts</span>" +
      "</button>" +
      "<button id='menuSignOutBtn'`
)

// Wire up contracts button - find where other menu buttons are wired
c = c.replace(
  `document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`,
  `document.getElementById("menuContractsBtn").addEventListener("click", () => { closeMenu(); showMyContracts(user) })
  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
