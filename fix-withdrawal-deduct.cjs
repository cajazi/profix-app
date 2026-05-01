const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Deduct balance immediately when withdrawal is requested
c = c.replace(
  `    await supabase.from("notifications").insert({ user_id: user.id, title: "Withdrawal Request Submitted", body: "Your withdrawal of \\u20a6" + amount.toLocaleString() + " is being processed.", type: "withdrawal", data: {} })`,
  `    // Lock funds immediately
    const { data: wlt } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
    if (wlt) {
      await supabase.from("wallets").update({
        balance: Math.max(0, Number(wlt.balance) - amount),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id)
    }
    await supabase.from("notifications").insert({ user_id: user.id, title: "Withdrawal Request Submitted", body: "Your withdrawal of \u20a6" + amount.toLocaleString() + " is being processed.", type: "withdrawal", data: {} })`
)

// Remove double deduction in admin approve - balance already deducted
c = c.replace(
  `      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
      } else {
        await supabase.from("wallets").insert({ user_id: btn.dataset.uid, balance: 0, total_earned: 0, total_withdrawn: amt })
      }`,
  `      if (wlt) {
        await supabase.from("wallets").update({
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
      }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
