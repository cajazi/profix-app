const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `    if (typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection.")
      btn.disabled = false; btn.textContent = "Opening payment..."
      return
    }`,
  `    if (typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection.")
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      return
    }
    console.log("PaystackPop type:", typeof PaystackPop)
    console.log("PaystackPop.setup type:", typeof PaystackPop.setup)`
)

// Replace the entire try block with a simpler approach
c = c.replace(
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
            .then(() => supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "\\u20a6" + Number(contract.agreed_price).toLocaleString() + " escrow payment received for " + contract.job_title, type: "payment", data: { contract_id: contract.id } }))
            .then(() => showPaymentSuccess(user, contract))
        },
        onClose: function() {
          btn.disabled = false
          btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
        }
      })
      handler.openIframe()
    } catch(e) {
      alert("Payment error: " + e.message)
      btn.disabled = false
      btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
    }`,
  `    try {
      const paystackAmount = Math.round(contract.agreed_price * 100)
      const paystackEmail  = user.email
      const paystackRef    = ref
      const paystackKey    = "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713"

      function onPaymentSuccess(response) {
        supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", paystackRef)
          .then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id) })
          .then(function() { return supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "\u20a6" + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title, type: "payment", data: {} }) })
          .then(function() { showPaymentSuccess(user, contract) })
      }

      function onPaymentClose() {
        btn.disabled = false
        btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      }

      const handler = PaystackPop.setup({
        key: paystackKey,
        email: paystackEmail,
        amount: paystackAmount,
        currency: "NGN",
        ref: paystackRef,
        callback: onPaymentSuccess,
        onClose: onPaymentClose
      })
      handler.openIframe()
    } catch(e) {
      console.error("Paystack error:", e)
      alert("Payment error: " + e.message)
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
    }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
