const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const oldEvents = `  document.getElementById("signOutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut(); currentEmail = ""; currentUser = null; showLogin()
  })
  document.getElementById("postJobBtn").addEventListener("click",    async () => {
    const { data: p } = await supabase.from("profiles").select("is_verified,role").eq("id", user.id).single()
    if (!p?.is_verified) { alert("&#9888; KYC Required\\n\\nYou must complete KYC verification before posting jobs.\\n\\nTap Profile to submit your documents."); return }
    showPostJob(user)
  })
  document.getElementById("myJobsBtn").addEventListener("click",     () => showMyJobs(user))
  document.getElementById("browseJobsBtn").addEventListener("click", () => showBrowseJobs(user))
  document.getElementById("myChatsBtn").addEventListener("click",    () => showMyChats(user))
  document.getElementById("profileBtn").addEventListener("click",     () => showProfile(user))
  document.getElementById("notifBtn").addEventListener("click",        () => showNotifications(user))
  initNotifications(user)
  loadRecentJobs(user)
  supabase.from("profiles").select("is_admin").eq("id", user.id).single().then(function(res) {
    if (res.data && res.data.is_admin) {
      const adminBtn = document.createElement("button")
      adminBtn.id = "adminBtn"
      adminBtn.textContent = "Admin"
      adminBtn.style.cssText = "background:rgba(217,119,6,0.25);border:1px solid rgba(217,119,6,0.5);color:#d97706;font-size:11px;font-weight:700;padding:5px 10px;border-radius:8px;cursor:pointer;margin-left:6px;"
      const nav = document.querySelector("nav > div")
      if (nav) nav.appendChild(adminBtn)
      adminBtn.addEventListener("click", function() { showAdminPanel(user) })
    }
  })`

const newEvents = `  // Hamburger menu
  const hamburgerBtn  = document.getElementById("hamburgerBtn")
  const menuDrawer    = document.getElementById("menuDrawer")
  const menuOverlay   = document.getElementById("menuOverlay")

  function openMenu() {
    menuDrawer.style.transform  = "translateX(0)"
    menuOverlay.style.display   = "block"
  }
  function closeMenu() {
    menuDrawer.style.transform  = "translateX(100%)"
    menuOverlay.style.display   = "none"
  }

  hamburgerBtn.addEventListener("click", openMenu)

  document.getElementById("menuNotifBtn").addEventListener("click", () => { closeMenu(); showNotifications(user) })
  document.getElementById("menuProfileBtn").addEventListener("click", () => { closeMenu(); showProfile(user) })
  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {
    closeMenu()
    await supabase.auth.signOut(); currentEmail = ""; currentUser = null; showLogin()
  })

  // Nav bell button
  document.getElementById("notifBtn").addEventListener("click", () => showNotifications(user))

  // Dashboard quick action buttons
  document.getElementById("postJobBtn").addEventListener("click", async () => {
    const { data: p } = await supabase.from("profiles").select("is_verified,role").eq("id", user.id).single()
    if (!p?.is_verified) { alert("KYC Required - You must complete KYC verification before posting jobs. Go to Profile to submit your documents."); return }
    showPostJob(user)
  })
  document.getElementById("myJobsBtn").addEventListener("click",     () => showMyJobs(user))
  document.getElementById("browseJobsBtn").addEventListener("click", () => showBrowseJobs(user))
  document.getElementById("myChatsBtn").addEventListener("click",    () => showMyChats(user))

  initNotifications(user)
  loadRecentJobs(user)

  // Check admin
  supabase.from("profiles").select("is_admin").eq("id", user.id).single().then(function(res) {
    if (res.data && res.data.is_admin) {
      const adminBtn = document.getElementById("menuAdminBtn")
      if (adminBtn) {
        adminBtn.style.display = "flex"
        adminBtn.addEventListener("click", function() { closeMenu(); showAdminPanel(user) })
      }
    }
  })`

if (code.includes(oldEvents)) {
  code = code.replace(oldEvents, newEvents)
  console.log("Events replaced successfully")
} else {
  console.log("Old events not found")
}

fs.writeFileSync("src/main.js", code, "utf8")
