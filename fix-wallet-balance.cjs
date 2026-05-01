const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// THE BUG: amt is btn.dataset.amt which is a STRING
// "19000" + "5000" = "190005000"  (string concat, not addition)
// Fix: declare amt as Number BEFORE the wallet read, use it everywhere

const OLD = `      const { data: wlt } = await supabase.from("wallets").select("balance,total_withdrawn").eq("user_id", btn.dataset.uid).maybeSingle()
      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
        console.log("Wallet deducted:", amt, "New balance:", Math.max(0, Number(wlt.balance) - amt))
      } else {
        console.log("Wallet not found for user:", btn.dataset.uid)
      }`

const NEW = `      const amt = Number(btn.dataset.amt)
      const { data: wlt } = await supabase.from("wallets").select("balance,total_withdrawn").eq("user_id", btn.dataset.uid).maybeSingle()
      if (wlt) {
        const newBalance   = Math.max(0, Number(wlt.balance) - amt)
        const newWithdrawn = Number(wlt.total_withdrawn) + amt
        await supabase.from("wallets").update({
          balance:         newBalance,
          total_withdrawn: newWithdrawn,
          updated_at:      new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
        console.log("Deducted:", amt, "| Balance:", newBalance, "| Withdrawn:", newWithdrawn)
      } else {
        await supabase.from("wallets").insert({
          user_id: btn.dataset.uid, balance: 0, total_earned: 0, total_withdrawn: amt
        })
        console.log("Created wallet with withdrawal:", amt)
      }`

if (c.includes(OLD)) {
  c = c.replace(OLD, NEW)
  console.log('Code fix applied')
} else {
  console.log('Pattern not found - checking for alternate pattern...')
  // Try without the console.log lines
  const OLD2 = `      const { data: wlt } = await supabase.from("wallets").select("balance,total_withdrawn").eq("user_id", btn.dataset.uid).maybeSingle()
      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
      } else {
        await supabase.from("wallets").insert({ user_id: btn.dataset.uid, balance: 0, total_earned: 0, total_withdrawn: amt })
      }`
  if (c.includes(OLD2)) {
    c = c.replace(OLD2, NEW)
    console.log('Code fix applied (alternate pattern)')
  } else {
    console.log('ERROR: Could not find pattern. Check manually around approveWBtn')
  }
}

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
