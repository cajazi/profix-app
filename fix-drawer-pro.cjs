const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Find the entire drawer HTML and replace it
const drawerStart = c.indexOf('"<div id=\'menuDrawer\'')
const drawerEnd = c.indexOf('"</div>" +\n\n    "<nav style=')

if (drawerStart < 0 || drawerEnd < 0) {
  console.log('ERROR: drawer not found', drawerStart, drawerEnd)
  process.exit(1)
}

const NEW_DRAWER = `"<div id='menuOverlay' style='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:40;'></div>" +
    "<div id='menuDrawer' style='position:fixed;top:0;right:0;width:280px;height:100%;background:var(--bg-drawer);border-left:1px solid var(--border);z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow-y:auto;'>" +

      "<div style='padding:22px 20px 16px;border-bottom:1px solid var(--divider);display:flex;align-items:center;gap:14px;'>" +
        "<div style='width:48px;height:48px;background:var(--primary);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:20px;flex-shrink:0;'>" + initial + "</div>" +
        "<div style='min-width:0;flex:1;'>" +
          "<p style='color:var(--text-primary);font-size:14px;font-weight:700;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + email + "</p>" +
          "<p style='color:var(--text-muted);font-size:12px;margin:0;'>ProFix Account</p>" +
        "</div>" +
      "</div>" +

      "<div style='padding:12px 12px 24px;'>" +

        "<div style='margin-bottom:4px;'>" +
          "<p style='color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:0 8px;margin:0 0 4px;'>Account</p>" +
          "<button id='menuNotifBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
            "<span style='font-size:20px;width:24px;text-align:center;'>&#128276;</span>" +
            "<span style='color:var(--text-primary);font-size:14px;font-weight:500;flex:1;text-align:left;'>Notifications</span>" +
            "<span id='drawerBadge' style='display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;'>0</span>" +
          "</button>" +
          "<button id='menuProfileBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
            "<span style='font-size:20px;width:24px;text-align:center;'>&#128100;</span>" +
            "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Profile</span>" +
          "</button>" +
        "</div>" +

        "<div style='height:1px;background:var(--divider);margin:8px 0;'></div>" +

        "<div style='margin-bottom:4px;'>" +
          "<p style='color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:0 8px;margin:0 0 4px;'>Finance</p>" +
          "<button id='menuWalletBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
            "<span style='font-size:20px;width:24px;text-align:center;'>&#128184;</span>" +
            "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Wallet</span>" +
          "</button>" +
          "<button id='menuContractsBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
            "<span style='font-size:20px;width:24px;text-align:center;'>&#128196;</span>" +
            "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Contracts</span>" +
          "</button>" +
        "</div>" +

        "<div style='height:1px;background:var(--divider);margin:8px 0;'></div>" +

        "<div style='margin-bottom:4px;'>" +
          "<p style='color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:0 8px;margin:0 0 4px;'>Discovery</p>" +
          "<button id='menuFindWorkersBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
            "<span style='font-size:20px;width:24px;text-align:center;'>&#128269;</span>" +
            "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>Find Workers</span>" +
          "</button>" +
        "</div>" +

        "<div id='adminBtnSlot'></div>" +

        "<div style='height:1px;background:var(--divider);margin:8px 0;'></div>" +

        "<button id='menuSignOutBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;width:24px;text-align:center;'>&#128682;</span>" +
          "<span style='color:var(--danger);font-size:14px;font-weight:600;text-align:left;'>Sign Out</span>" +
        "</button>" +

      "</div>" +
    "</div>" +`

const endStr = '"</div>" +\n\n    "<nav style='
c = c.slice(0, drawerStart) + NEW_DRAWER + '\n\n    "<nav style=' + c.slice(drawerEnd + endStr.length)

// Also remove the old menuOverlay div if it exists before the drawer
c = c.replace(/"<div id='menuOverlay'[^"]*><\/div>" \+\n\s*"<div id='menuOverlay'/g, '"<div id=\'menuOverlay\'')

// Fix admin button slot - wire it up
c = c.replace(
  `const adminEmails = ["cossybest24@gmail.com","cossyjay24@gmail.com","support@cosmas.dev"]
  if (adminEmails.includes(user.email)) {
    const aBtn = document.createElement("button")
    aBtn.style.cssText = "width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;"
    aBtn.innerHTML = "<span style='font-size:20px;'>&#128274;</span><span style='color:#F59E0B;font-size:14px;font-weight:600;'>Admin Panel</span>"
    aBtn.addEventListener("click", () => { closeMenu(); showAdminPanel() })
    const sOut = document.getElementById("menuSignOutBtn")
    if (sOut) sOut.parentNode.insertBefore(aBtn, sOut)
  }`,
  `const adminEmails = ["cossybest24@gmail.com","cossyjay24@gmail.com","support@cosmas.dev"]
  const adminSlot = document.getElementById("adminBtnSlot")
  if (adminEmails.includes(user.email) && adminSlot) {
    adminSlot.innerHTML =
      "<div style='height:1px;background:var(--divider);margin:8px 0;'></div>" +
      "<p style='color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:0 8px;margin:0 0 4px;'>Admin</p>" +
      "<button id='menuAdminBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
        "<span style='font-size:20px;width:24px;text-align:center;'>&#128274;</span>" +
        "<span style='color:#F59E0B;font-size:14px;font-weight:600;text-align:left;'>Admin Panel</span>" +
      "</button>"
    document.getElementById("menuAdminBtn").addEventListener("click", () => { closeMenu(); showAdminPanel() })
  }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Drawer rewritten. Lines:', c.split('\n').length)
