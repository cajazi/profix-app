const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
      }`,
  `      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
        console.log("Wallet deducted:", amt, "New balance:", Math.max(0, Number(wlt.balance) - amt))
      } else {
        console.log("Wallet not found for user:", btn.dataset.uid)
      }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
