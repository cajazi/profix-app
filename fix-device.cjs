const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Replace the login button click handler to use localStorage for device check
c = c.replace(
  `    const { data: profile } = await supabase.from("profiles").select("id,pin_set,trusted_devices").eq("email", email).maybeSingle()
    if (profile && (profile.pin_set || profile.pin_hash)) {
      const trusted = await isTrustedDevice(profile)
      if (trusted) {
        setBtn("continueBtn", false, "Continue")
        currentEmail = email
        showPinLogin(email, profile.id)
        return
      }
    }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) { setBtn("continueBtn", false, "Continue"); showErr("loginErr", error.message); return }
    currentEmail = email
    const mode = (profile && profile.pin_set) ? "existing" : "new"
    setBtn("continueBtn", false, "Continue")
    showOTP(mode)`,
  `    // Check local storage for trusted device + saved profile
    const savedProfile = JSON.parse(localStorage.getItem("profix_profile_" + email) || "null")
    if (savedProfile && savedProfile.profileId && savedProfile.pinSet) {
      const deviceId = getDeviceId()
      const trustedEmails = JSON.parse(localStorage.getItem("profix_trusted_" + deviceId) || "[]")
      if (trustedEmails.includes(email)) {
        setBtn("continueBtn", false, "Continue")
        currentEmail = email
        showPinLogin(email, savedProfile.profileId)
        return
      }
    }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) { setBtn("continueBtn", false, "Continue"); showErr("loginErr", error.message); return }
    currentEmail = email
    // Check if existing user by trying to get profile (may fail if RLS blocks, that is fine)
    const { data: profile } = await supabase.from("profiles").select("pin_hash,pin_set").eq("email", email).maybeSingle()
    const mode = profile?.pin_hash ? "existing" : "new"
    setBtn("continueBtn", false, "Continue")
    showOTP(mode)`
)

// Update trustDevice to also save to localStorage
c = c.replace(
  `async function trustDevice(userId) {
  const id = getDeviceId()
  const { data: p } = await supabase.from("profiles").select("trusted_devices").eq("id", userId).single()
  const devices = p?.trusted_devices || []
  if (!devices.includes(id)) {
    devices.push(id)
    await supabase.from("profiles").update({ trusted_devices: devices }).eq("id", userId)
  }
}`,
  `async function trustDevice(userId) {
  const id = getDeviceId()
  // Save to Supabase
  const { data: p } = await supabase.from("profiles").select("trusted_devices,email").eq("id", userId).single()
  const devices = p?.trusted_devices || []
  if (!devices.includes(id)) {
    devices.push(id)
    await supabase.from("profiles").update({ trusted_devices: devices }).eq("id", userId)
  }
  // Also save to localStorage for offline check
  if (p?.email) {
    localStorage.setItem("profix_profile_" + p.email, JSON.stringify({ profileId: userId, pinSet: true }))
    const trustedEmails = JSON.parse(localStorage.getItem("profix_trusted_" + id) || "[]")
    if (!trustedEmails.includes(p.email)) {
      trustedEmails.push(p.email)
      localStorage.setItem("profix_trusted_" + id, JSON.stringify(trustedEmails))
    }
  }
}`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
