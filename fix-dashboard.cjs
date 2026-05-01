const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const oldNav = `"<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'><nav style='position:sticky;top:0;z-index:20;background:rgba(30,27,75,0.97);border-bottom:1px solid rgba(99,102,241,0.3);padding:13px 16px;'><div style='max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;'><div style='display:flex;align-items:center;gap:10px;'><div style='width:34px;height:34px;background:#4f46e5;border-radius:10px;display:flex;align-items:center;justify-content:center;'><span style='font-size:17px;'>&#128295;</span></div><span style='color:#fff;font-size:18px;font-weight:700;'>ProFix</span></div><div style='display:flex;align-items:center;gap:10px;'><div style='width:34px;height:34px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;'>" + initial + "</div><button id='notifBtn' style='background:none;border:none;color:#a5b4fc;cursor:pointer;position:relative;padding:4px;min-width:32px;min-height:32px;'><span style='font-size:20px;'>&#128276;</span><span id='notifBadge' style='display:none;position:absolute;top:-2px;right:-2px;width:18px;height:18px;background:#ef4444;border-radius:50%;color:#fff;font-size:10px;font-weight:700;align-items:center;justify-content:center;'>0</span></button><button id='profileBtn' style='background:none;border:none;color:#a5b4fc;font-size:13px;font-weight:600;cursor:pointer;'>&#128100;</button><button id='signOutBtn' style='background:none;border:none;color:#a5b4fc;font-size:13px;font-weight:600;cursor:pointer;margin-left:8px;'>Sign out</button></div></div></nav>`

const newNav = `"<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" +
  "<div id='menuOverlay' onclick=\"document.getElementById('menuDrawer').style.transform='translateX(100%)';this.style.display='none';\" style='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:40;'></div>" +
  "<div id='menuDrawer' style='position:fixed;top:0;right:0;width:270px;height:100%;background:#1e1b4b;border-left:1px solid rgba(99,102,241,0.3);z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow-y:auto;'>" +
    "<div style='padding:20px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;'>" +
      "<div style='width:42px;height:42px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:17px;flex-shrink:0;'>" + initial + "</div>" +
      "<div style='min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + email + "</p><p style='color:#a5b4fc;font-size:12px;margin:0;'>ProFix Account</p></div>" +
    "</div>" +
    "<div style='padding:10px 8px;'>" +
      "<button id='menuNotifBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;position:relative;text-align:left;'>" +
        "<span style='font-size:20px;'>&#128276;</span><span style='color:#fff;font-size:14px;font-weight:500;flex:1;'>Notifications</span>" +
        "<span id='drawerNotifBadge' style='display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;'>0</span>" +
      "</button>" +
      "<button id='menuProfileBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;text-align:left;'>" +
        "<span style='font-size:20px;'>&#128100;</span><span style='color:#fff;font-size:14px;font-weight:500;'>My Profile</span>" +
      "</button>" +
      "<button id='menuAdminBtn' style='display:none;width:100%;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;text-align:left;'>" +
        "<span style='font-size:20px;'>&#128274;</span><span style='color:#d97706;font-size:14px;font-weight:600;'>Admin Panel</span>" +
      "</button>" +
      "<div style='height:1px;background:rgba(255,255,255,0.08);margin:6px 14px;'></div>" +
      "<button id='menuSignOutBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;text-align:left;'>" +
        "<span style='font-size:20px;'>&#128682;</span><span style='color:#f87171;font-size:14px;font-weight:500;'>Sign Out</span>" +
      "</button>" +
    "</div>" +
  "</div>" +
  "<nav style='position:sticky;top:0;z-index:20;background:rgba(30,27,75,0.97);border-bottom:1px solid rgba(99,102,241,0.3);padding:13px 16px;'>" +
    "<div style='max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;'>" +
      "<div style='display:flex;align-items:center;gap:10px;'>" +
        "<div style='width:34px;height:34px;background:#4f46e5;border-radius:10px;display:flex;align-items:center;justify-content:center;'><span style='font-size:18px;'>&#128295;</span></div>" +
        "<span style='color:#fff;font-size:18px;font-weight:700;'>ProFix</span>" +
      "</div>" +
      "<div style='display:flex;align-items:center;gap:6px;'>" +
        "<button id='notifBtn' style='background:none;border:none;color:#a5b4fc;cursor:pointer;position:relative;padding:6px;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center;'>" +
          "<span style='font-size:22px;'>&#128276;</span>" +
          "<span id='notifBadge' style='display:none;position:absolute;top:0;right:0;width:17px;height:17px;background:#ef4444;border-radius:50%;color:#fff;font-size:9px;font-weight:700;align-items:center;justify-content:center;'>0</span>" +
        "</button>" +
        "<button id='hamburgerBtn' style='background:none;border:none;cursor:pointer;padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:36px;min-height:36px;'>" +
          "<div style='width:20px;height:2px;background:#fff;border-radius:2px;'></div>" +
          "<div style='width:20px;height:2px;background:#fff;border-radius:2px;'></div>" +
          "<div style='width:20px;height:2px;background:#fff;border-radius:2px;'></div>" +
        "</button>" +
      "</div>" +
    "</div>" +
  "</nav>`

if (code.includes(oldNav)) {
  code = code.replace(oldNav, newNav)
  console.log("Nav replaced successfully")
} else {
  console.log("Old nav not found - checking...")
  console.log("Contains notifBtn:", code.includes("notifBtn"))
}

fs.writeFileSync("src/main.js", code, "utf8")
