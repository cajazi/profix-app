const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// In showPinLogin, don't query profile before auth - compare against localStorage hash
c = c.replace(
  `    // Try to get profile - first with profileId, fallback to email
    let profileData = null
    const { data: pd1 } = await supabase.from("profiles").select("id,pin_hash,email").eq("id", profileId).maybeSingle()
    profileData = pd1
    if (!profileData?.pin_hash) {
      const { data: pd2 } = await supabase.from("profiles").select("id,pin_hash,email").eq("email", email).maybeSingle()
      profileData = pd2
    }
    console.log("Profile found:", !!profileData, "Has pin_hash:", !!profileData?.pin_hash)
    if (!profileData?.pin_hash) {
      // No PIN stored - reset flow
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
      if (!otpErr) { showErr("pinErr","No PIN found. Sending email code to reset."); setTimeout(() => showOTP("new"), 1500) }
      return
    }
    const hash = await sha256pin(val)
    console.log("Entered hash:", hash.slice(0,10), "Stored hash:", profileData.pin_hash.slice(0,10))
    if (hash !== profileData.pin_hash) {
      attempts++; setBtn("pinBtn", false, "Unlock"); inp.value = ""
      showErr("pinErr", attempts >= 3 ? "Too many attempts. Use email code." : "Wrong PIN. Try again.")
      if (attempts >= 5) showLogin()
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = session.user; currentEmail = session.user.email
      showDashboard(session.user)
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (!error) showOTP("existing"); else showLogin()
    }`,
  `    // Compare against locally stored hash (saved at PIN creation time)
    const savedHash = localStorage.getItem("profix_hash_" + email)
    if (!savedHash) {
      showErr("pinErr","Session expired. Sending email code.")
      setTimeout(async () => {
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
        showOTP("existing")
      }, 1500)
      return
    }
    const hash = await sha256pin(val)
    if (hash !== savedHash) {
      attempts++; setBtn("pinBtn", false, "Unlock"); inp.value = ""
      showErr("pinErr", attempts >= 3 ? "Too many attempts. Use email code." : "Wrong PIN. Try again.")
      if (attempts >= 5) showLogin()
      return
    }
    // PIN correct - sign in with OTP silently via magic link or use existing session
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
    }`
)

// Save hash locally when PIN is created
c = c.replace(
  `      const { error: pinErr } = await supabase.from("profiles").update({ pin_hash: hash, pin_set: true }).eq("id", user.id)
      if (pinErr) { console.error("PIN save error:", pinErr); showErr("pinErr","Failed to save PIN: "+pinErr.message); setBtn("pinBtn",false,"Create PIN"); return }
      await trustDevice(user.id)
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = user
      showDashboard(user)`,
  `      const { error: pinErr } = await supabase.from("profiles").update({ pin_hash: hash, pin_set: true }).eq("id", user.id)
      if (pinErr) { console.error("PIN save error:", pinErr); showErr("pinErr","Failed to save PIN: "+pinErr.message); setBtn("pinBtn",false,"Create PIN"); return }
      // Save hash locally for offline PIN check
      localStorage.setItem("profix_hash_" + user.email, hash)
      await trustDevice(user.id)
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = user
      showDashboard(user)`
)

// Also save hash locally in showVerifyPin after successful verify
c = c.replace(
  `    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem("profix_pin_ok","1")
    currentUser = user; showDashboard(user)`,
  `    // Save hash locally for future offline PIN check
    localStorage.setItem("profix_hash_" + user.email, profile.pin_hash)
    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem("profix_pin_ok","1")
    currentUser = user; showDashboard(user)`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
