const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

// Find drawer start and end
let start = -1, end = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("menuDrawer") && lines[i].includes("position:fixed")) start = i
  if (start > 0 && lines[i].includes('"</div>" +') && lines[i+1] && lines[i+1].includes("nav style=")) { end = i; break }
}

console.log('Drawer start:', start+1, 'end:', end+1)

const NEW_DRAWER = `    "<div id='menuOverlay' style='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:40;'></div>" +
    "<div id='menuDrawer' style='position:fixed;top:0;right:0;width:280px;height:100%;background:var(--bg-drawer);border-left:1px solid var(--border);z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow-y:auto;display:flex;flex-direction:column;'>" +

      // Profile header
      "<div style='padding:24px 20px 16px;border-bottom:1px solid var(--divider);display:flex;align-items:center;gap:14px;'>" +
        "<div style='width:46px;height:46px;background:var(--primary);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:18px;flex-shrink:0;'>" + initial + "</div>" +
        "<div style='min-width:0;flex:1;'>" +
          "<p style='color:var(--text-primary);font-size:14px;font-weight:700;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + email + "</p>" +
          "<p style='color:var(--text-muted);font-size:12px;margin:0;'>ProFix Account</p>" +
        "</div>" +
      "</div>" +

      // Main menu items
      "<div style='padding:10px 12px;flex:1;'>" +

        "<p style='color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:8px 8px 4px;'>General</p>" +

        "<button id='menuNotifBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:12px;background:none;border:none;border-radius:12px;cursor:pointer;margin-bottom:2px;'>" +
          "<div style='width:36px;height:36px;background:rgba(99,102,241,0.10);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128276;</span></div>" +
          "<span style='color:var(--text-primary);font-size:14px;font-weight:500;flex:1;text-align:left;'>Notifications</span>" +
          "<span id='drawerBadge' style='display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;'>0</span>" +
        "</button>" +

        "<button id='menuProfileBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:12px;background:none;border:none;border-radius:12px;cursor:pointer;margin-bottom:2px;'>" +
          "<div style='width:36px;height:36px;background:rgba(0,194,89,0.10);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128100;</span></div>" +
          "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Profile</span>" +
        "</button>" +

        "<div style='height:1px;background:var(--divider);margin:10px 0;'></div>" +
        "<p style='color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:4px 8px 4px;'>Finance</p>" +

        "<button id='menuWalletBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:12px;background:none;border:none;border-radius:12px;cursor:pointer;margin-bottom:2px;'>" +
          "<div style='width:36px;height:36px;background:rgba(0,194,89,0.10);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128184;</span></div>" +
          "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Wallet</span>" +
        "</button>" +

        "<button id='menuContractsBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:12px;background:none;border:none;border-radius:12px;cursor:pointer;margin-bottom:2px;'>" +
          "<div style='width:36px;height:36px;background:rgba(0,194,89,0.10);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128196;</span></div>" +
          "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Contracts</span>" +
        "</button>" +

        "<div style='height:1px;background:var(--divider);margin:10px 0;'></div>" +
        "<p style='color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:4px 8px 4px;'>Jobs</p>" +

        "<button id='menuFindWorkersBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:12px;background:none;border:none;border-radius:12px;cursor:pointer;margin-bottom:2px;'>" +
          "<div style='width:36px;height:36px;background:rgba(0,194,89,0.10);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128269;</span></div>" +
          "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>Find Workers</span>" +
        "</button>" +

        "<div id='adminBtnSlot'></div>" +

        "<div style='height:1px;background:var(--divider);margin:10px 0;'></div>" +

        "<button id='menuSignOutBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:12px;background:none;border:none;border-radius:12px;cursor:pointer;'>" +
          "<div style='width:36px;height:36px;background:rgba(224,49,49,0.08);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='font-size:18px;'>&#128682;</span></div>" +
          "<span style='color:var(--danger);font-size:14px;font-weight:600;text-align:left;'>Sign Out</span>" +
        "</button>" +

      "</div>" +
    "</div>" +`

if (start > 0 && end > start) {
  lines.splice(start, end - start + 1, NEW_DRAWER)
  console.log('Drawer replaced')
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
