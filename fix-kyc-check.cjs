const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix post job KYC check
c = c.replace(
  `  document.getElementById("postJobBtn").addEventListener("click", async () => {
    const { data: p } = await supabase.from("profiles").select("is_verified").eq("id", user.id).single()
    if (!p?.is_verified) { alert("KYC Required - Complete KYC verification before posting jobs. Go to My Profile to submit documents."); return }
    showPostJob(user)
  })`,
  `  document.getElementById("postJobBtn").addEventListener("click", async () => {
    const { data: p } = await supabase.from("profiles").select("is_verified").eq("id", user.id).maybeSingle()
    if (!p?.is_verified) { alert("KYC Required - Complete KYC verification before posting jobs. Go to My Profile to submit documents."); return }
    showPostJob(user)
  })`
)

// Fix apply job KYC check
c = c.replace(
  `    const { data: profile } = await supabase.from("profiles").select("is_verified").eq("id", user.id).single()
    if (!profile?.is_verified) { alert("KYC Required - Complete KYC verification before applying for jobs. Go to My Profile to submit documents."); return }`,
  `    const { data: profile } = await supabase.from("profiles").select("is_verified").eq("id", user.id).maybeSingle()
    if (!profile?.is_verified) { alert("KYC Required - Complete KYC verification before applying for jobs. Go to My Profile to submit documents."); return }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
