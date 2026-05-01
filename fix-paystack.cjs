const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `    try {
      PaystackPop.setup({
        key: "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713",
        email: user.email,
        amount: Math.round(contract.agreed_price * 100),
        currency: "NGN", ref,
        callback: async (response) => {
          await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", ref)
          await supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id)
          await supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "Escrow payment of \\u20a6" + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title, type: "payment", data: { contract_id: contract.id } })
          showPaymentSuccess(user, contract)
        },
        onClose: () => { btn.disabled = false; btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
      }).openIframe()
    } catch(e) { alert("Payment error: " + e.message); btn.disabled = false; btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack" }`,
  `    try {
      const handler = PaystackPop.setup({
        key: "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713",
        email: user.email,
        amount: Math.round(contract.agreed_price * 100),
        currency: "NGN",
        ref: ref,
        callback: function(response) {
          supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", ref)
            .then(() => supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id))
            .then(() => supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "\u20a6" + Number(contract.agreed_price).toLocaleString() + " escrow payment received for " + contract.job_title, type: "payment", data: { contract_id: contract.id } }))
            .then(() => showPaymentSuccess(user, contract))
        },
        onClose: function() {
          btn.disabled = false
          btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
        }
      })
      handler.openIframe()
    } catch(e) {
      alert("Payment error: " + e.message)
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
    }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
