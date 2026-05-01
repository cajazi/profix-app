const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Replace the OTP call at end of PIN login with direct session check
code = code.replace(
  `    await supabase.from("profiles").update({ pin_attempts: 0, pin_locked_until: null }).eq("id", userId)
    await trustDevice(userId)
    showLoginOTPV2(email, userId, true)`,
  `    await supabase.from("profiles").update({ pin_attempts: 0, pin_locked_until: null }).eq("id", userId)
    await trustDevice(userId)
    // Use existing session - no need to send OTP again
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      currentUser = session.user
      currentEmail = email
      showDashboard(session.user)
    } else {
      // Session expired - need OTP to re-authenticate
      showLoginOTPV2(email, userId, true)
    }`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("PIN login now uses existing session")
