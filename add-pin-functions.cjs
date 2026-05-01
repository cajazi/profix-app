const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const CREATE_PIN = `
function showCreatePin(user) {
  pushScreen("createPin", () => showCreatePin(user))
  let pin1 = "", step = 1
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'><div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128274;</span><h2 id='pinTitle' style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Create your PIN</h2><p id='pinSub' style='color:#6b7280;font-size:14px;margin:0;'>Protects your account on this device</p></div><input id='pinInput' type='tel' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' /><p id='pinErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p><button id='pinBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Next</button></div></div>"
  const inp = document.getElementById('pinInput')
  inp.focus()
  inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g,'').slice(0,6) })
  document.getElementById('pinBtn').addEventListener('click', async () => {
    const val = inp.value.trim()
    hideErr('pinErr')
    if (val.length < 6) { showErr('pinErr','PIN must be 6 digits'); return }
    if (step === 1) {
      pin1 = val; inp.value = ''
      document.getElementById('pinTitle').textContent = 'Confirm your PIN'
      document.getElementById('pinSub').textContent = 'Enter your PIN again'
      document.getElementById('pinBtn').textContent = 'Create PIN'
      step = 2; inp.focus()
    } else {
      if (val !== pin1) { showErr('pinErr','PINs do not match'); inp.value = ''; return }
      setBtn('pinBtn', true, 'Create PIN')
      const hash = await sha256pin(val)
      await supabase.from('profiles').update({ pin_hash: hash, pin_set: true }).eq('id', user.id)
      await trustDevice(user.id)
      sessionStorage.setItem('profix_pin_ok','1')
      currentUser = user
      showDashboard(user)
    }
  })
}
`

const VERIFY_PIN = `
function showVerifyPin(user, trustAfter = false) {
  pushScreen("verifyPin", () => showVerifyPin(user, trustAfter))
  let attempts = 0
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'><div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128274;</span><h2 style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Enter your PIN</h2><p style='color:#6b7280;font-size:14px;margin:0;'>" + (user?.email || currentEmail) + "</p></div><input id='pinInput' type='tel' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' /><p id='pinErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p><button id='pinBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Unlock</button><button id='forgotBtn' style='width:100%;margin-top:10px;padding:10px;background:none;color:#6b7280;font-size:13px;border:none;cursor:pointer;'>Forgot PIN? Use email code</button></div></div>"
  const inp = document.getElementById('pinInput')
  inp.focus()
  inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g,'').slice(0,6) })
  inp.addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('pinBtn').click() })
  document.getElementById('pinBtn').addEventListener('click', async () => {
    const val = inp.value.trim()
    hideErr('pinErr')
    if (val.length < 6) { showErr('pinErr','Enter your 6-digit PIN'); return }
    setBtn('pinBtn', true, 'Unlock')
    const { data: profile } = await supabase.from('profiles').select('pin_hash').eq('id', user.id).single()
    const hash = await sha256pin(val)
    if (hash !== profile?.pin_hash) {
      attempts++; setBtn('pinBtn', false, 'Unlock'); inp.value = ''
      showErr('pinErr', attempts >= 3 ? 'Too many attempts. Use email code.' : 'Wrong PIN. Try again.')
      if (attempts >= 5) { await supabase.auth.signOut(); showLogin() }
      return
    }
    if (trustAfter) await trustDevice(user.id)
    sessionStorage.setItem('profix_pin_ok','1')
    currentUser = user; showDashboard(user)
  })
  document.getElementById('forgotBtn').addEventListener('click', async () => {
    await supabase.auth.signOut()
    currentEmail = user?.email || currentEmail
    const { error } = await supabase.auth.signInWithOtp({ email: currentEmail, options: { shouldCreateUser: false } })
    if (!error) showOTP('existing'); else showLogin()
  })
}
`

const PIN_LOGIN = `
async function showPinLogin(email, profileId) {
  pushScreen("pinLogin", () => showPinLogin(email, profileId))
  let attempts = 0
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;background:linear-gradient(135deg,#1e1b4b,#312e81);'><div style='width:100%;max-width:400px;background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);'><div style='text-align:center;margin-bottom:22px;'><span style='font-size:40px;'>&#128075;</span><h2 style='color:#111827;font-size:21px;font-weight:700;margin:12px 0 8px;'>Welcome back</h2><p style='color:#6b7280;font-size:14px;margin:0;'>" + email + "</p></div><input id='pinInput' type='tel' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:#111827;background:#f9fafb;font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' /><p id='pinErr' style='color:#ef4444;font-size:13px;margin:7px 0 0;display:none;'></p><button id='pinBtn' style='width:100%;margin-top:18px;padding:14px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;'>Unlock</button><button id='otpBtn' style='width:100%;margin-top:10px;padding:10px;background:none;color:#6b7280;font-size:13px;border:none;cursor:pointer;'>Use email code instead</button></div></div>"
  const inp = document.getElementById('pinInput')
  inp.focus()
  inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g,'').slice(0,6) })
  inp.addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('pinBtn').click() })
  document.getElementById('pinBtn').addEventListener('click', async () => {
    const val = inp.value.trim()
    hideErr('pinErr')
    if (val.length < 6) { showErr('pinErr','Enter your 6-digit PIN'); return }
    setBtn('pinBtn', true, 'Unlock')
    const { data: profile } = await supabase.from('profiles').select('pin_hash').eq('id', profileId).single()
    const hash = await sha256pin(val)
    if (hash !== profile?.pin_hash) {
      attempts++; setBtn('pinBtn', false, 'Unlock'); inp.value = ''
      showErr('pinErr','Wrong PIN. Try again.')
      if (attempts >= 5) showLogin()
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      sessionStorage.setItem('profix_pin_ok','1')
      currentUser = session.user; currentEmail = session.user.email
      showDashboard(session.user)
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (!error) showOTP('existing'); else showLogin()
    }
  })
  document.getElementById('otpBtn').addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
    if (!error) showOTP('existing'); else showLogin()
  })
}
`

// Insert before showMyJobs
c = c.replace('\nasync function showMyJobs', CREATE_PIN + VERIFY_PIN + PIN_LOGIN + '\nasync function showMyJobs')
fs.writeFileSync('src/main.js', c, 'utf8')
console.log('PIN functions added. Lines:', c.split('\n').length)
