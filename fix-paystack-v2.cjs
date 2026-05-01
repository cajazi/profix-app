const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Remove old paystack block entirely and replace with fetch API approach
const OLD_CHECK = `    if (typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection.")
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      return
    }
    console.log("PaystackPop type:", typeof PaystackPop)
    console.log("PaystackPop.setup type:", typeof PaystackPop.setup)`

const NEW_CHECK = `    if (typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection.")
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      return
    }`

c = c.replace(OLD_CHECK, NEW_CHECK)

// Replace the broken try block
const OLD_TRY = `    try {
      window._paystackContract = contract
      window._paystackUser     = user
      window._paystackRef      = ref

      window._onPaystackSuccess = function(response) {
        const _contract = window._paystackContract
        const _user     = window._paystackUser
        const _ref      = window._paystackRef
        supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", _ref)
          .then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", _contract.id) })
          .then(function() { return supabase.from("notifications").insert({ user_id: _contract.worker_id, title: "Payment Received!", body: "\\u20a6" + Number(_contract.agreed_price).toLocaleString() + " received for " + _contract.job_title, type: "payment", data: {} }) })
          .then(function() { showPaymentSuccess(_user, _contract) })
      }

      window._onPaystackClose = function() {
        btn.disabled = false
        btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
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
      btn.textContent = "Pay \\u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
    }`

const NEW_TRY = `    // Store contract data globally for callback access
    window.__pf_contract = contract
    window.__pf_user     = user
    window.__pf_ref      = ref

    // Define callback as plain global function - required by Paystack v1
    window.__pf_onSuccess = function(res) {
      var _c = window.__pf_contract
      var _u = window.__pf_user
      var _r = window.__pf_ref
      supabase.from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("paystack_ref", _r)
        .then(function() {
          return supabase.from("contracts")
            .update({ status: "active", funded_at: new Date().toISOString() })
            .eq("id", _c.id)
        })
        .then(function() {
          return supabase.from("notifications").insert({
            user_id: _c.worker_id,
            title: "Payment Received!",
            body: "\u20a6" + Number(_c.agreed_price).toLocaleString() + " received for " + _c.job_title,
            type: "payment",
            data: {}
          })
        })
        .then(function() {
          showPaymentSuccess(_u, _c)
        })
    }

    window.__pf_onClose = function() {
      var b = document.getElementById("payNowBtn")
      if (b) {
        b.disabled = false
        b.textContent = "Pay \u20a6" + Number(window.__pf_contract.agreed_price).toLocaleString() + " via Paystack"
      }
    }

    try {
      var popup = new PaystackPop()
      popup.newTransaction({
        key:      "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713",
        email:    user.email,
        amount:   Math.round(contract.agreed_price * 100),
        currency: "NGN",
        ref:      ref,
        onSuccess: window.__pf_onSuccess,
        onCancel:  window.__pf_onClose
      })
    } catch(e) {
      console.error("Paystack error:", e)
      // Fallback: open Paystack checkout page directly
      var paystackUrl = "https://paystack.com/pay/" +
        "?amount=" + Math.round(contract.agreed_price * 100) +
        "&email=" + encodeURIComponent(user.email) +
        "&ref=" + ref +
        "&key=pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713"

      if (confirm("Paystack popup blocked. Open payment page in browser?")) {
        window.open("https://checkout.paystack.com/", "_blank")
        // Poll for payment completion
        var pollCount = 0
        var pollInterval = setInterval(async function() {
          pollCount++
          var { data: payment } = await supabase.from("payments").select("status").eq("paystack_ref", ref).maybeSingle()
          if (payment && payment.status === "paid") {
            clearInterval(pollInterval)
            window.__pf_onSuccess({ reference: ref })
          }
          if (pollCount > 60) clearInterval(pollInterval)
        }, 5000)
      }
      var b = document.getElementById("payNowBtn")
      if (b) { b.disabled = false; b.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
    }`

c = c.replace(OLD_TRY, NEW_TRY)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
