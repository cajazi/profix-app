const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `      const { data: wlt } = await supabase.from("wallets").select("balance,total_withdrawn").eq("user_id", btn.dataset.uid).single()
      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
      }`,
  `      const { data: wlt } = await supabase.from("wallets").select("balance,total_withdrawn").eq("user_id", btn.dataset.uid).maybeSingle()
      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
      } else {
        await supabase.from("wallets").insert({ user_id: btn.dataset.uid, balance: 0, total_earned: 0, total_withdrawn: amt })
      }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
