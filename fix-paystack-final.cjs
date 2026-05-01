const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Replace entire paystack block with newTransaction approach
const OLD = `    try {
      const paystackAmount = Math.round(contract.agreed_price * 100)
      const paystackEmail  = user.email
      const paystackRef    = ref
      const paystackKey    = "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713"

      function onPaymentSuccess(response) {
        supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", paystackRef)
          .then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id) })
          .then(function() { return supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "\\u20a6" + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title, type: "payment", data: {} }) })
          .then(function() { showPaymentSuccess(user, contract) })
      }

      function onPaymentClose() {
        btn.disabled = false
        btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
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
      btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
    }`

const NEW = `    try {
      window._paystackContract = contract
      window._paystackUser     = user
      window._paystackRef      = ref

      window._onPaystackSuccess = function(response) {
        const _contract = window._paystackContract
        const _user     = window._paystackUser
        const _ref      = window._paystackRef
        supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", _ref)
          .then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", _contract.id) })
          .then(function() { return supabase.from("notifications").insert({ user_id: _contract.worker_id, title: "Payment Received!", body: "\u20a6" + Number(_contract.agreed_price).toLocaleString() + " received for " + _contract.job_title, type: "payment", data: {} }) })
          .then(function() { showPaymentSuccess(_user, _contract) })
      }

      window._onPaystackClose = function() {
        btn.disabled = false
        btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      }

      const handler = PaystackPop.newTransaction({
        key: "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713",
        email: user.email,
        amount: Math.round(contract.agreed_price * 100),
        currency: "NGN",
        ref: ref,
        onSuccess: window._onPaystackSuccess,
        onCancel: window._onPaystackClose
      })
    } catch(e) {
      console.error("Paystack error:", e)
      alert("Payment error: " + e.message)
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
    }`

c = c.replace(OLD, NEW)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
