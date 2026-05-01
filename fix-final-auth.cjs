const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Replace every sign out with soft logout - keep supabase session alive
const softLogout = `sessionStorage.removeItem("profix_pin_ok"); currentEmail = ""; currentUser = null; showLogin()`

// Menu sign out
c = c.replace(
  /closeMenu\(\);\s*(await supabase\.auth\.signOut\(\);?\s*)?currentEmail\s*=\s*"";\s*currentUser\s*=\s*null;\s*showLogin\(\)/g,
  'closeMenu(); ' + softLogout
)

// Profile page sign out  
c = c.replace(
  /(await supabase\.auth\.signOut\(\);?\s*)currentEmail\s*=\s*"";\s*currentUser\s*=\s*null;\s*showLogin\(\)/g,
  softLogout
)

// showPinLogin - after correct PIN just use existing session directly
c = c.replace(
  `    // PIN correct - restore session using saved refresh token
    let session = null
    const { data: { session: existing } } = await supabase.auth.getSession()
    if (existing?.user) {
      session = existing
    } else {
      const savedRt = localStorage.getItem("profix_rt_" + email)
      if (savedRt) {
        const { data: refreshed, error: rtErr } = await supabase.auth.refreshSession({ refresh_token: savedRt })
        if (!rtErr && refreshed?.session) {
          session = refreshed.session
          localStorage.setItem("profix_rt_" + email, session.refresh_token)
        }
      }
    }
    if (session?.user) {
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = session.user; currentEmail = session.user.email
      showDashboard(session.user)
    } else {
      showErr("pinErr","Session expired. Sending email code.")
      setTimeout(async () => {
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
        showOTP("existing")
      }, 1500)
    }`,
  `    // PIN correct - session is still alive (soft logout keeps it)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = session.user; currentEmail = session.user.email
      showDashboard(session.user)
    } else {
      // Only reach here if user was away for days and token truly expired
      showErr("pinErr","Session expired. Sending email code.")
      setTimeout(async () => {
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
        showOTP("existing")
      }, 1500)
    }`
)

// boot - also use soft logout aware logic
c = c.replace(
  `async function boot() {
  setupAndroidBack()
  showLoading()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    currentEmail = session.user.email
    currentUser  = session.user
    if (sessionStorage.getItem("profix_pin_ok") === "1") {
      showDashboard(session.user); return
    }
    const { data: profile } = await supabase.from("profiles").select("pin_set,pin_hash").eq("id", session.user.id).single()
    if (profile?.pin_set && profile?.pin_hash) {
      showVerifyPin(session.user, false)
    } else {
      showDashboard(session.user)
    }
  } else {
    showLogin()
  }
}`,
  `async function boot() {
  setupAndroidBack()
  showLoading()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    currentEmail = session.user.email
    currentUser  = session.user
    if (sessionStorage.getItem("profix_pin_ok") === "1") {
      showDashboard(session.user); return
    }
    // Check local storage first (faster, avoids RLS issues)
    const savedHash = localStorage.getItem("profix_hash_" + session.user.email)
    if (savedHash) {
      showVerifyPin(session.user, false)
    } else {
      showDashboard(session.user)
    }
  } else {
    // No session - check if we have a known email with PIN for this device
    showLogin()
  }
}`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
