const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `    // Lock funds immediately
    const { data: wlt } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
    if (wlt) {
      await supabase.from("wallets").update({
        balance: Math.max(0, Number(wlt.balance) - amount),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id)
    }
    await supabase.from("notifications").insert({ user_id: user.id, title: "Withdrawal Request Submitted", body: "Your withdrawal of \u20a6" + amount.toLocaleString() + " is being processed.", type: "withdrawal", data: {} })`,
  `    await supabase.from("notifications").insert({ user_id: user.id, title: "Withdrawal Request Submitted", body: "Your withdrawal of \u20a6" + amount.toLocaleString() + " is being processed. You will be notified once approved.", type: "withdrawal", data: {} })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
