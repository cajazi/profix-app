const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Add commission calculation function
const COMMISSION_FN = `
function calculateCommission(amount) {
  const amt = Number(amount)
  if (amt <= 100000)  return Math.round(amt * 0.05)
  if (amt <= 500000)  return Math.round(amt * 0.035)
  if (amt <= 1000000) return Math.round(amt * 0.025)
  return Math.round(amt * 0.015)
}
`

c = c.replace('function getDeviceId()', COMMISSION_FN + 'function getDeviceId()')

// Update creditWallet to deduct commission
c = c.replace(
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
}`,
  `async function creditWallet(userId, amount, description, contractId) {
  const commission   = calculateCommission(amount)
  const workerAmount = Number(amount) - commission
  console.log("Payment:", amount, "Commission:", commission, "Worker gets:", workerAmount)
  const { error, data } = await supabase.rpc("credit_worker_wallet", {
    p_user_id: userId,
    p_amount: workerAmount,
    p_description: description,
    p_contract_id: contractId
  })
  // Log commission to DB
  await supabase.from("wallet_transactions").insert({
    user_id: userId,
    type: "commission",
    amount: commission,
    description: "ProFix commission (" + (Math.round(commission/amount*100*10)/10) + "%) for " + description,
    contract_id: contractId
  }).then(() => {})
  if (error) console.error("creditWallet error:", error)
  return !error
}`
)

// Show commission breakdown on payment screen
c = c.replace(
  `"<div style='display:flex;justify-content:space-between;padding:12px 0 0;'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Amount</p>" +
          "<p style='color:var(--primary);font-size:22px;font-weight:800;margin:0;'>&#8358;" + Number(contract.agreed_price).toLocaleString() + "</p>" +
        "</div>"`,
  `"<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Amount</p>" +
          "<p style='color:var(--primary);font-size:22px;font-weight:800;margin:0;'>&#8358;" + Number(contract.agreed_price).toLocaleString() + "</p>" +
        "</div>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>ProFix Commission</p>" +
          "<p style='color:var(--danger);font-size:13px;font-weight:600;margin:0;'>-&#8358;" + calculateCommission(contract.agreed_price).toLocaleString() + "</p>" +
        "</div>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0 0;'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Worker Receives</p>" +
          "<p style='color:var(--primary);font-size:18px;font-weight:800;margin:0;'>&#8358;" + (Number(contract.agreed_price) - calculateCommission(contract.agreed_price)).toLocaleString() + "</p>" +
        "</div>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Commission added. Lines:', c.split('\n').length)
