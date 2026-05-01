const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `async function creditWallet(userId, amount, description, contractId) {
  const wallet = await getOrCreateWallet(userId)
  if (!wallet) return false
  const newBalance = Number(wallet.balance) + Number(amount)
  const newEarned  = Number(wallet.total_earned) + Number(amount)
  await supabase.from("wallets").update({ balance: newBalance, total_earned: newEarned, updated_at: new Date().toISOString() }).eq("user_id", userId)
  await supabase.from("wallet_transactions").insert({ user_id: userId, type: "credit", amount, description, contract_id: contractId })
  return true
}`,
  `async function creditWallet(userId, amount, description, contractId) {
  const { error } = await supabase.rpc("credit_worker_wallet", {
    p_user_id: userId,
    p_amount: Number(amount),
    p_description: description,
    p_contract_id: contractId
  })
  if (error) console.error("creditWallet error:", error)
  return !error
}`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
