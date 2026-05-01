const fs = require("fs")

const code = `import { supabase } from "./supabase.js"

const app = document.getElementById("app")
let currentEmail = ""
let currentUser  = null
let backStack    = []
let isGoingBack  = false
let notifChannel = null
let chatChannel  = null
let unreadCount  = 0

function pushScreen(name, fn) {
  if (isGoingBack) return
  if (backStack.length > 0 && backStack[backStack.length - 1].name === name) return
  backStack.push({ name, fn })
}

function popScreen() {
  if (backStack.length > 1) {
    backStack.pop()
    const prev = backStack[backStack.length - 1]
    if (prev && typeof prev.fn === "function") {
      isGoingBack = true
      prev.fn()
      setTimeout(() => { isGoingBack = false }, 100)
    }
  } else {
    try {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        import("@capacitor/app").then(({ App }) => { App.exitApp() }).catch(() => {})
      }
    } catch(e) {}
  }
}

function setupAndroidBack() {
  try {
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      import("@capacitor/app").then(({ App }) => {
        App.addListener("backButton", () => { popScreen() })
      }).catch(() => {})
    }
  } catch(e) {}
}

function showErr(id, msg) {
  const el = document.getElementById(id)
  if (el) { el.textContent = msg; el.style.display = "block" }
}
function hideErr(id) {
  const el = document.getElementById(id)
  if (el) el.style.display = "none"
}
function setBtn(id, loading, label) {
  const b = document.getElementById(id)
  if (!b) return
  b.disabled = loading
  b.textContent = loading ? "Please wait..." : label
}

function escapeHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")
}

function navBar(title) {
  return "<nav style='position:sticky;top:0;z-index:20;background:rgba(30,27,75,0.97);border-bottom:1px solid rgba(99,102,241,0.3);padding:14px 16px;'><div style='max-width:520px;margin:0 auto;display:flex;align-items:center;gap:12px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:24px;cursor:pointer;padding:0;line-height:1;min-width:36px;min-height:36px;'>&#8592;</button><span style='color:#ffffff;font-size:17px;font-weight:700;'>" + title + "</span></div></nav>"
}

function showLoading() {
  app.innerHTML = "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='text-align:center;'><div style='width:52px;height:52px;border:4px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;'></div><p style='color:#a5b4fc;font-size:14px;margin:0;'>Loading ProFix...</p></div></div>"
}

function showLogin() {
  backStack = []
  isGoingBack = false
  pushScreen("login", showLogin)
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='text-align:center;margin-bottom:28px;'><div style='display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;background:#4f46e5;border-radius:22px;margin-bottom:14px;box-shadow:0 16px 40px rgba(79,70,229,0.5);'><span style='font-size:34px;'>&#128295;</span></div><h1 style='color:#fff;font-size:34px;font-weight:800;margin:0;letter-spacing:-1px;'>ProFix</h1><p style='color:#a5b4fc;font-size:14px;margin:4px 0 0;'>Home services marketplace</p></div><div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'><h2 style='color:#111827;font-size:22px;font-weight:700;margin:0 0 4px;'>Sign in</h2><p style='color:#6b7280;font-size:14px;margin:0 0 22px;'>Enter your email to receive a code</p><label style='display:block;color:#374151;font-size:13px;font-weight:600;margin-bottom:7px;'>Email address</label><input id='emailInput' type='email' inputmode='email' autocomplete='email' placeholder='you@example.com' style='width:100%;padding:13px 15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:16px;outline:none;box-sizing:border-box;' /><p id='loginErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p><button id='continueBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Continue</button></div></div>"
  const btn = document.getElementById("continueBtn")
  const input = document.getElementById("emailInput")
  input.focus()
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") btn.click() })
  btn.addEventListener("click", async () => {
    const email = input.value.trim()
    hideErr("loginErr")
    if (!email) { showErr("loginErr", "Please enter your email address"); return }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) { showErr("loginErr", "Please enter a valid email address"); return }
    setBtn("continueBtn", true, "Continue")
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) { setBtn("continueBtn", false, "Continue"); showErr("loginErr", error.message); return }
    currentEmail = email
    showOTP()
  })
}

function showOTP() {
  pushScreen("otp", showOTP)
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='width:100%;max-width:400px;margin-bottom:14px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:14px;font-weight:600;cursor:pointer;padding:0;'>&#8592; Back</button></div><div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'><div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128231;</span><h2 style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Check your email</h2><p style='color:#6b7280;font-size:14px;margin:0;'>Code sent to <span style='color:#4f46e5;font-weight:600;'>" + currentEmail + "</span></p></div><input id='otpInput' type='tel' inputmode='numeric' autocomplete='one-time-code' maxlength='6' placeholder='000000' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' /><p id='otpErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p><button id='verifyBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Verify Code</button><button id='resendBtn' style='width:100%;margin-top:10px;padding:10px;background:none;color:#4f46e5;font-size:14px;font-weight:600;border:none;cursor:pointer;'>Resend code</button></div></div>"
  const verifyBtn = document.getElementById("verifyBtn")
  const otpInput  = document.getElementById("otpInput")
  otpInput.focus()
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  otpInput.addEventListener("input", () => { otpInput.value = otpInput.value.replace(/\\D/g, "").slice(0, 6) })
  otpInput.addEventListener("keydown", (e) => { if (e.key === "Enter") verifyBtn.click() })
  document.getElementById("resendBtn").addEventListener("click", async () => {
    const rb = document.getElementById("resendBtn")
    rb.disabled = true; rb.textContent = "Sending..."
    await supabase.auth.signInWithOtp({ email: currentEmail, options: { shouldCreateUser: true } })
    let secs = 30
    const tick = setInterval(() => {
      rb.textContent = "Resend in " + secs + "s"; secs--
      if (secs < 0) { clearInterval(tick); rb.disabled = false; rb.textContent = "Resend code" }
    }, 1000)
  })
  verifyBtn.addEventListener("click", async () => {
    const token = otpInput.value.trim()
    hideErr("otpErr")
    if (!token || token.length < 6) { showErr("otpErr", "Please enter the full 6-digit code"); return }
    setBtn("verifyBtn", true, "Verify Code")
    const { data, error } = await supabase.auth.verifyOtp({ email: currentEmail, token, type: "email" })
    if (error) { setBtn("verifyBtn", false, "Verify Code"); showErr("otpErr", "Incorrect code. Try again."); return }
    currentUser = data?.user
    if (currentUser) {
      await supabase.from("profiles").upsert({ id: currentUser.id, email: currentUser.email }, { onConflict: "id" })
    }
    showDashboard(currentUser)
  })
}

function showDashboard(user) {
  if (!isGoingBack) backStack = []
  pushScreen("dashboard", () => showDashboard(user))
  const email   = user?.email || currentEmail || "User"
  const initial = email[0].toUpperCase()

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" +

    "<div id='menuOverlay' style='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:40;'></div>" +

    "<div id='menuDrawer' style='position:fixed;top:0;right:0;width:270px;height:100%;background:#1e1b4b;border-left:1px solid rgba(99,102,241,0.3);z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow-y:auto;'>" +
      "<div style='padding:20px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;'>" +
        "<div style='width:42px;height:42px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:17px;flex-shrink:0;'>" + initial + "</div>" +
        "<div style='min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + email + "</p><p style='color:#a5b4fc;font-size:12px;margin:0;'>ProFix Account</p></div>" +
      "</div>" +
      "<div style='padding:10px 8px;'>" +
        "<button id='menuNotifBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128276;</span><span style='color:#fff;font-size:14px;font-weight:500;flex:1;text-align:left;'>Notifications</span>" +
          "<span id='drawerBadge' style='display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;'>0</span>" +
        "</button>" +
        "<button id='menuProfileBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128100;</span><span style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>My Profile</span>" +
        "</button>" +
        "<button id='menuAdminBtn' style='display:none;width:100%;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128274;</span><span style='color:#d97706;font-size:14px;font-weight:600;text-align:left;'>Admin Panel</span>" +
        "</button>" +
        "<div style='height:1px;background:rgba(255,255,255,0.08);margin:6px 14px;'></div>" +
        "<button id='menuSignOutBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128682;</span><span style='color:#f87171;font-size:14px;font-weight:500;text-align:left;'>Sign Out</span>" +
        "</button>" +
      "</div>" +
    "</div>" +

    "<nav style='position:sticky;top:0;z-index:20;background:rgba(30,27,75,0.97);border-bottom:1px solid rgba(99,102,241,0.3);padding:13px 16px;'>" +
      "<div style='max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;'>" +
        "<div style='display:flex;align-items:center;gap:10px;'>" +
          "<div style='width:34px;height:34px;background:#4f46e5;border-radius:10px;display:flex;align-items:center;justify-content:center;'><span style='font-size:17px;'>&#128295;</span></div>" +
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
    "</nav>" +

    "<div style='flex:1;padding:20px 16px;max-width:480px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div style='background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:20px;padding:18px 20px;margin-bottom:18px;box-shadow:0 8px 28px rgba(79,70,229,0.4);'>" +
        "<p style='color:#c4b5fd;font-size:13px;margin:0 0 3px;'>Welcome back &#128075;</p>" +
        "<p style='color:#fff;font-size:16px;font-weight:700;margin:0 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + email + "</p>" +
        "<p style='color:#c4b5fd;font-size:13px;margin:0;'>Your home services dashboard</p>" +
      "</div>" +
      "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;'>" +
        "<div style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;'><p style='color:#a5b4fc;font-size:11px;margin:0 0 5px;text-transform:uppercase;'>Active Jobs</p><p id='activeJobsCount' style='color:#fff;font-size:26px;font-weight:700;margin:0;'>0</p></div>" +
        "<div style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;'><p style='color:#a5b4fc;font-size:11px;margin:0 0 5px;text-transform:uppercase;'>In Escrow</p><p style='color:#fff;font-size:26px;font-weight:700;margin:0;'>&#8358;0</p></div>" +
      "</div>" +
      "<p style='color:#a5b4fc;font-size:11px;font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;'>Quick Actions</p>" +
      "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;'>" +
        "<button id='postJobBtn' style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128203;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>Post a Job</p><p style='color:#a5b4fc;font-size:11px;margin:0;'>Hire a professional</p></button>" +
        "<button id='myJobsBtn' style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128193;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>My Jobs</p><p style='color:#a5b4fc;font-size:11px;margin:0;'>View posted jobs</p></button>" +
        "<button id='browseJobsBtn' style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128269;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>Browse Jobs</p><p style='color:#a5b4fc;font-size:11px;margin:0;'>Find work near you</p></button>" +
        "<button id='myChatsBtn' style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:left;cursor:pointer;'><span style='font-size:24px;'>&#128172;</span><p style='color:#fff;font-size:13px;font-weight:600;margin:8px 0 2px;'>Messages</p><p style='color:#a5b4fc;font-size:11px;margin:0;'>Chat with workers</p></button>" +
      "</div>" +
      "<p style='color:#a5b4fc;font-size:11px;font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;'>Recent Jobs</p>" +
      "<div id='recentJobs' style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:28px;text-align:center;'><span style='font-size:36px;'>&#127959;</span><p style='color:#fff;font-size:14px;font-weight:600;margin:10px 0 3px;'>No jobs posted yet</p><p style='color:#a5b4fc;font-size:12px;margin:0;'>Tap Post a Job to get started</p></div>" +
    "</div>" +
    "</div>"

  // Hamburger menu
  const overlay  = document.getElementById("menuOverlay")
  const drawer   = document.getElementById("menuDrawer")
  function openMenu()  { drawer.style.transform = "translateX(0)"; overlay.style.display = "block" }
  function closeMenu() { drawer.style.transform = "translateX(100%)"; overlay.style.display = "none" }
  overlay.addEventListener("click", closeMenu)
  document.getElementById("hamburgerBtn").addEventListener("click", openMenu)
  document.getElementById("menuNotifBtn").addEventListener("click",   () => { closeMenu(); showNotifications(user) })
  document.getElementById("menuProfileBtn").addEventListener("click", () => { closeMenu(); showProfile(user) })
  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {
    closeMenu(); await supabase.auth.signOut(); currentEmail = ""; currentUser = null; showLogin()
  })
  document.getElementById("notifBtn").addEventListener("click", () => showNotifications(user))
  document.getElementById("postJobBtn").addEventListener("click", async () => {
    const { data: p } = await supabase.from("profiles").select("is_verified").eq("id", user.id).single()
    if (!p?.is_verified) { alert("KYC Required - Complete KYC verification before posting jobs. Go to My Profile to submit documents."); return }
    showPostJob(user)
  })
  document.getElementById("myJobsBtn").addEventListener("click",     () => showMyJobs(user))
  document.getElementById("browseJobsBtn").addEventListener("click", () => showBrowseJobs(user))
  document.getElementById("myChatsBtn").addEventListener("click",    () => showMyChats(user))

  initNotifications(user)
  loadRecentJobs(user)

  supabase.from("profiles").select("is_admin").eq("id", user.id).single().then(function(r) {
    if (r.data && r.data.is_admin) {
      const ab = document.getElementById("menuAdminBtn")
      if (ab) { ab.style.display = "flex"; ab.addEventListener("click", () => { closeMenu(); showAdminPanel(user) }) }
    }
  })
}

async function loadRecentJobs(user) {
  const { data: jobs } = await supabase.from("jobs").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(5)
  if (!jobs || jobs.length === 0) return
  const countEl = document.getElementById("activeJobsCount")
  if (countEl) countEl.textContent = jobs.filter(j => j.status === "open").length
  const container = document.getElementById("recentJobs")
  if (!container) return
  let html = ""
  jobs.forEach(function(job) {
    html += "<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:8px;'>" +
      "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;'>" +
        "<span style='background:#4f46e5;color:#fff;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;'>" + (job.category||"General") + "</span>" +
        "<span style='color:" + (job.status==="open"?"#34d399":"#9ca3af") + ";font-size:11px;font-weight:600;'>" + (job.status||"open").toUpperCase() + "</span>" +
      "</div>" +
      "<p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 3px;'>" + job.title + "</p>" +
      "<p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (job.description||"") + "</p>" +
    "</div>"
  })
  container.innerHTML = html
}

async function showBrowseJobs(user) {
  pushScreen("browse", () => showBrowseJobs(user))
  const CATS = ["All","Plumbing","Electrical","Carpentry","Painting","Cleaning","Landscaping","Roofing","HVAC","Security","Tech","Building & Construction","Tiling & Flooring","Welding & Fabrication","Generator & Solar","AC Repair","Fumigation & Pest Control","Interior Design","Moving & Logistics","Catering & Events","Fashion & Tailoring","Photography","Tutoring","Other"]
  let pillsHtml = ""
  CATS.forEach(function(cat, i) {
    pillsHtml += "<button class='catPill' data-cat='" + cat + "' style='padding:7px 15px;border-radius:20px;border:1.5px solid " + (i===0?"#4f46e5":"rgba(255,255,255,0.2)") + ";background:" + (i===0?"#4f46e5":"transparent") + ";color:" + (i===0?"#fff":"#a5b4fc") + ";font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>" + cat + "</button>"
  })
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Browse Jobs") + "<div style='flex:1;padding:14px 16px 32px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div style='position:relative;margin-bottom:12px;'><input id='searchInput' type='text' placeholder='Search jobs...' style='width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#ffffff;font-size:15px;outline:none;box-sizing:border-box;' /></div><div style='overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:14px;padding-bottom:6px;scrollbar-width:none;'><div id='pillsRow' style='display:inline-flex;gap:7px;padding:2px 4px;'>" + pillsHtml + "</div></div><p id='jobsCountLabel' style='color:#6b7280;font-size:13px;margin:0 0 12px;'>Loading jobs...</p><div id='browseList'><div style='text-align:center;padding:48px 0;'><div style='width:40px;height:40px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div><p style='color:#a5b4fc;font-size:14px;margin:0;'>Loading jobs...</p></div></div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  let selectedCat = "All", searchTerm = "", allJobs = []
  const { data: jobs } = await supabase.from("jobs").select("*").eq("status","open").order("created_at",{ascending:false})
  allJobs = jobs || []
  renderBrowse()
  document.getElementById("pillsRow").addEventListener("click", (e) => {
    const pill = e.target.closest(".catPill")
    if (!pill) return
    selectedCat = pill.dataset.cat
    document.querySelectorAll(".catPill").forEach(p => {
      const a = p.dataset.cat === selectedCat
      p.style.background = a?"#4f46e5":"transparent"; p.style.borderColor = a?"#4f46e5":"rgba(255,255,255,0.2)"; p.style.color = a?"#fff":"#a5b4fc"
    })
    renderBrowse()
  })
  document.getElementById("searchInput").addEventListener("input", (e) => { searchTerm = e.target.value.toLowerCase().trim(); renderBrowse() })
  function renderBrowse() {
    let f = allJobs
    if (selectedCat !== "All") f = f.filter(j => (j.category||"") === selectedCat)
    if (searchTerm) f = f.filter(j => (j.title||"").toLowerCase().includes(searchTerm)||(j.description||"").toLowerCase().includes(searchTerm)||(j.location||"").toLowerCase().includes(searchTerm))
    const cl = document.getElementById("jobsCountLabel")
    if (cl) cl.textContent = f.length===0?"No jobs found":f.length+" job"+(f.length===1?"":"s")+" available"
    const c = document.getElementById("browseList")
    if (!c) return
    if (f.length===0) { c.innerHTML = "<div style='text-align:center;padding:48px 16px;'><span style='font-size:44px;'>&#128269;</span><p style='color:#fff;font-size:16px;font-weight:600;margin:14px 0 6px;'>No jobs found</p></div>"; return }
    let html = ""
    f.forEach(function(job) {
      html += "<div class='jobCard' data-id='" + job.id + "' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);border-radius:16px;padding:16px;margin-bottom:12px;cursor:pointer;'>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;'><span style='background:#4f46e5;color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;'>" + (job.category||"General") + "</span><span style='color:#34d399;font-size:12px;font-weight:700;'>OPEN</span></div>" +
        "<p style='color:#fff;font-size:15px;font-weight:600;margin:0 0 6px;'>" + job.title + "</p>" +
        "<p style='color:#a5b4fc;font-size:13px;margin:0 0 12px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;'>" + (job.description||"") + "</p>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;'>" +
          "<span style='color:#6b7280;font-size:12px;'>" + (job.location?"&#128205; "+job.location:"") + "</span>" +
          "<button class='applyBtn' data-id='" + job.id + "' style='background:#4f46e5;color:#fff;font-size:13px;font-weight:600;padding:8px 18px;border:none;border-radius:8px;cursor:pointer;'>Apply</button>" +
        "</div>" +
      "</div>"
    })
    c.innerHTML = html
    c.querySelectorAll(".applyBtn").forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); const j = allJobs.find(x => x.id===b.dataset.id); if(j) showApplyModal(j,user) }))
    c.querySelectorAll(".jobCard").forEach(b => b.addEventListener("click", () => { const j = allJobs.find(x => x.id===b.dataset.id); if(j) showJobDetail(j,user) }))
  }
}

function showJobDetail(job, user) {
  pushScreen("jobDetail", () => showJobDetail(job, user))
  const actionBtn = job.owner_id !== user?.id
    ? "<button id='applyBtn' style='width:100%;padding:15px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:52px;'>Apply for this Job</button>"
    : "<div style='background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:14px;padding:14px;text-align:center;margin-bottom:10px;'><p style='color:#34d399;font-size:14px;font-weight:600;margin:0;'>This is your job posting</p></div>"
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Job Details") + "<div style='flex:1;padding:18px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;'><span style='background:#4f46e5;color:#fff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;'>" + (job.category||"General") + "</span><span style='color:#34d399;font-size:13px;font-weight:700;'>OPEN</span></div><h2 style='color:#fff;font-size:21px;font-weight:700;margin:0 0 12px;'>" + job.title + "</h2>" + (job.location?"<p style='color:#a5b4fc;font-size:13px;margin:0 0 14px;'>&#128205; "+job.location+"</p>":"") + "<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;margin-bottom:22px;'><p style='color:#a5b4fc;font-size:11px;font-weight:600;margin:0 0 8px;text-transform:uppercase;'>Description</p><p style='color:#e0e7ff;font-size:14px;margin:0;line-height:1.7;'>" + (job.description||"") + "</p></div>" + actionBtn + "</div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const ab = document.getElementById("applyBtn")
  if (ab) ab.addEventListener("click", () => showApplyModal(job, user))
}

function showApplyModal(job, user) {
  pushScreen("apply", () => showApplyModal(job, user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Apply for Job") + "<div style='flex:1;padding:18px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;margin-bottom:22px;'><p style='color:#fff;font-size:15px;font-weight:600;margin:0;'>" + job.title + "</p></div><div style='margin-bottom:18px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:8px;'>Your proposed price (&#8358;) *</label><input id='proposedPrice' type='number' placeholder='e.g. 15000' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:16px;outline:none;box-sizing:border-box;' /></div><div style='margin-bottom:18px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:8px;'>Cover note *</label><textarea id='coverNote' placeholder='Introduce yourself...' rows='5' maxlength='500' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;resize:none;line-height:1.6;'></textarea></div><div style='margin-bottom:26px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:8px;'>Available to start</label><select id='availability' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;min-height:48px;'><option value='immediately'>Immediately</option><option value='within_24h'>Within 24 hours</option><option value='within_3days'>Within 3 days</option><option value='this_week'>This week</option><option value='next_week'>Next week</option></select></div><p id='applyErr' style='color:#f87171;font-size:13px;margin:0 0 14px;display:none;background:rgba(239,68,68,0.1);padding:12px;border-radius:10px;'></p><button id='submitApplyBtn' style='width:100%;padding:15px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;min-height:52px;'>Submit Application</button></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.getElementById("submitApplyBtn").addEventListener("click", async () => {
    const { data: p } = await supabase.from("profiles").select("is_verified").eq("id", user.id).single()
    if (!p?.is_verified) { alert("KYC Required - Complete KYC verification before applying for jobs. Go to My Profile to submit documents."); return }
    const price = parseInt(document.getElementById("proposedPrice").value) || 0
    const note  = document.getElementById("coverNote").value.trim()
    const avail = document.getElementById("availability").value
    hideErr("applyErr")
    if (!price||price<=0) { showErr("applyErr","Please enter your proposed price"); return }
    if (!note)            { showErr("applyErr","Please write a cover note"); return }
    if (note.length<20)   { showErr("applyErr","Cover note must be at least 20 characters"); return }
    setBtn("submitApplyBtn", true, "Submit Application")
    const { error } = await supabase.from("applications").insert({ job_id:job.id, applicant_id:user.id, applicant_email:user.email, proposed_price:price, cover_note:note, availability:avail, status:"pending" })
    if (error) { setBtn("submitApplyBtn",false,"Submit Application"); showErr("applyErr",error.message.includes("unique")||error.message.includes("duplicate")?"You have already applied for this job":error.message); return }
    showApplySuccess(job, user)
  })
}

function showApplySuccess(job, user) {
  app.innerHTML = "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'><div style='width:100%;max-width:380px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:36px 24px;text-align:center;'><span style='font-size:52px;'>&#127881;</span><h2 style='color:#fff;font-size:22px;font-weight:700;margin:16px 0 8px;'>Application Sent!</h2><p style='color:#a5b4fc;font-size:14px;margin:0 0 28px;'>Applied for <strong style='color:#fff;'>" + job.title + "</strong></p><button id='startChatBtn' style='width:100%;padding:14px;background:#059669;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin-bottom:10px;min-height:50px;'>&#128172; Start Chat with Owner</button><button id='browseMoreBtn' style='width:100%;padding:13px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin-bottom:10px;min-height:50px;'>Browse More Jobs</button><button id='dashboardBtn' style='width:100%;padding:13px;background:rgba(255,255,255,0.08);color:#a5b4fc;font-size:14px;font-weight:600;border:none;border-radius:12px;cursor:pointer;min-height:48px;'>Back to Dashboard</button></div></div>"
  document.getElementById("startChatBtn").addEventListener("click", async () => {
    const roomId = await getOrCreateChatRoom(user, job)
    if (roomId) showChatRoom(user, roomId, job.title, job.owner_email||"")
    else alert("Could not open chat. Please try again.")
  })
  document.getElementById("browseMoreBtn").addEventListener("click", () => showBrowseJobs(user))
  document.getElementById("dashboardBtn").addEventListener("click",  () => showDashboard(user))
}

async function showMyJobs(user) {
  pushScreen("myJobs", () => showMyJobs(user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("My Jobs") + "<div style='flex:1;padding:20px 16px;max-width:480px;margin:0 auto;width:100%;box-sizing:border-box;'><div id='jobsList' style='text-align:center;color:#a5b4fc;padding:40px 0;'><div style='width:40px;height:40px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>Loading your jobs...</div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const { data: jobs, error } = await supabase.from("jobs").select("*").eq("owner_id",user.id).order("created_at",{ascending:false})
  const container = document.getElementById("jobsList")
  if (!container) return
  if (error) { container.innerHTML = "<p style='color:#f87171;text-align:center;'>Failed to load jobs</p>"; return }
  if (!jobs||jobs.length===0) {
    container.innerHTML = "<div style='text-align:center;padding:40px 0;'><span style='font-size:44px;'>&#128203;</span><p style='color:#fff;font-size:15px;font-weight:600;margin:14px 0 7px;'>No jobs yet</p><button id='postFirstJob' style='padding:12px 26px;background:#4f46e5;color:#fff;font-size:14px;font-weight:600;border:none;border-radius:12px;cursor:pointer;min-height:48px;'>Post a Job</button></div>"
    document.getElementById("postFirstJob").addEventListener("click", () => showPostJob(user))
    return
  }
  let html = ""
  jobs.forEach(function(job) {
    html += "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px;margin-bottom:10px;'>" +
      "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;'><span style='background:#4f46e5;color:#fff;font-size:10px;font-weight:600;padding:2px 9px;border-radius:20px;'>" + (job.category||"General") + "</span><span style='color:" + (job.status==="open"?"#34d399":"#9ca3af") + ";font-size:11px;font-weight:700;'>" + (job.status||"open").toUpperCase() + "</span></div>" +
      "<p style='color:#fff;font-size:15px;font-weight:600;margin:0 0 5px;'>" + job.title + "</p>" +
      "<p style='color:#6b7280;font-size:12px;margin:0 0 10px;'>&#128205; " + (job.location||"Not specified") + "</p>" +
      "<button class='viewAppsBtn' data-jobid='" + job.id + "' style='width:100%;padding:10px;background:rgba(79,70,229,0.2);color:#818cf8;font-size:13px;font-weight:600;border:1px solid rgba(79,70,229,0.3);border-radius:10px;cursor:pointer;min-height:42px;'>&#128203; View Applications</button>" +
    "</div>"
  })
  container.innerHTML = html
  container.querySelectorAll(".viewAppsBtn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      const job = jobs.find(j => j.id===btn.dataset.jobid)
      if (job) showJobApplications(user, job)
    })
  })
}

async function showJobApplications(user, job) {
  pushScreen("jobApplications", () => showJobApplications(user, job))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Applications") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;margin-bottom:16px;'><p style='color:#a5b4fc;font-size:12px;margin:0 0 3px;'>Applications for</p><p style='color:#fff;font-size:15px;font-weight:600;margin:0;'>" + job.title + "</p></div><div id='appsList' style='text-align:center;color:#a5b4fc;padding:40px 0;'><div style='width:40px;height:40px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>Loading...</div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const { data: apps, error } = await supabase.from("applications").select("*").eq("job_id",job.id).order("created_at",{ascending:false})
  const container = document.getElementById("appsList")
  if (!container) return
  if (error) { container.innerHTML = "<p style='color:#f87171;text-align:center;'>Failed to load: " + error.message + "</p>"; return }
  if (!apps||apps.length===0) { container.innerHTML = "<div style='text-align:center;padding:48px 16px;'><span style='font-size:48px;'>&#128203;</span><p style='color:#fff;font-size:16px;font-weight:600;margin:16px 0 8px;'>No applications yet</p></div>"; return }
  const ss = { pending:{bg:"rgba(251,191,36,0.1)",color:"#fbbf24",label:"Pending"}, accepted:{bg:"rgba(52,211,153,0.1)",color:"#34d399",label:"Accepted"}, rejected:{bg:"rgba(239,68,68,0.1)",color:"#f87171",label:"Rejected"} }
  const av = { immediately:"Immediately", within_24h:"Within 24h", within_3days:"Within 3 days", this_week:"This week", next_week:"Next week" }
  let html = "<p style='color:#a5b4fc;font-size:13px;margin:0 0 14px;'>" + apps.length + " application" + (apps.length===1?"":"s") + " received</p>"
  apps.forEach(function(ap) {
    const st = ss[ap.status]||ss.pending
    const initial = (ap.applicant_email||"W")[0].toUpperCase()
    const date = new Date(ap.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short"})
    const price = Number(ap.proposed_price||0).toLocaleString()
    const avail = av[ap.availability]||ap.availability||"N/A"
    let btns = ""
    if (ap.status==="pending") {
      btns = "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;'>" +
        "<button class='chatBtn' data-email='" + ap.applicant_email + "' data-workerid='" + ap.applicant_id + "' style='padding:10px 4px;background:rgba(99,102,241,0.15);color:#818cf8;font-size:12px;font-weight:600;border:1px solid rgba(99,102,241,0.3);border-radius:10px;cursor:pointer;min-height:42px;'>&#128172; Chat</button>" +
        "<button class='rejectBtn' data-id='" + ap.id + "' style='padding:10px 4px;background:rgba(239,68,68,0.1);color:#f87171;font-size:12px;font-weight:600;border:1px solid rgba(239,68,68,0.2);border-radius:10px;cursor:pointer;min-height:42px;'>&#10005; Reject</button>" +
        "<button class='acceptBtn' data-id='" + ap.id + "' data-email='" + ap.applicant_email + "' data-workerid='" + ap.applicant_id + "' style='padding:10px 4px;background:#059669;color:#fff;font-size:12px;font-weight:600;border:none;border-radius:10px;cursor:pointer;min-height:42px;'>&#10003; Accept</button>" +
      "</div>"
    } else if (ap.status==="accepted") {
      btns = "<div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;'><button class='chatBtn' data-email='" + ap.applicant_email + "' data-workerid='" + ap.applicant_id + "' style='padding:10px;background:rgba(99,102,241,0.15);color:#818cf8;font-size:13px;font-weight:600;border:1px solid rgba(99,102,241,0.3);border-radius:10px;cursor:pointer;min-height:44px;'>&#128172; Open Chat</button><div style='background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;'><p style='color:#34d399;font-size:12px;font-weight:600;margin:0;'>&#10003; Accepted</p></div></div>"
    } else {
      btns = "<div style='background:rgba(239,68,68,0.06);border-radius:10px;padding:10px;text-align:center;'><p style='color:#f87171;font-size:12px;margin:0;'>Application rejected</p></div>"
    }
    html += "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px;margin-bottom:14px;'>" +
      "<div style='display:flex;align-items:center;gap:12px;margin-bottom:14px;'>" +
        "<div style='width:44px;height:44px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:17px;flex-shrink:0;'>" + initial + "</div>" +
        "<div style='flex:1;min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (ap.applicant_email||"Unknown") + "</p><p style='color:#6b7280;font-size:12px;margin:0;'>Applied " + date + "</p></div>" +
        "<span style='background:" + st.bg + ";color:" + st.color + ";font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;flex-shrink:0;'>" + st.label + "</span>" +
      "</div>" +
      "<div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;'>" +
        "<div style='background:rgba(255,255,255,0.04);border-radius:10px;padding:10px 12px;'><p style='color:#a5b4fc;font-size:10px;font-weight:600;margin:0 0 4px;text-transform:uppercase;'>Proposed Price</p><p style='color:#34d399;font-size:16px;font-weight:700;margin:0;'>&#8358;" + price + "</p></div>" +
        "<div style='background:rgba(255,255,255,0.04);border-radius:10px;padding:10px 12px;'><p style='color:#a5b4fc;font-size:10px;font-weight:600;margin:0 0 4px;text-transform:uppercase;'>Availability</p><p style='color:#c7d2fe;font-size:13px;font-weight:600;margin:0;'>" + avail + "</p></div>" +
      "</div>" +
      "<div style='background:rgba(255,255,255,0.04);border-radius:10px;padding:12px;margin-bottom:14px;'><p style='color:#a5b4fc;font-size:10px;font-weight:600;margin:0 0 6px;text-transform:uppercase;'>Cover Note</p><p style='color:#e0e7ff;font-size:13px;margin:0;line-height:1.6;'>" + (ap.cover_note||"No cover note") + "</p></div>" +
      btns +
    "</div>"
  })
  container.innerHTML = html
  container.querySelectorAll(".chatBtn").forEach(function(btn) {
    btn.addEventListener("click", async function() {
      const roomId = await getOrCreateRoomAsOwner(user, job, btn.dataset.email, btn.dataset.workerid)
      if (roomId) showChatRoom(user, roomId, job.title, btn.dataset.email)
      else alert("Could not open chat.")
    })
  })
  container.querySelectorAll(".acceptBtn").forEach(function(btn) {
    btn.addEventListener("click", async function() {
      if (!confirm("Accept this application?")) return
      btn.disabled = true; btn.textContent = "..."
      const { error } = await supabase.from("applications").update({status:"accepted",responded_at:new Date().toISOString()}).eq("id",btn.dataset.id)
      if (error) { alert("Failed: "+error.message); btn.disabled = false; return }
      await getOrCreateRoomAsOwner(user, job, btn.dataset.email, btn.dataset.workerid)
      showJobApplications(user, job)
    })
  })
  container.querySelectorAll(".rejectBtn").forEach(function(btn) {
    btn.addEventListener("click", async function() {
      if (!confirm("Reject this application?")) return
      btn.disabled = true; btn.textContent = "..."
      const { error } = await supabase.from("applications").update({status:"rejected",responded_at:new Date().toISOString()}).eq("id",btn.dataset.id)
      if (error) { alert("Failed: "+error.message); btn.disabled = false; return }
      showJobApplications(user, job)
    })
  })
}

async function getOrCreateRoomAsOwner(user, job, workerEmail, workerId) {
  if (!workerId) { alert("Worker ID not found."); return null }
  const { data: existing } = await supabase.from("chat_rooms").select("id").eq("job_id",job.id).eq("worker_id",workerId).maybeSingle()
  if (existing) return existing.id
  const { data: newRoom, error } = await supabase.from("chat_rooms").insert({ job_id:job.id, owner_id:user.id, worker_id:workerId, owner_email:user.email, worker_email:workerEmail, job_title:job.title }).select("id").single()
  if (error) { console.error("Room error:",error.message); return null }
  return newRoom.id
}

async function getOrCreateChatRoom(user, job) {
  const { data: existing } = await supabase.from("chat_rooms").select("id").eq("job_id",job.id).eq("worker_id",user.id).maybeSingle()
  if (existing) return existing.id
  const { data: newRoom, error } = await supabase.from("chat_rooms").insert({ job_id:job.id, owner_id:job.owner_id, worker_id:user.id, owner_email:job.owner_email||"", worker_email:user.email, job_title:job.title }).select("id").single()
  if (error) { console.error("Room error:",error.message); return null }
  return newRoom.id
}

async function showMyChats(user) {
  pushScreen("myChats", () => showMyChats(user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Messages") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div id='chatsList' style='text-align:center;color:#a5b4fc;padding:40px 0;'><div style='width:40px;height:40px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>Loading chats...</div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const { data: rooms, error } = await supabase.from("chat_rooms").select("*").or("owner_id.eq."+user.id+",worker_id.eq."+user.id).order("created_at",{ascending:false})
  const container = document.getElementById("chatsList")
  if (!container) return
  if (error) { container.innerHTML = "<p style='color:#f87171;text-align:center;'>Failed to load</p>"; return }
  if (!rooms||rooms.length===0) {
    container.innerHTML = "<div style='text-align:center;padding:48px 16px;'><span style='font-size:48px;'>&#128172;</span><p style='color:#fff;font-size:16px;font-weight:600;margin:16px 0 8px;'>No chats yet</p><button id='browseBtn' style='padding:12px 28px;background:#4f46e5;color:#fff;font-size:15px;font-weight:600;border:none;border-radius:12px;cursor:pointer;min-height:48px;'>Browse Jobs</button></div>"
    document.getElementById("browseBtn")?.addEventListener("click", () => showBrowseJobs(user))
    return
  }
  let html = ""
  rooms.forEach(function(room) {
    const isOwner = room.owner_id===user.id
    const otherEmail = isOwner?room.worker_email:room.owner_email
    const initial = (otherEmail||"U")[0].toUpperCase()
    html += "<div class='chatCard' data-id='" + room.id + "' data-title='" + (room.job_title||"Chat") + "' data-other='" + (otherEmail||"") + "' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);border-radius:16px;padding:16px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:14px;'>" +
      "<div style='width:46px;height:46px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;'>" + initial + "</div>" +
      "<div style='flex:1;min-width:0;'><p style='color:#fff;font-size:15px;font-weight:600;margin:0 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (room.job_title||"Job Chat") + "</p><p style='color:#a5b4fc;font-size:13px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (otherEmail||"Unknown") + "</p></div>" +
      "<span style='color:#a5b4fc;font-size:22px;'>&#8250;</span></div>"
  })
  container.innerHTML = html
  container.querySelectorAll(".chatCard").forEach(function(card) {
    card.addEventListener("click", function() { showChatRoom(user, card.dataset.id, card.dataset.title, card.dataset.other) })
  })
}

async function showChatRoom(user, roomId, jobTitle, otherEmail) {
  pushScreen("chat", () => showChatRoom(user, roomId, jobTitle, otherEmail))
  if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null }
  const initial = (otherEmail||"U")[0].toUpperCase()
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'><nav style='position:sticky;top:0;z-index:20;background:rgba(30,27,75,0.97);border-bottom:1px solid rgba(99,102,241,0.3);padding:12px 16px;'><div style='max-width:520px;margin:0 auto;display:flex;align-items:center;gap:12px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:24px;cursor:pointer;padding:0;min-width:36px;min-height:36px;line-height:1;'>&#8592;</button><div style='width:38px;height:38px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0;'>" + initial + "</div><div style='flex:1;min-width:0;'><p style='color:#fff;font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (otherEmail||"User") + "</p><p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + jobTitle + "</p></div></div></nav><div id='messagesContainer' style='flex:1;overflow-y:auto;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;min-height:0;'><div id='loadingMsg' style='text-align:center;padding:20px 0;'><div style='width:36px;height:36px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;'></div></div></div><div style='position:sticky;bottom:0;background:rgba(30,27,75,0.97);border-top:1px solid rgba(99,102,241,0.3);padding:12px 16px;box-sizing:border-box;'><div style='max-width:520px;margin:0 auto;display:flex;gap:10px;align-items:flex-end;'><textarea id='msgInput' placeholder='Type a message...' rows='1' maxlength='2000' style='flex:1;padding:11px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.2);color:#111827;background:#fff;font-size:15px;outline:none;resize:none;line-height:1.5;max-height:100px;overflow-y:auto;box-sizing:border-box;font-family:inherit;'></textarea><button id='sendBtn' style='width:46px;height:46px;background:#4f46e5;border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='color:#fff;font-size:20px;'>&#10148;</span></button></div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => {
    if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null }
    popScreen()
  })
  await loadMessages(user, roomId)
  const msgInput = document.getElementById("msgInput")
  const sendBtn  = document.getElementById("sendBtn")
  msgInput.addEventListener("input", function() { this.style.height="auto"; this.style.height=Math.min(this.scrollHeight,100)+"px" })
  msgInput.addEventListener("keydown", (e) => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendBtn.click() } })
  sendBtn.addEventListener("click", async () => {
    const content = msgInput.value.trim()
    if (!content) return
    msgInput.value = ""; msgInput.style.height = "auto"; sendBtn.disabled = true
    const { error } = await supabase.from("messages").insert({ room_id:roomId, sender_id:user.id, sender_email:user.email, content })
    sendBtn.disabled = false
    if (error) alert("Failed to send: "+error.message)
  })
  chatChannel = supabase.channel("room_"+roomId).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"room_id=eq."+roomId},(payload) => {
    appendMessage(user, payload.new); scrollToBottom()
    if (payload.new.sender_id!==user.id) supabase.from("messages").update({is_read:true}).eq("id",payload.new.id).then(()=>{})
  }).subscribe()
}

async function loadMessages(user, roomId) {
  const { data: messages, error } = await supabase.from("messages").select("*").eq("room_id",roomId).order("created_at",{ascending:true}).limit(100)
  const container = document.getElementById("messagesContainer")
  if (!container) return
  const loader = document.getElementById("loadingMsg")
  if (loader) loader.remove()
  if (error) { container.innerHTML = "<p style='color:#f87171;text-align:center;'>Failed to load messages</p>"; return }
  if (!messages||messages.length===0) {
    const empty = document.createElement("div"); empty.id="emptyMsg"; empty.style.cssText="text-align:center;padding:32px 16px;"
    empty.innerHTML = "<span style='font-size:40px;'>&#128172;</span><p style='color:#a5b4fc;font-size:14px;margin:12px 0 0;'>No messages yet. Say hello!</p>"
    container.appendChild(empty); return
  }
  messages.forEach(msg => appendMessage(user, msg)); scrollToBottom()
  const unread = messages.filter(m=>m.sender_id!==user.id&&!m.is_read).map(m=>m.id)
  if (unread.length>0) supabase.from("messages").update({is_read:true}).in("id",unread).then(()=>{})
}

function appendMessage(user, msg) {
  const container = document.getElementById("messagesContainer")
  if (!container) return
  const empty = document.getElementById("emptyMsg"); if (empty) empty.remove()
  const isMine = msg.sender_id===user.id
  const time = new Date(msg.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
  const wrapper = document.createElement("div"); wrapper.style.cssText="display:flex;flex-direction:column;align-items:"+(isMine?"flex-end":"flex-start")+";"
  wrapper.innerHTML = "<div style='max-width:80%;padding:10px 14px;border-radius:"+(isMine?"18px 18px 4px 18px":"18px 18px 18px 4px")+";background:"+(isMine?"#4f46e5":"rgba(255,255,255,0.12)")+";color:#fff;font-size:14px;line-height:1.5;word-break:break-word;white-space:pre-wrap;'>" + escapeHtml(msg.content) + "</div><span style='color:#6b7280;font-size:11px;margin-top:3px;padding:0 4px;'>" + time + "</span>"
  container.appendChild(wrapper)
}

function scrollToBottom() { const c=document.getElementById("messagesContainer"); if(c) c.scrollTop=c.scrollHeight }

function showPostJob(user) {
  pushScreen("postJob", () => showPostJob(user))
  let uploadedPhotos=[], uploadedVideo=null, isRemote=false
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'><nav style='position:sticky;top:0;z-index:20;background:rgba(30,27,75,0.97);border-bottom:1px solid rgba(99,102,241,0.3);padding:13px 16px;'><div style='max-width:520px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;'><div style='display:flex;align-items:center;gap:10px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:22px;cursor:pointer;padding:0;line-height:1;min-width:36px;min-height:36px;'>&#8592;</button><span style='color:#fff;font-size:17px;font-weight:700;'>Post a Job</span></div><button id='cancelTopBtn' style='background:none;border:none;color:#a5b4fc;font-size:14px;font-weight:600;cursor:pointer;min-height:36px;padding:0 8px;'>Cancel</button></div></nav><div style='flex:1;padding:18px 16px 48px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div style='margin-bottom:20px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:7px;'>Job title *</label><input id='jobTitle' type='text' placeholder='e.g. Fix leaking kitchen pipe' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div><div style='margin-bottom:20px;'><div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;'><label style='color:#e0e7ff;font-size:14px;font-weight:600;'>Description *</label><span id='descCount' style='color:#6b7280;font-size:12px;'>0 chars</span></div><textarea id='jobDesc' placeholder='Describe the job in detail...' rows='4' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;resize:none;line-height:1.6;'></textarea></div><div style='margin-bottom:20px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:7px;'>Category *</label><select id='jobCategory' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;min-height:48px;'><option value=''>Select category</option><option>Plumbing</option><option>Electrical</option><option>Carpentry</option><option>Painting</option><option>Cleaning</option><option>Landscaping</option><option>Roofing</option><option>HVAC</option><option>Security</option><option>Tech</option><option>Building and Construction</option><option>Tiling and Flooring</option><option>Welding and Fabrication</option><option>Generator and Solar</option><option>AC Repair</option><option>Fumigation and Pest Control</option><option>Interior Design</option><option>Moving and Logistics</option><option>Catering and Events</option><option>Fashion and Tailoring</option><option>Photography</option><option>Tutoring</option><option>Other</option></select></div><div style='margin-bottom:20px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:7px;'>Location</label><input id='jobLocation' type='text' placeholder='e.g. Lekki, Lagos' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div><div style='margin-bottom:20px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:4px;'>Photos * (2-4 required)</label><div id='photoZone' style='border:2px dashed rgba(255,255,255,0.2);border-radius:14px;padding:26px 16px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.03);'><span style='font-size:30px;'>&#128247;</span><p style='color:#a5b4fc;font-size:14px;font-weight:500;margin:9px 0 3px;'>Click to upload photos</p><input id='photoInput' type='file' accept='image/jpeg,image/png,image/webp' multiple style='display:none;' /></div><div id='photoPreview' style='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;'></div><p id='photoErr' style='color:#f87171;font-size:12px;margin:5px 0 0;display:none;'></p><p id='photoCount' style='color:#6b7280;font-size:12px;margin:5px 0 0;'>0 of 4 photos selected</p></div><div style='margin-bottom:20px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:4px;'>Video (optional)</label><div id='videoZone' style='border:2px dashed rgba(255,255,255,0.2);border-radius:14px;padding:20px 16px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.03);'><span style='font-size:26px;'>&#127909;</span><p style='color:#a5b4fc;font-size:14px;font-weight:500;margin:8px 0 0;'>Add a video walkthrough</p><input id='videoInput' type='file' accept='video/*' style='display:none;' /></div><p id='videoName' style='color:#34d399;font-size:12px;margin:7px 0 0;display:none;'></p></div><div style='margin-bottom:20px;'><label style='display:block;color:#e0e7ff;font-size:14px;font-weight:600;margin-bottom:7px;'>Skills needed</label><input id='jobSkills' type='text' placeholder='e.g. Plumbing, Welding (comma separated)' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div><div style='margin-bottom:26px;'><div style='display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:15px;'><div><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;'>Remote job</p><p style='color:#a5b4fc;font-size:12px;margin:0;'>This job can be done from anywhere</p></div><div id='remoteToggle' style='width:48px;height:26px;background:#374151;border-radius:13px;cursor:pointer;position:relative;transition:background 0.25s;flex-shrink:0;'><div id='remoteThumb' style='width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:3px;left:3px;transition:left 0.25s;box-shadow:0 1px 4px rgba(0,0,0,0.3);'></div></div></div></div><p id='postErr' style='color:#f87171;font-size:13px;margin:0 0 14px;display:none;background:rgba(239,68,68,0.1);padding:12px;border-radius:10px;'></p><div id='uploadProgress' style='display:none;margin-bottom:14px;'><p style='color:#a5b4fc;font-size:13px;margin:0 0 7px;'>Uploading...</p><div style='background:rgba(255,255,255,0.1);border-radius:6px;height:5px;'><div id='progressBar' style='background:#4f46e5;height:5px;border-radius:6px;width:0%;transition:width 0.3s;'></div></div></div><div style='display:grid;grid-template-columns:1fr 2fr;gap:10px;'><button id='cancelBtn' style='padding:14px;background:rgba(255,255,255,0.07);color:#a5b4fc;font-size:14px;font-weight:600;border:1px solid rgba(255,255,255,0.12);border-radius:12px;cursor:pointer;min-height:50px;'>Cancel</button><button id='submitJobBtn' style='padding:14px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Post Job</button></div></div></div>"
  document.getElementById("backBtn").addEventListener("click",      () => popScreen())
  document.getElementById("cancelTopBtn").addEventListener("click", () => popScreen())
  document.getElementById("cancelBtn").addEventListener("click",    () => popScreen())
  document.getElementById("jobDesc").addEventListener("input", function() { document.getElementById("descCount").textContent = this.value.length+" chars" })
  const photoZone=document.getElementById("photoZone"), photoInput=document.getElementById("photoInput")
  photoZone.addEventListener("click", () => photoInput.click())
  photoInput.addEventListener("change", () => {
    const files=Array.from(photoInput.files), photoErr=document.getElementById("photoErr"); photoErr.style.display="none"
    if (files.some(f=>f.size>5*1024*1024)) { photoErr.textContent="One or more photos exceed 5MB."; photoErr.style.display="block"; return }
    if (files.length>4) { photoErr.textContent="Maximum 4 photos allowed."; photoErr.style.display="block"; return }
    uploadedPhotos=files; document.getElementById("photoCount").textContent=files.length+" of 4 photos selected"
    const preview=document.getElementById("photoPreview"); preview.innerHTML=""
    files.forEach(file => { const r=new FileReader(); r.onload=(e)=>{ const d=document.createElement("div"); d.style.cssText="position:relative;width:72px;height:72px;"; d.innerHTML="<img src='"+e.target.result+"' style='width:72px;height:72px;object-fit:cover;border-radius:10px;border:2px solid #4f46e5;' />"; preview.appendChild(d) }; r.readAsDataURL(file) })
  })
  const videoZone=document.getElementById("videoZone"), videoInput=document.getElementById("videoInput")
  videoZone.addEventListener("click", () => videoInput.click())
  videoInput.addEventListener("change", () => { const file=videoInput.files[0]; if(!file) return; if(file.size>50*1024*1024) { showErr("postErr","Video must be under 50MB"); return }; uploadedVideo=file; const nm=document.getElementById("videoName"); nm.textContent="Done: "+file.name; nm.style.display="block" })
  const remoteToggle=document.getElementById("remoteToggle"), remoteThumb=document.getElementById("remoteThumb")
  remoteToggle.addEventListener("click", () => { isRemote=!isRemote; remoteToggle.style.background=isRemote?"#4f46e5":"#374151"; remoteThumb.style.left=isRemote?"24px":"3px" })
  document.getElementById("submitJobBtn").addEventListener("click", async () => {
    const title=document.getElementById("jobTitle").value.trim(), category=document.getElementById("jobCategory").value, desc=document.getElementById("jobDesc").value.trim(), location=document.getElementById("jobLocation").value.trim(), skills=document.getElementById("jobSkills").value.trim()
    hideErr("postErr")
    if (!title) { showErr("postErr","Please enter a job title"); return }
    if (!category) { showErr("postErr","Please select a category"); return }
    if (!desc) { showErr("postErr","Please enter a description"); return }
    if (desc.length<20) { showErr("postErr","Description must be at least 20 characters"); return }
    if (uploadedPhotos.length<2) { showErr("postErr","Please upload at least 2 photos"); return }
    setBtn("submitJobBtn",true,"Posting...")
    document.getElementById("uploadProgress").style.display="block"
    const progressBar=document.getElementById("progressBar"), photoUrls=[]
    for (let i=0;i<uploadedPhotos.length;i++) {
      const file=uploadedPhotos[i], ext=file.name.split(".").pop(), path="jobs/"+user.id+"/"+Date.now()+"_"+i+"."+ext
      const { error:upErr } = await supabase.storage.from("job-media").upload(path,file)
      if (upErr) { setBtn("submitJobBtn",false,"Post Job"); document.getElementById("uploadProgress").style.display="none"; showErr("postErr","Photo upload failed: "+upErr.message); return }
      const { data:urlData } = supabase.storage.from("job-media").getPublicUrl(path); photoUrls.push(urlData.publicUrl)
      progressBar.style.width=Math.round(((i+1)/uploadedPhotos.length)*80)+"%"
    }
    let videoUrl=""
    if (uploadedVideo) {
      const vpath="jobs/"+user.id+"/video_"+Date.now()+".mp4"
      const { error:vErr } = await supabase.storage.from("job-media").upload(vpath,uploadedVideo)
      if (!vErr) { const { data:vUrlData }=supabase.storage.from("job-media").getPublicUrl(vpath); videoUrl=vUrlData.publicUrl }
    }
    progressBar.style.width="95%"
    const skillsArray=skills?skills.split(",").map(s=>s.trim()).filter(Boolean):[]
    const { error } = await supabase.from("jobs").insert({ owner_id:user.id, owner_email:user.email, title, category, description:desc, budget_min:0, budget_max:0, location:location||"Not specified", status:"open", photos:photoUrls, video_url:videoUrl||null, skills:skillsArray, is_remote:isRemote })
    progressBar.style.width="100%"
    if (error) { setBtn("submitJobBtn",false,"Post Job"); document.getElementById("uploadProgress").style.display="none"; showErr("postErr",error.message); return }
    showPostSuccess(user)
  })
}

function showPostSuccess(user) {
  pushScreen("postSuccess", () => showPostSuccess(user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'><div style='width:100%;max-width:380px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:36px 24px;text-align:center;'><span style='font-size:52px;'>&#10003;</span><h2 style='color:#fff;font-size:22px;font-weight:700;margin:16px 0 8px;'>Job Posted!</h2><p style='color:#a5b4fc;font-size:14px;margin:0 0 28px;line-height:1.6;'>Workers will start applying soon.</p><button id='viewJobsBtn' style='width:100%;padding:14px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin-bottom:10px;min-height:50px;'>View My Jobs</button><button id='backHomeBtn' style='width:100%;padding:13px;background:rgba(255,255,255,0.08);color:#a5b4fc;font-size:14px;font-weight:600;border:none;border-radius:12px;cursor:pointer;min-height:48px;'>Back to Dashboard</button></div></div>"
  document.getElementById("viewJobsBtn").addEventListener("click", () => showMyJobs(user))
  document.getElementById("backHomeBtn").addEventListener("click", () => showDashboard(user))
}

async function showProfile(user) {
  pushScreen("profile", () => showProfile(user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("My Profile") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div id='profileContent' style='text-align:center;color:#a5b4fc;padding:40px 0;'><div style='width:40px;height:40px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>Loading profile...</div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id",user.id).single()
  const container = document.getElementById("profileContent")
  if (!container) return
  if (error) { container.innerHTML = "<p style='color:#f87171;text-align:center;'>Failed to load profile</p>"; return }
  renderProfileView(user, profile, container)
}

function renderProfileView(user, profile, container) {
  const initial = (profile.full_name||profile.email||"U")[0].toUpperCase()
  const isVerified = profile.is_verified
  const kycSubmitted = profile.kyc_submitted
  container.innerHTML =
    "<div style='text-align:center;margin-bottom:24px;'>" +
      (profile.avatar_url?"<img src='"+profile.avatar_url+"' style='width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #4f46e5;margin:0 auto 12px;display:block;' />":"<div style='width:90px;height:90px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:36px;margin:0 auto 12px;'>"+initial+"</div>") +
      "<h2 style='color:#fff;font-size:20px;font-weight:700;margin:0 0 4px;'>"+(profile.full_name||"No name yet")+"</h2>" +
      "<p style='color:#a5b4fc;font-size:13px;margin:0 0 8px;'>"+(profile.email||"")+"</p>" +
      "<div style='display:inline-flex;align-items:center;gap:6px;background:"+(isVerified?"rgba(52,211,153,0.1)":"rgba(251,191,36,0.1)")+";border:1px solid "+(isVerified?"rgba(52,211,153,0.3)":"rgba(251,191,36,0.3)")+";border-radius:20px;padding:4px 12px;'>" +
        "<span style='color:"+(isVerified?"#34d399":"#fbbf24")+";font-size:12px;font-weight:600;'>"+(isVerified?"&#10003; KYC Verified":kycSubmitted?"&#128336; KYC Pending Review":"&#9888; Not Verified")+"</span>" +
      "</div>" +
    "</div>" +
    "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;margin-bottom:14px;'>" +
      "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);'><p style='color:#a5b4fc;font-size:13px;margin:0;'>Role</p><p style='color:#fff;font-size:13px;font-weight:600;margin:0;'>"+(profile.role==="owner"?"&#127968; Owner":"&#128296; Worker")+"</p></div>" +
      "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);'><p style='color:#a5b4fc;font-size:13px;margin:0;'>Phone</p><p style='color:#fff;font-size:13px;font-weight:600;margin:0;'>"+(profile.phone||"Not set")+"</p></div>" +
      "<div style='display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);'><p style='color:#a5b4fc;font-size:13px;margin:0;'>Location</p><p style='color:#fff;font-size:13px;font-weight:600;margin:0;'>"+(profile.location||"Not set")+"</p></div>" +
      "<div style='display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);'><p style='color:#a5b4fc;font-size:13px;margin:0;'>Bio</p><p style='color:#fff;font-size:13px;font-weight:600;margin:0;text-align:right;max-width:65%;line-height:1.5;'>"+(profile.bio||"Not set")+"</p></div>" +
      "<div style='display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;'><p style='color:#a5b4fc;font-size:13px;margin:0;'>Skills</p><p style='color:#fff;font-size:13px;font-weight:600;margin:0;text-align:right;max-width:65%;'>"+(profile.skills&&profile.skills.length>0?profile.skills.join(", "):"Not set")+"</p></div>" +
    "</div>" +
    "<button id='editProfileBtn' style='width:100%;padding:14px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin-bottom:14px;min-height:50px;'>&#9998; Edit Profile</button>" +
    (!isVerified?"<div style='background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);border-radius:16px;padding:18px;margin-bottom:14px;'><p style='color:#fbbf24;font-size:14px;font-weight:700;margin:0 0 6px;'>&#9888; KYC Verification Required</p><p style='color:#fde68a;font-size:13px;margin:0 0 14px;line-height:1.5;'>You must verify your identity before "+(profile.role==="owner"?"posting jobs":"accepting jobs")+". Upload a valid ID and a selfie.</p>"+(!kycSubmitted?"<button id='startKycBtn' style='width:100%;padding:12px;background:#d97706;color:#fff;font-size:14px;font-weight:700;border:none;border-radius:10px;cursor:pointer;min-height:44px;'>Start KYC Verification</button>":"<p style='color:#fbbf24;font-size:13px;text-align:center;margin:0;'>&#128336; Your documents are under review.</p>")+"</div>":"") +
    "<button id='profileSignOutBtn' style='width:100%;padding:13px;background:rgba(239,68,68,0.1);color:#f87171;font-size:14px;font-weight:600;border:1px solid rgba(239,68,68,0.2);border-radius:12px;cursor:pointer;min-height:48px;'>Sign Out</button>"

  document.getElementById("editProfileBtn").addEventListener("click", () => renderProfileEdit(user, profile, container))
  if (document.getElementById("startKycBtn")) document.getElementById("startKycBtn").addEventListener("click", () => showKYC(user))
  document.getElementById("profileSignOutBtn").addEventListener("click", async () => { await supabase.auth.signOut(); currentEmail=""; currentUser=null; showLogin() })
}

function renderProfileEdit(user, profile, container) {
  container.innerHTML =
    "<div style='text-align:center;margin-bottom:20px;'>" +
      "<div style='position:relative;display:inline-block;'>" +
        (profile.avatar_url?"<img src='"+profile.avatar_url+"' style='width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #4f46e5;' />":"<div style='width:90px;height:90px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:36px;margin:0 auto;'>"+(profile.full_name||profile.email||"U")[0].toUpperCase()+"</div>") +
        "<button id='changeAvatarBtn' style='position:absolute;bottom:0;right:0;width:28px;height:28px;background:#4f46e5;border:none;border-radius:50%;cursor:pointer;color:#fff;font-size:14px;'>&#9998;</button>" +
        "<input id='avatarInput' type='file' accept='image/*' style='display:none;' />" +
      "</div>" +
    "</div>" +
    "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;margin-bottom:14px;'>" +
      "<div style='margin-bottom:14px;'><label style='display:block;color:#e0e7ff;font-size:13px;font-weight:600;margin-bottom:6px;'>Full Name</label><input id='fullName' value='"+escapeHtml(profile.full_name||"")+"' placeholder='Enter your full name' style='width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div>" +
      "<div style='margin-bottom:14px;'><label style='display:block;color:#e0e7ff;font-size:13px;font-weight:600;margin-bottom:6px;'>Phone Number</label><input id='phone' value='"+escapeHtml(profile.phone||"")+"' placeholder='+234 800 000 0000' type='tel' style='width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div>" +
      "<div style='margin-bottom:14px;'><label style='display:block;color:#e0e7ff;font-size:13px;font-weight:600;margin-bottom:6px;'>Location</label><input id='location' value='"+escapeHtml(profile.location||"")+"' placeholder='e.g. Lagos, Nigeria' style='width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div>" +
      "<div style='margin-bottom:14px;'><label style='display:block;color:#e0e7ff;font-size:13px;font-weight:600;margin-bottom:6px;'>Role</label><select id='role' style='width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;min-height:44px;'><option value='owner'"+(profile.role==="owner"?" selected":"")+">&#127968; Owner - I want to hire professionals</option><option value='worker'"+(profile.role==="worker"?" selected":"")+">&#128296; Worker - I want to find work</option></select></div>" +
      "<div style='margin-bottom:14px;'><label style='display:block;color:#e0e7ff;font-size:13px;font-weight:600;margin-bottom:6px;'>Bio</label><textarea id='bio' placeholder='Tell people about yourself...' rows='3' style='width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;resize:none;line-height:1.5;'>"+(profile.bio||"")+"</textarea></div>" +
      "<div style='margin-bottom:4px;'><label style='display:block;color:#e0e7ff;font-size:13px;font-weight:600;margin-bottom:6px;'>Skills (comma separated)</label><input id='skills' value='"+(profile.skills?profile.skills.join(", "):"")+"' placeholder='e.g. Plumbing, Electrical, Tiling' style='width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div>" +
    "</div>" +
    "<p id='profileErr' style='color:#f87171;font-size:13px;margin:0 0 12px;display:none;background:rgba(239,68,68,0.1);padding:12px;border-radius:10px;'></p>" +
    "<div style='display:grid;grid-template-columns:1fr 2fr;gap:10px;margin-bottom:14px;'>" +
      "<button id='cancelEditBtn' style='padding:14px;background:rgba(255,255,255,0.07);color:#a5b4fc;font-size:14px;font-weight:600;border:1px solid rgba(255,255,255,0.12);border-radius:12px;cursor:pointer;min-height:50px;'>Cancel</button>" +
      "<button id='saveProfileBtn' style='padding:14px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Save Changes</button>" +
    "</div>"

  document.getElementById("cancelEditBtn").addEventListener("click", () => renderProfileView(user, profile, container))
  document.getElementById("changeAvatarBtn").addEventListener("click", () => document.getElementById("avatarInput").click())
  document.getElementById("avatarInput").addEventListener("change", async (e) => {
    const file=e.target.files[0]; if(!file) return
    if (file.size>5*1024*1024) { alert("Image must be under 5MB"); return }
    const ext=file.name.split(".").pop(), path="avatars/"+user.id+"."+ext
    const { error:upErr } = await supabase.storage.from("profiles").upload(path,file,{upsert:true})
    if (upErr) { alert("Upload failed: "+upErr.message); return }
    const { data:urlData } = supabase.storage.from("profiles").getPublicUrl(path)
    await supabase.from("profiles").update({avatar_url:urlData.publicUrl}).eq("id",user.id)
    profile.avatar_url=urlData.publicUrl; renderProfileEdit(user, profile, container)
  })
  document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const full_name=document.getElementById("fullName").value.trim(), phone=document.getElementById("phone").value.trim(), location=document.getElementById("location").value.trim(), bio=document.getElementById("bio").value.trim(), role=document.getElementById("role").value, skillsRaw=document.getElementById("skills").value.trim(), skills=skillsRaw?skillsRaw.split(",").map(s=>s.trim()).filter(Boolean):[]
    if (!full_name) { showErr("profileErr","Please enter your full name"); return }
    setBtn("saveProfileBtn",true,"Save Changes")
    const { error } = await supabase.from("profiles").update({full_name,phone,location,bio,role,skills,updated_at:new Date().toISOString()}).eq("id",user.id)
    setBtn("saveProfileBtn",false,"Save Changes")
    if (error) { showErr("profileErr","Failed to save: "+error.message); return }
    profile.full_name=full_name; profile.phone=phone; profile.location=location; profile.bio=bio; profile.role=role; profile.skills=skills
    renderProfileView(user, profile, container)
  })
}

async function showKYC(user) {
  pushScreen("kyc", () => showKYC(user))
  let idFile=null, selfieFile=null
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("KYC Verification") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div style='background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:14px;padding:16px;margin-bottom:20px;'><p style='color:#c7d2fe;font-size:14px;font-weight:600;margin:0 0 6px;'>&#128274; Why we need this</p><p style='color:#a5b4fc;font-size:13px;margin:0;line-height:1.5;'>KYC verification protects both owners and workers. Required before posting or accepting jobs.</p></div><div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;margin-bottom:14px;'><p style='color:#e0e7ff;font-size:14px;font-weight:600;margin:0 0 10px;'>Step 1 - Government ID</p><p style='color:#a5b4fc;font-size:12px;margin:0 0 10px;'>National ID, Driver License, Voter Card or Passport</p><div id='idZone' style='border:2px dashed rgba(255,255,255,0.2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.03);'><span style='font-size:28px;'>&#128196;</span><p style='color:#a5b4fc;font-size:14px;font-weight:500;margin:8px 0 0;'>Click to upload ID</p><input id='idInput' type='file' accept='image/*' style='display:none;' /></div><p id='idName' style='color:#34d399;font-size:12px;margin:8px 0 0;display:none;'></p></div><div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;margin-bottom:14px;'><p style='color:#e0e7ff;font-size:14px;font-weight:600;margin:0 0 10px;'>Step 2 - Selfie</p><div id='selfieZone' style='border:2px dashed rgba(255,255,255,0.2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.03);'><span style='font-size:28px;'>&#129381;</span><p style='color:#a5b4fc;font-size:14px;font-weight:500;margin:8px 0 0;'>Click to upload selfie</p><input id='selfieInput' type='file' accept='image/*' capture='user' style='display:none;' /></div><p id='selfieName' style='color:#34d399;font-size:12px;margin:8px 0 0;display:none;'></p></div><p id='kycErr' style='color:#f87171;font-size:13px;margin:0 0 14px;display:none;background:rgba(239,68,68,0.1);padding:12px;border-radius:10px;'></p><div id='kycProgress' style='display:none;margin-bottom:14px;'><p style='color:#a5b4fc;font-size:13px;margin:0 0 7px;'>Uploading documents...</p><div style='background:rgba(255,255,255,0.1);border-radius:6px;height:5px;'><div id='kycBar' style='background:#4f46e5;height:5px;border-radius:6px;width:0%;transition:width 0.3s;'></div></div></div><button id='submitKycBtn' style='width:100%;padding:14px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Submit for Verification</button></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const idZone=document.getElementById("idZone"), idInput=document.getElementById("idInput"), selfieZone=document.getElementById("selfieZone"), selfieInput=document.getElementById("selfieInput")
  idZone.addEventListener("click", () => idInput.click())
  idInput.addEventListener("change", () => { const file=idInput.files[0]; if(!file) return; if(file.size>5*1024*1024) { showErr("kycErr","ID image must be under 5MB"); return }; idFile=file; const nm=document.getElementById("idName"); nm.textContent="&#10003; "+file.name; nm.style.display="block"; idZone.style.borderColor="#4f46e5" })
  selfieZone.addEventListener("click", () => selfieInput.click())
  selfieInput.addEventListener("change", () => { const file=selfieInput.files[0]; if(!file) return; if(file.size>5*1024*1024) { showErr("kycErr","Selfie must be under 5MB"); return }; selfieFile=file; const nm=document.getElementById("selfieName"); nm.textContent="&#10003; "+file.name; nm.style.display="block"; selfieZone.style.borderColor="#4f46e5" })
  document.getElementById("submitKycBtn").addEventListener("click", async () => {
    hideErr("kycErr")
    if (!idFile) { showErr("kycErr","Please upload your ID document"); return }
    if (!selfieFile) { showErr("kycErr","Please upload your selfie"); return }
    setBtn("submitKycBtn",true,"Submit for Verification")
    document.getElementById("kycProgress").style.display="block"
    const kycBar=document.getElementById("kycBar")
    const idExt=idFile.name.split(".").pop(), idPath="kyc/"+user.id+"/id."+idExt
    const { error:idErr } = await supabase.storage.from("profiles").upload(idPath,idFile,{upsert:true})
    if (idErr) { setBtn("submitKycBtn",false,"Submit for Verification"); document.getElementById("kycProgress").style.display="none"; showErr("kycErr","ID upload failed: "+idErr.message); return }
    const { data:idUrl } = supabase.storage.from("profiles").getPublicUrl(idPath); kycBar.style.width="50%"
    const selfieExt=selfieFile.name.split(".").pop(), selfiePath="kyc/"+user.id+"/selfie."+selfieExt
    const { error:selfieErr } = await supabase.storage.from("profiles").upload(selfiePath,selfieFile,{upsert:true})
    if (selfieErr) { setBtn("submitKycBtn",false,"Submit for Verification"); document.getElementById("kycProgress").style.display="none"; showErr("kycErr","Selfie upload failed: "+selfieErr.message); return }
    const { data:selfieUrl } = supabase.storage.from("profiles").getPublicUrl(selfiePath); kycBar.style.width="90%"
    const { error } = await supabase.from("profiles").update({kyc_submitted:true, kyc_id_url:idUrl.publicUrl, kyc_selfie_url:selfieUrl.publicUrl, updated_at:new Date().toISOString()}).eq("id",user.id)
    kycBar.style.width="100%"
    if (error) { setBtn("submitKycBtn",false,"Submit for Verification"); document.getElementById("kycProgress").style.display="none"; showErr("kycErr","Submission failed: "+error.message); return }
    app.innerHTML = "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'><div style='width:100%;max-width:380px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:36px 24px;text-align:center;'><span style='font-size:52px;'>&#128336;</span><h2 style='color:#fff;font-size:22px;font-weight:700;margin:16px 0 8px;'>Documents Submitted!</h2><p style='color:#a5b4fc;font-size:14px;margin:0 0 28px;line-height:1.6;'>We will verify your identity within 24 hours and notify you.</p><button id='backToDash' style='width:100%;padding:14px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Back to Dashboard</button></div></div>"
    document.getElementById("backToDash").addEventListener("click", () => showDashboard(user))
  })
}

async function initNotifications(user) {
  const { data: notifs } = await supabase.from("notifications").select("id,is_read").eq("user_id",user.id).eq("is_read",false)
  unreadCount = notifs?notifs.length:0
  updateNotifBadge()
  if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel=null }
  notifChannel = supabase.channel("notifs_"+user.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:"user_id=eq."+user.id},(payload) => {
    unreadCount++; updateNotifBadge(); showToast(payload.new.title, payload.new.body, payload.new.type)
  }).subscribe()
}

function updateNotifBadge() {
  ["notifBadge","drawerBadge"].forEach(function(id) {
    const badge=document.getElementById(id)
    if (!badge) return
    if (unreadCount>0) { badge.textContent=unreadCount>9?"9+":unreadCount; badge.style.display="flex" }
    else badge.style.display="none"
  })
}

function showToast(title, body, type) {
  const existing=document.getElementById("toastNotif"); if(existing) existing.remove()
  const icon=type==="message"?"&#128172;":type==="application"?"&#128203;":type==="application_update"?"&#127881;":"&#128276;"
  const toast=document.createElement("div"); toast.id="toastNotif"
  toast.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;background:#1e1b4b;border:1px solid rgba(99,102,241,0.4);border-radius:14px;padding:14px 16px;max-width:340px;width:calc(100% - 32px);box-shadow:0 8px 32px rgba(0,0,0,0.4);display:flex;align-items:flex-start;gap:12px;"
  toast.innerHTML="<span style='font-size:22px;flex-shrink:0;'>"+icon+"</span><div style='flex:1;min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;'>"+title+"</p><p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+(body||"")+"</p></div><button onclick=\"document.getElementById('toastNotif').remove()\" style='background:none;border:none;color:#6b7280;cursor:pointer;font-size:18px;padding:0;flex-shrink:0;line-height:1;'>&#10005;</button>"
  document.body.appendChild(toast)
  setTimeout(() => { if(document.getElementById("toastNotif")) toast.remove() }, 4000)
}

async function showNotifications(user) {
  pushScreen("notifications", () => showNotifications(user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Notifications") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div id='notifList' style='text-align:center;color:#a5b4fc;padding:40px 0;'><div style='width:40px;height:40px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>Loading notifications...</div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const { data: notifs, error } = await supabase.from("notifications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50)
  const container = document.getElementById("notifList")
  if (!container) return
  if (error) { container.innerHTML="<p style='color:#f87171;text-align:center;'>Failed to load</p>"; return }
  if (!notifs||notifs.length===0) { container.innerHTML="<div style='text-align:center;padding:48px 16px;'><span style='font-size:48px;'>&#128276;</span><p style='color:#fff;font-size:16px;font-weight:600;margin:16px 0 8px;'>No notifications yet</p></div>"; return }
  const unreadIds=notifs.filter(n=>!n.is_read).map(n=>n.id)
  if (unreadIds.length>0) { supabase.from("notifications").update({is_read:true}).in("id",unreadIds).then(()=>{ unreadCount=0; updateNotifBadge() }) }
  const iconMap={message:"&#128172;",application:"&#128203;",application_update:"&#127881;",kyc_approved:"&#10003;",kyc_rejected:"&#10005;"}
  const colorMap={message:"#4f46e5",application:"#059669",application_update:"#d97706",kyc_approved:"#059669",kyc_rejected:"#ef4444"}
  let html="<button id='markAllBtn' style='width:100%;padding:11px;background:rgba(255,255,255,0.06);color:#a5b4fc;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,0.1);border-radius:10px;cursor:pointer;margin-bottom:14px;'>Mark all as read</button>"
  notifs.forEach(function(n) {
    const icon=iconMap[n.type]||"&#128276;", color=colorMap[n.type]||"#4f46e5"
    const time=new Date(n.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})
    html+="<div style='background:"+(n.is_read?"rgba(255,255,255,0.05)":"rgba(99,102,241,0.1)")+";border:1px solid "+(n.is_read?"rgba(255,255,255,0.08)":"rgba(99,102,241,0.25)")+";border-radius:14px;padding:14px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;'>" +
      "<div style='width:40px;height:40px;background:"+color+";border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;'>"+icon+"</div>" +
      "<div style='flex:1;min-width:0;'><div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;'><p style='color:#fff;font-size:14px;font-weight:"+(n.is_read?"500":"700")+";margin:0;'>"+n.title+"</p>"+(!n.is_read?"<div style='width:8px;height:8px;background:#4f46e5;border-radius:50%;flex-shrink:0;margin-left:8px;'></div>":"")+"</div>" +
      "<p style='color:#a5b4fc;font-size:13px;margin:0 0 4px;line-height:1.5;'>"+(n.body||"")+"</p><p style='color:#6b7280;font-size:11px;margin:0;'>"+time+"</p></div></div>"
  })
  container.innerHTML=html
  document.getElementById("markAllBtn").addEventListener("click", async () => {
    await supabase.from("notifications").update({is_read:true}).eq("user_id",user.id)
    unreadCount=0; updateNotifBadge(); showNotifications(user)
  })
}

async function showAdminPanel(user) {
  pushScreen("admin", () => showAdminPanel(user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Admin Panel") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
    "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;'>" +
      "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:center;'><p style='color:#a5b4fc;font-size:11px;margin:0 0 4px;text-transform:uppercase;'>Total Users</p><p id='statUsers' style='color:#fff;font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
      "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:center;'><p style='color:#fbbf24;font-size:11px;margin:0 0 4px;text-transform:uppercase;'>Pending KYC</p><p id='statKyc' style='color:#fbbf24;font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
      "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:center;'><p style='color:#34d399;font-size:11px;margin:0 0 4px;text-transform:uppercase;'>Total Jobs</p><p id='statJobs' style='color:#34d399;font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
      "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:center;'><p style='color:#818cf8;font-size:11px;margin:0 0 4px;text-transform:uppercase;'>Applications</p><p id='statApps' style='color:#818cf8;font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
    "</div>" +
    "<div style='display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px;'>" +
      "<button class='adminTab' data-tab='kyc' style='padding:8px 16px;border-radius:20px;border:1.5px solid #4f46e5;background:#4f46e5;color:#fff;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>&#128274; KYC Review</button>" +
      "<button class='adminTab' data-tab='users' style='padding:8px 16px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:#a5b4fc;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>&#128100; All Users</button>" +
      "<button class='adminTab' data-tab='jobs' style='padding:8px 16px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:#a5b4fc;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>&#128203; All Jobs</button>" +
    "</div>" +
    "<div id='adminContent'><div style='text-align:center;padding:40px 0;'><div style='width:36px;height:36px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;'></div><p style='color:#a5b4fc;font-size:13px;'>Loading...</p></div></div>" +
  "</div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.querySelectorAll(".adminTab").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".adminTab").forEach(b => { b.style.background="transparent"; b.style.borderColor="rgba(255,255,255,0.2)"; b.style.color="#a5b4fc" })
      btn.style.background="#4f46e5"; btn.style.borderColor="#4f46e5"; btn.style.color="#fff"
      loadAdminTab(btn.dataset.tab, user)
    })
  })
  await loadAdminStats()
  await loadAdminTab("kyc", user)
}

async function loadAdminStats() {
  const [uR,kR,jR,aR] = await Promise.all([
    supabase.from("profiles").select("id",{count:"exact"}),
    supabase.from("profiles").select("id",{count:"exact"}).eq("kyc_submitted",true).eq("is_verified",false),
    supabase.from("jobs").select("id",{count:"exact"}),
    supabase.from("applications").select("id",{count:"exact"}),
  ])
  const s=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v??"-" }
  s("statUsers",uR.count); s("statKyc",kR.count); s("statJobs",jR.count); s("statApps",aR.count)
}

async function loadAdminTab(tab, user) {
  const container = document.getElementById("adminContent")
  if (!container) return
  container.innerHTML="<div style='text-align:center;padding:40px 0;'><div style='width:36px;height:36px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;'></div><p style='color:#a5b4fc;font-size:13px;'>Loading...</p></div>"

  if (tab==="kyc") {
    const { data:pending } = await supabase.from("profiles").select("*").eq("kyc_submitted",true).eq("is_verified",false).order("updated_at",{ascending:true})
    if (!pending||pending.length===0) { container.innerHTML="<div style='text-align:center;padding:48px 16px;'><span style='font-size:44px;'>&#10003;</span><p style='color:#34d399;font-size:16px;font-weight:600;margin:14px 0 6px;'>All caught up!</p><p style='color:#a5b4fc;font-size:13px;'>No pending KYC reviews.</p></div>"; return }
    let html="<p style='color:#a5b4fc;font-size:13px;margin:0 0 14px;'>"+pending.length+" pending review"+(pending.length===1?"":"s")+"</p>"
    pending.forEach(function(p) {
      const initial=(p.full_name||p.email||"U")[0].toUpperCase()
      html+="<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px;margin-bottom:14px;'>" +
        "<div style='display:flex;align-items:center;gap:12px;margin-bottom:14px;'><div style='width:44px;height:44px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:17px;flex-shrink:0;'>"+initial+"</div><div style='flex:1;min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+(p.full_name||"No name")+"</p><p style='color:#a5b4fc;font-size:12px;margin:0 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+(p.email||"")+"</p><span style='background:rgba(251,191,36,0.1);color:#fbbf24;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;'>"+(p.role==="owner"?"&#127968; Owner":"&#128296; Worker")+"</span></div></div>" +
        (p.kyc_id_url?"<div style='margin-bottom:12px;'><p style='color:#a5b4fc;font-size:11px;font-weight:600;margin:0 0 8px;text-transform:uppercase;'>Government ID</p><img src='"+p.kyc_id_url+"' style='width:100%;max-height:200px;object-fit:contain;border-radius:10px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;' onclick=\"window.open('"+p.kyc_id_url+"','_blank')\" /></div>":"") +
        (p.kyc_selfie_url?"<div style='margin-bottom:14px;'><p style='color:#a5b4fc;font-size:11px;font-weight:600;margin:0 0 8px;text-transform:uppercase;'>Selfie</p><img src='"+p.kyc_selfie_url+"' style='width:100%;max-height:200px;object-fit:contain;border-radius:10px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;' onclick=\"window.open('"+p.kyc_selfie_url+"','_blank')\" /></div>":"") +
        "<div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;'>" +
          "<button class='rejectKycBtn' data-id='"+p.id+"' data-email='"+p.email+"' style='padding:11px;background:rgba(239,68,68,0.1);color:#f87171;font-size:13px;font-weight:600;border:1px solid rgba(239,68,68,0.2);border-radius:10px;cursor:pointer;min-height:42px;'>&#10005; Reject</button>" +
          "<button class='approveKycBtn' data-id='"+p.id+"' data-email='"+p.email+"' style='padding:11px;background:#059669;color:#fff;font-size:13px;font-weight:600;border:none;border-radius:10px;cursor:pointer;min-height:42px;'>&#10003; Approve</button>" +
        "</div>" +
      "</div>"
    })
    container.innerHTML=html
    container.querySelectorAll(".approveKycBtn").forEach(function(btn) {
      btn.addEventListener("click", async function() {
        if (!confirm("Approve KYC for "+btn.dataset.email+"?")) return
        btn.disabled=true; btn.textContent="Approving..."
        const { error } = await supabase.from("profiles").update({is_verified:true,updated_at:new Date().toISOString()}).eq("id",btn.dataset.id)
        if (error) { alert("Failed: "+error.message); btn.disabled=false; return }
        await supabase.from("notifications").insert({user_id:btn.dataset.id, title:"KYC Approved!", body:"Your identity has been verified. You can now post or accept jobs.", type:"kyc_approved", data:{}})
        await loadAdminStats(); await loadAdminTab("kyc",user)
      })
    })
    container.querySelectorAll(".rejectKycBtn").forEach(function(btn) {
      btn.addEventListener("click", async function() {
        const reason=prompt("Reason for rejection:"); if(!reason) return
        btn.disabled=true; btn.textContent="Rejecting..."
        const { error } = await supabase.from("profiles").update({kyc_submitted:false,updated_at:new Date().toISOString()}).eq("id",btn.dataset.id)
        if (error) { alert("Failed: "+error.message); btn.disabled=false; return }
        await supabase.from("notifications").insert({user_id:btn.dataset.id, title:"KYC Rejected", body:"Your documents were rejected: "+reason+". Please resubmit.", type:"kyc_rejected", data:{}})
        await loadAdminStats(); await loadAdminTab("kyc",user)
      })
    })

  } else if (tab==="users") {
    const { data:users } = await supabase.from("profiles").select("*").order("created_at",{ascending:false}).limit(50)
    if (!users||users.length===0) { container.innerHTML="<p style='color:#a5b4fc;text-align:center;padding:40px 0;'>No users found</p>"; return }
    let html="<p style='color:#a5b4fc;font-size:13px;margin:0 0 14px;'>"+users.length+" users</p>"
    users.forEach(function(u) {
      const initial=(u.full_name||u.email||"U")[0].toUpperCase()
      html+="<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;'>" +
        "<div style='width:40px;height:40px;background:"+(u.is_admin?"#d97706":"#4f46e5")+";border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0;'>"+initial+"</div>" +
        "<div style='flex:1;min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+(u.full_name||"No name")+"</p><p style='color:#a5b4fc;font-size:12px;margin:0 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+(u.email||"")+"</p>" +
          "<div style='display:flex;gap:5px;flex-wrap:wrap;'><span style='background:rgba(99,102,241,0.15);color:#818cf8;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;'>"+(u.role||"worker")+"</span>"+(u.is_verified?"<span style='background:rgba(52,211,153,0.1);color:#34d399;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;'>&#10003; Verified</span>":"")+(u.kyc_submitted&&!u.is_verified?"<span style='background:rgba(251,191,36,0.1);color:#fbbf24;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;'>&#128336; Pending</span>":"")+(u.is_admin?"<span style='background:rgba(217,119,6,0.15);color:#d97706;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;'>Admin</span>":"")+"</div>" +
        "</div>" +
        "<div style='display:flex;flex-direction:column;gap:5px;flex-shrink:0;'>" +
          "<button class='banBtn' data-id='"+u.id+"' data-email='"+(u.email||"")+"' style='padding:6px 10px;background:rgba(239,68,68,0.1);color:#f87171;font-size:11px;font-weight:600;border:1px solid rgba(239,68,68,0.2);border-radius:8px;cursor:pointer;'>Ban</button>" +
          (u.kyc_submitted&&!u.is_verified?"<button class='quickApproveBtn' data-id='"+u.id+"' style='padding:6px 10px;background:#059669;color:#fff;font-size:11px;font-weight:600;border:none;border-radius:8px;cursor:pointer;'>Approve</button>":"") +
        "</div>" +
      "</div>"
    })
    container.innerHTML=html
    container.querySelectorAll(".banBtn").forEach(b => b.addEventListener("click", async function() {
      if (!confirm("Ban "+b.dataset.email+"?")) return
      await supabase.from("profiles").update({is_verified:false,kyc_submitted:false}).eq("id",b.dataset.id)
      alert("User banned."); await loadAdminTab("users",user)
    }))
    container.querySelectorAll(".quickApproveBtn").forEach(b => b.addEventListener("click", async function() {
      if (!confirm("Approve KYC?")) return; b.disabled=true
      await supabase.from("profiles").update({is_verified:true}).eq("id",b.dataset.id)
      await supabase.from("notifications").insert({user_id:b.dataset.id, title:"KYC Approved!", body:"Your identity has been verified.", type:"kyc_approved", data:{}})
      await loadAdminStats(); await loadAdminTab("users",user)
    }))

  } else if (tab==="jobs") {
    const { data:jobs } = await supabase.from("jobs").select("*, profiles!jobs_owner_id_fkey(full_name,email)").order("created_at",{ascending:false}).limit(50)
    if (!jobs||jobs.length===0) { container.innerHTML="<p style='color:#a5b4fc;text-align:center;padding:40px 0;'>No jobs found</p>"; return }
    let html="<p style='color:#a5b4fc;font-size:13px;margin:0 0 14px;'>"+jobs.length+" jobs</p>"
    jobs.forEach(function(job) {
      html+="<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:14px;margin-bottom:10px;'>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;'><span style='background:#4f46e5;color:#fff;font-size:10px;font-weight:600;padding:2px 9px;border-radius:20px;'>"+(job.category||"General")+"</span><span style='color:"+(job.status==="open"?"#34d399":"#9ca3af")+";font-size:11px;font-weight:700;'>"+(job.status||"open").toUpperCase()+"</span></div>" +
        "<p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;'>"+job.title+"</p>" +
        "<p style='color:#a5b4fc;font-size:12px;margin:0 0 6px;'>By: "+(job.profiles?.full_name||job.profiles?.email||job.owner_email||"Unknown")+"</p>" +
        "<p style='color:#6b7280;font-size:12px;margin:0 0 10px;'>&#128205; "+(job.location||"Not specified")+"</p>" +
        "<button class='removeJobBtn' data-id='"+job.id+"' style='width:100%;padding:8px;background:rgba(239,68,68,0.08);color:#f87171;font-size:12px;font-weight:600;border:1px solid rgba(239,68,68,0.15);border-radius:8px;cursor:pointer;'>Remove Job</button>" +
      "</div>"
    })
    container.innerHTML=html
    container.querySelectorAll(".removeJobBtn").forEach(b => b.addEventListener("click", async function() {
      if (!confirm("Remove this job?")) return; b.disabled=true; b.textContent="Removing..."
      await supabase.from("jobs").delete().eq("id",b.dataset.id)
      await loadAdminStats(); await loadAdminTab("jobs",user)
    }))
  }
}

async function boot() {
  setupAndroidBack()
  showLoading()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    currentEmail = session.user.email
    currentUser  = session.user
    showDashboard(session.user)
  } else {
    showLogin()
  }
}

boot()
`

fs.writeFileSync("src/main.js", code, "utf8")
console.log("main.js written successfully - lines:", code.split("\\n").length)
