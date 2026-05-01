const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Replace showLogin
const OLD_LOGIN_START = 'function showLogin() {'
const OLD_LOGIN_END = '\nfunction showOTP()'
const loginStart = c.indexOf(OLD_LOGIN_START)
const loginEnd = c.indexOf(OLD_LOGIN_END)
const newLogin = `function showLogin() {
  backStack = []
  isGoingBack = false
  pushScreen("login", showLogin)
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='text-align:center;margin-bottom:28px;'><div style='display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;background:#4f46e5;border-radius:22px;margin-bottom:14px;box-shadow:0 16px 40px rgba(79,70,229,0.5);'><span style='font-size:34px;'>&#128295;</span></div><h1 style='color:#fff;font-size:34px;font-weight:800;margin:0;letter-spacing:-1px;'>ProFix</h1><p style='color:#a5b4fc;font-size:14px;margin:4px 0 0;'>Home services marketplace</p></div><div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'><h2 style='color:#111827;font-size:22px;font-weight:700;margin:0 0 4px;'>Welcome</h2><p style='color:#6b7280;font-size:14px;margin:0 0 22px;'>Sign in or create your account</p><label style='display:block;color:#374151;font-size:13px;font-weight:600;margin-bottom:7px;'>Email address</label><input id='emailInput' type='email' inputmode='email' autocomplete='email' placeholder='you@example.com' style='width:100%;padding:13px 15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:16px;outline:none;box-sizing:border-box;' /><p id='loginErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p><button id='continueBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Continue</button><p style='text-align:center;color:#6b7280;font-size:13px;margin:16px 0 0;'>New to ProFix? <span id='createLink' style='color:#4f46e5;font-weight:600;cursor:pointer;'>Create account</span></p></div></div>"
  const btn = document.getElementById("continueBtn")
  const input = document.getElementById("emailInput")
  input.focus()
  document.getElementById("createLink").addEventListener("click", () => { input.focus(); showErr("loginErr","Enter your email and tap Continue to get started"); setTimeout(()=>hideErr("loginErr"),3000) })
  input.addEventListener("keydown", e => { if(e.key==="Enter") btn.click() })
  btn.addEventListener("click", async () => {
    const email = input.value.trim()
    hideErr("loginErr")
    if (!email) { showErr("loginErr","Please enter your email address"); return }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) { showErr("loginErr","Please enter a valid email address"); return }
    setBtn("continueBtn", true, "Continue")
    const { data: profile } = await supabase.from("profiles").select("id,pin_set,trusted_devices").eq("email",email).maybeSingle()
    if (profile && profile.pin_set) {
      const trusted = await isTrustedDevice(profile)
      if (trusted) { setBtn("continueBtn",false,"Continue"); currentEmail=email; showPinLogin(email,profile.id); return }
    }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) { setBtn("continueBtn",false,"Continue"); showErr("loginErr",error.message); return }
    currentEmail = email
    const mode = (profile && profile.pin_set) ? "existing" : "new"
    setBtn("continueBtn",false,"Continue")
    showOTP(mode)
  })
}
`
c = c.slice(0, loginStart) + newLogin + c.slice(loginEnd)

// Replace showOTP
const OLD_OTP_START = 'function showOTP()'
const OLD_OTP_END = '\nasync function showMyJobs'
const otpStart = c.indexOf(OLD_OTP_START)
const otpEnd = c.indexOf(OLD_OTP_END)
const newOTP = `function showOTP(mode = "new") {
  pushScreen("otp", () => showOTP(mode))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='width:100%;max-width:400px;margin-bottom:14px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:14px;font-weight:600;cursor:pointer;padding:0;'>&#8592; Back</button></div><div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'><div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128231;</span><h2 style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Check your email</h2><p style='color:#6b7280;font-size:14px;margin:0;'>Code sent to <span style='color:#4f46e5;font-weight:600;'>" + currentEmail + "</span></p></div><input id='otpInput' type='tel' inputmode='numeric' autocomplete='one-time-code' maxlength='6' placeholder='000000' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' /><p id='otpErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p><button id='verifyBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Verify Code</button><button id='resendBtn' style='width:100%;margin-top:10px;padding:10px;background:none;color:#4f46e5;font-size:14px;font-weight:600;border:none;cursor:pointer;'>Resend code</button></div></div>"
  const verifyBtn = document.getElementById("verifyBtn")
  const otpInput = document.getElementById("otpInput")
  otpInput.focus()
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  otpInput.addEventListener("input", () => { otpInput.value = otpInput.value.replace(/\\D/g,"").slice(0,6) })
  otpInput.addEventListener("keydown", e => { if(e.key==="Enter") verifyBtn.click() })
  document.getElementById("resendBtn").addEventListener("click", async () => {
    const rb = document.getElementById("resendBtn"); rb.disabled=true; rb.textContent="Sending..."
    await supabase.auth.signInWithOtp({ email: currentEmail, options: { shouldCreateUser: true } })
    let secs=30; const tick=setInterval(()=>{ rb.textContent="Resend in "+secs+"s"; secs--; if(secs<0){clearInterval(tick);rb.disabled=false;rb.textContent="Resend code"} },1000)
  })
  verifyBtn.addEventListener("click", async () => {
    const token = otpInput.value.trim()
    hideErr("otpErr")
    if (!token||token.length<6) { showErr("otpErr","Please enter the full 6-digit code"); return }
    setBtn("verifyBtn",true,"Verify Code")
    const { data, error } = await supabase.auth.verifyOtp({ email: currentEmail, token, type: "email" })
    if (error) { setBtn("verifyBtn",false,"Verify Code"); showErr("otpErr","Incorrect code. Try again."); return }
    currentUser = data?.user
    if (currentUser) await supabase.from("profiles").upsert({ id: currentUser.id, email: currentUser.email },{ onConflict:"id" })
    if (mode === "new") showCreatePin(currentUser)
    else showVerifyPin(currentUser, true)
  })
}
`
c = c.slice(0, otpStart) + newOTP + c.slice(otpEnd)

// Replace boot
const bootStart = c.lastIndexOf('async function boot()')
const bootEnd = c.indexOf('\nboot()', bootStart) + '\nboot()'.length
const newBoot = `async function boot() {
  setupAndroidBack()
  showLoading()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    currentEmail = session.user.email
    currentUser  = session.user
    if (sessionStorage.getItem("profix_pin_ok") === "1") { showDashboard(session.user); return }
    const { data: profile } = await supabase.from("profiles").select("pin_set,pin_hash").eq("id",session.user.id).single()
    if (profile?.pin_set && profile?.pin_hash) showVerifyPin(session.user, false)
    else showDashboard(session.user)
  } else {
    showLogin()
  }
}

boot()`
c = c.slice(0, bootStart) + newBoot
fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Login + OTP + boot updated. Lines:', c.split('\n').length)
