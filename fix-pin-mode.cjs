const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix: after OTP verify, re-check profile instead of using stale mode
c = c.replace(
  `    currentUser = data?.user
    if (currentUser) await supabase.from("profiles").upsert({ id: currentUser.id, email: currentUser.email }, { onConflict: "id" })
    if (mode === "new") showCreatePin(currentUser)
    else showVerifyPin(currentUser, true)`,
  `    currentUser = data?.user
    if (currentUser) await supabase.from("profiles").upsert({ id: currentUser.id, email: currentUser.email }, { onConflict: "id" })
    const { data: freshProfile } = await supabase.from("profiles").select("pin_hash,pin_set").eq("id", currentUser.id).single()
    if (freshProfile?.pin_hash) {
      showVerifyPin(currentUser, true)
    } else {
      showCreatePin(currentUser)
    }`
)

// Fix showLogin: also check pin_hash as fallback
c = c.replace(
  `if (profile && profile.pin_set) {`,
  `if (profile && (profile.pin_set || profile.pin_hash)) {`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
