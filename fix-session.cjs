const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// 1. Save refresh token when user logs in successfully
c = c.replace(
  `    localStorage.setItem("profix_hash_" + user.email, hash)
      await trustDevice(user.id)
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = user
      showDashboard(user)`,
  `    localStorage.setItem("profix_hash_" + user.email, hash)
      const { data: { session: s } } = await supabase.auth.getSession()
      if (s?.refresh_token) localStorage.setItem("profix_rt_" + user.email, s.refresh_token)
      await trustDevice(user.id)
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = user
      showDashboard(user)`
)

// 2. Also save refresh token after OTP verify in showVerifyPin
c = c.replace(
  `    localStorage.setItem("profix_hash_" + user.email, profile.pin_hash)
    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem("profix_pin_ok","1")
    currentUser = user; showDashboard(user)`,
  `    localStorage.setItem("profix_hash_" + user.email, profile.pin_hash)
    const { data: { session: s2 } } = await supabase.auth.getSession()
    if (s2?.refresh_token) localStorage.setItem("profix_rt_" + user.email, s2.refresh_token)
    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem("profix_pin_ok","1")
    currentUser = user; showDashboard(user)`
)

// 3. In showPinLogin, restore session using saved refresh token
c = c.replace(
  `    // PIN correct - sign in with OTP silently via magic link or use existing session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = session.user; currentEmail = session.user.email
      showDashboard(session.user)
    } else {
      // Session expired - send OTP but skip PIN creation since PIN exists
      showErr("pinErr","Session expired. Sending email code to re-authenticate.")
      setTimeout(async () => {
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
        showOTP("existing")
      }, 1500)
    }`,
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
    }`
)

// 4. Real sign out - clear everything including saved tokens
c = c.replace(
  `document.getElementById("forgotBtn").addEventListener("click", async () => {
    await supabase.auth.signOut()
    currentEmail = user?.email || currentEmail
    const { error } = await supabase.auth.signInWithOtp({ email: currentEmail, options: { shouldCreateUser: false } })
    if (!error) showOTP("existing"); else showLogin()
  })`,
  `document.getElementById("forgotBtn").addEventListener("click", async () => {
    const em = user?.email || currentEmail
    localStorage.removeItem("profix_rt_" + em)
    localStorage.removeItem("profix_hash_" + em)
    localStorage.removeItem("profix_profile_" + em)
    const deviceId = getDeviceId()
    const trustedEmails = JSON.parse(localStorage.getItem("profix_trusted_" + deviceId) || "[]")
    const filtered = trustedEmails.filter(e => e !== em)
    localStorage.setItem("profix_trusted_" + deviceId, JSON.stringify(filtered))
    await supabase.auth.signOut()
    currentEmail = em
    const { error } = await supabase.auth.signInWithOtp({ email: em, options: { shouldCreateUser: false } })
    if (!error) showOTP("existing"); else showLogin()
  })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
