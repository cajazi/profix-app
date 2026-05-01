const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix 1: showCreatePin - use upsert and log errors
c = c.replace(
  `      const hash = await sha256pin(val)
      await supabase.from("profiles").update({ pin_hash: hash, pin_set: true }).eq("id", user.id)
      await trustDevice(user.id)
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = user
      showDashboard(user)`,
  `      const hash = await sha256pin(val)
      console.log("Saving PIN hash:", hash.slice(0,10), "for user:", user.id)
      const { error: pinErr } = await supabase.from("profiles").update({ pin_hash: hash, pin_set: true }).eq("id", user.id)
      if (pinErr) { console.error("PIN save error:", pinErr); showErr("pinErr","Failed to save PIN: "+pinErr.message); setBtn("pinBtn",false,"Create PIN"); return }
      await trustDevice(user.id)
      sessionStorage.setItem("profix_pin_ok","1")
      currentUser = user
      showDashboard(user)`
)

// Fix 2: showPinLogin - log what we get from DB and compare
c = c.replace(
  `    const { data: profile } = await supabase.from("profiles").select("pin_hash").eq("id", profileId).maybeSingle()
    const hash = await sha256pin(val)
    if (hash !== profile?.pin_hash) {
      attempts++; setBtn("pinBtn", false, "Unlock"); inp.value = ""
      showErr("pinErr","Wrong PIN. Try again.")
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
    }`
)

// Fix 3: same fix for showVerifyPin
c = c.replace(
  `    const { data: profile } = await supabase.from("profiles").select("pin_hash").eq("id", user.id).maybeSingle()
    const hash = await sha256pin(val)
    if (hash !== profile?.pin_hash) {
      attempts++; setBtn("pinBtn", false, "Unlock"); inp.value = ""
      showErr("pinErr", attempts >= 3 ? "Too many attempts. Use email code." : "Wrong PIN. Try again.")
      if (attempts >= 5) { await supabase.auth.signOut(); showLogin() }
      return
    }
    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem("profix_pin_ok","1")
    currentUser = user; showDashboard(user)`,
  `    const { data: profile } = await supabase.from("profiles").select("pin_hash").eq("id", user.id).maybeSingle()
    if (!profile?.pin_hash) { showCreatePin(user); return }
    const hash = await sha256pin(val)
    console.log("VerifyPin - Entered:", hash.slice(0,10), "Stored:", profile.pin_hash.slice(0,10))
    if (hash !== profile.pin_hash) {
      attempts++; setBtn("pinBtn", false, "Unlock"); inp.value = ""
      showErr("pinErr", attempts >= 3 ? "Too many attempts. Use email code." : "Wrong PIN. Try again.")
      if (attempts >= 5) { await supabase.auth.signOut(); showLogin() }
      return
    }
    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem("profix_pin_ok","1")
    currentUser = user; showDashboard(user)`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
