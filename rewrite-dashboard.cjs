const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

const newDashboard = `function showDashboard(user) {
  if (!isGoingBack) backStack = []
  pushScreen("dashboard", () => showDashboard(user))
  const email   = user?.email || currentEmail || "User"
  const initial = email[0].toUpperCase()

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#0D1117 0%,#1a2332 50%,#0D1117 100%);'>" +
    "<div id='menuOverlay' style='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:40;'></div>" +
    "<div id='menuDrawer' style='position:fixed;top:0;right:0;width:270px;height:100%;background:#0D1117;border-left:1px solid rgba(0,168,89,0.2);z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow-y:auto;'>" +
      "<div style='padding:20px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;'>" +
        "<div style='width:42px;height:42px;background:#00A859;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:17px;flex-shrink:0;'>" + initial + "</div>" +
        "<div style='min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + email + "</p><p style='color:#9CA3AF;font-size:12px;margin:0;'>ProFix Account</p></div>" +
      "</div>" +
      "<div style='padding:10px 8px;'>" +
        "<button id='menuNotifBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128276;</span><span style='color:#fff;font-size:14px;font-weight:500;flex:1;text-align:left;'>Notifications</span>" +
          "<span id='drawerBadge' style='display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;'>0</span>" +
        "</button>" +
        "<button id='menuProfileBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128100;</span><span style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>My Profile</span>" +
        "</button>" +
        "<button id='menuFindWorkersBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128269;</span><span id='menuFindWorkersLabel' style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>Find Work</span>" +
        "</button>" +
        "<button id='menuContractsBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128196;</span><span style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>My Contracts</span>" +
        "</button>" +
        "<button id='menuWalletBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128184;</span><span style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>My Wallet</span>" +
        "</button>" +
        "<button id='menuAdminBtn' style='display:none;width:100%;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128274;</span><span style='color:#FF8C00;font-size:14px;font-weight:600;text-align:left;'>Admin Panel</span>" +
        "</button>" +
        "<div style='height:1px;background:rgba(255,255,255,0.08);margin:6px 14px;'></div>" +
        "<button id='menuSignOutBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128682;</span><span style='color:#f87171;font-size:14px;font-weight:500;text-align:left;'>Sign Out</span>" +
        "</button>" +
      "</div>" +
    "</div>" +
    "<nav style='position:sticky;top:0;z-index:20;background:rgba(13,17,23,0.97);border-bottom:1px solid rgba(0,168,89,0.2);padding:13px 16px;'>" +
      "<div style='max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;'>" +
        "<div style='display:flex;align-items:center;gap:8px;'>" +
          "<span style='font-size:20px;'>&#128295;</span>" +
          "<span style='color:#fff;font-size:17px;font-weight:700;'>ProFix</span>" +
        "</div>" +
        "<div style='display:flex;align-items:center;gap:10px;'>" +
          "<button id='notifNavBtn' style='position:relative;background:none;border:none;cursor:pointer;padding:4px;'>" +
            "<span style='font-size:22px;'>&#128276;</span>" +
            "<span id='notifBadge' style='display:none;position:absolute;top:-2px;right:-2px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:20px;'>0</span>" +
          "</button>" +
          "<button id='hamburgerBtn' style='background:none;border:none;cursor:pointer;padding:4px;font-size:22px;'>&#9776;</button>" +
        "</div>" +
      "</div>" +
    "</nav>" +
    "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div style='background:linear-gradient(135deg,#00A859,#008C4A);border-radius:20px;padding:20px;margin-bottom:20px;box-shadow:0 8px 28px rgba(0,168,89,0.3);'>" +
        "<p style='color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 4px;'>Welcome back</p>" +
        "<p style='color:#fff;font-size:18px;font-weight:700;margin:0 0 16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + email + "</p>" +
        "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;'>" +
          "<div style='background:rgba(255,255,255,0.15);border-radius:12px;padding:12px;text-align:center;'>" +
            "<p style='color:rgba(255,255,255,0.7);font-size:11px;margin:0 0 4px;text-transform:uppercase;'>Active Jobs</p>" +
            "<p id='activeJobsCount' style='color:#fff;font-size:22px;font-weight:700;margin:0;'>0</p>" +
          "</div>" +
          "<div style='background:rgba(255,255,255,0.15);border-radius:12px;padding:12px;text-align:center;'>" +
            "<p style='color:rgba(255,255,255,0.7);font-size:11px;margin:0 0 4px;text-transform:uppercase;'>In Escrow</p>" +
            "<p style='color:#fff;font-size:22px;font-weight:700;margin:0;'>&#8358;0</p>" +
          "</div>" +
        "</div>" +
      "</div>" +
      "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;'>" +
        "<button id='postJobBtn' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128295;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>Post a Job</p><p style='color:#9CA3AF;font-size:11px;margin:0;'>Hire a professional</p></button>" +
        "<button id='browseJobsBtn' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128269;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>Browse Jobs</p><p style='color:#9CA3AF;font-size:11px;margin:0;'>Find work near you</p></button>" +
        "<button id='myJobsBtn' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128203;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>My Jobs</p><p style='color:#9CA3AF;font-size:11px;margin:0;'>View your listings</p></button>" +
        "<button id='myChatsBtn' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128172;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>Messages</p><p style='color:#9CA3AF;font-size:11px;margin:0;'>Chat with clients</p></button>" +
      "</div>" +
      "<div id='recentJobsSection' style='margin-bottom:20px;'>" +
        "<p style='color:#9CA3AF;font-size:12px;font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;'>Recent Jobs</p>" +
        "<div id='recentJobs'></div>" +
      "</div>" +
    "</div>" +
  "</div>"

  const drawer  = document.getElementById("menuDrawer")
  const overlay = document.getElementById("menuOverlay")
  function openMenu()  { drawer.style.transform = "translateX(0)";   overlay.style.display = "block" }
  function closeMenu() { drawer.style.transform = "translateX(100%)"; overlay.style.display = "none"  }
  overlay.addEventListener("click", closeMenu)
  document.getElementById("hamburgerBtn").addEventListener("click", openMenu)
  document.getElementById("notifNavBtn").addEventListener("click", () => { closeMenu(); showNotifications(user) })
  document.getElementById("menuNotifBtn").addEventListener("click",    () => { closeMenu(); showNotifications(user) })
  document.getElementById("menuProfileBtn").addEventListener("click",  () => { closeMenu(); showProfile(user) })
  document.getElementById("menuWalletBtn").addEventListener("click",   () => { closeMenu(); showWallet(user) })
  document.getElementById("menuContractsBtn").addEventListener("click",() => { closeMenu(); showMyContracts(user) })
  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {
    closeMenu(); await supabase.auth.signOut(); currentEmail = ""; currentUser = null; showLoginV2()
  })

  supabase.from("profiles").select("role").eq("id", user.id).single().then(function(res) {
    const role  = res.data?.role || "owner"
    const label = document.getElementById("menuFindWorkersLabel")
    if (label) label.textContent = role === "worker" ? "Find Work" : "Find Workers"
    document.getElementById("menuFindWorkersBtn").addEventListener("click", () => {
      closeMenu()
      if (role === "worker") showBrowseJobs(user)
      else showWorkerDiscovery(user)
    })
  })

  if (["cossybest24@gmail.com","cossyjay24@gmail.com","support@cosmas.dev"].includes(user.email)) {
    const ab = document.getElementById("menuAdminBtn")
    if (ab) { ab.style.display = "flex"; ab.addEventListener("click", () => { closeMenu(); showAdminPanel(user) }) }
  }

  document.getElementById("postJobBtn").addEventListener("click",   () => showPostJob(user))
  document.getElementById("browseJobsBtn").addEventListener("click",() => showBrowseJobs(user))
  document.getElementById("myJobsBtn").addEventListener("click",    () => showMyJobs(user))
  document.getElementById("myChatsBtn").addEventListener("click",   () => showMyChats(user))

  initNotifications(user)
  initPushNotifications(user)
  loadRecentJobs(user)
}`

// Replace lines 133 to 282 (indices 133 to 282) with new dashboard
const before = lines.slice(0, 133)
const after   = lines.slice(283)
const result  = [...before, ...newDashboard.split("\n"), ...after]
fs.writeFileSync("src/main.js", result.join("\n"), "utf8")
console.log("showDashboard rewritten successfully")
