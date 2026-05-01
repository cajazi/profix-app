const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `async function creditWallet(userId, amount, description, contractId) {
  const { error } = await supabase.rpc("credit_worker_wallet", {
    p_user_id: userId,
    p_amount: Number(amount),
    p_description: description,
    p_contract_id: contractId
  })
  if (error) console.error("creditWallet error:", error)
  return !error
}`,
  `async function creditWallet(userId, amount, description, contractId) {
  console.log("creditWallet called:", userId, amount, description, contractId)
  const { error, data } = await supabase.rpc("credit_worker_wallet", {
    p_user_id: userId,
    p_amount: Number(amount),
    p_description: description,
    p_contract_id: contractId
  })
  console.log("creditWallet result:", data, "error:", error)
  return !error
}`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
