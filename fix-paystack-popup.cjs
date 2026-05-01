const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const oldHandler = code.match(/document\.getElementById\("payNowBtn"\)\.addEventListener\("click", async \(\) => \{[\s\S]*?handler\.openIframe\(\)\s*\}\)/)?.[0]

if (!oldHandler) {
  console.log("Handler not found - searching for payNowBtn block...")
  const idx = code.indexOf('document.getElementById("payNowBtn").addEventListener')
  console.log("Found at index:", idx)
  console.log("Context:", code.substring(idx, idx + 200))
} else {
  const key = code.match(/pk_(?:test|live)_[a-zA-Z0-9]+/)?.[0] || "pk_test_xxxx"
  console.log("Using key:", key.substring(0, 20) + "...")
  
  const newHandler = `document.getElementById("payNowBtn").addEventListener("click", async () => {
    const payBtn = document.getElementById("payNowBtn")
    if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Opening payment..." }

    const { error: payErr } = await supabase.from("payments").insert({
      contract_id:  contract.id,
      amount:       contract.agreed_price,
      paystack_ref: ref,
      status:       "pending"
    })

    const paystackScript = document.querySelector('script[src*="paystack"]')
    if (!paystackScript || typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection and try again.")
      if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Pay NGN " + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
      return
    }

    try {
      const handler = PaystackPop.setup({
        key:      "${key}",
        email:    user.email,
        amount:   Math.round(contract.agreed_price * 100),
        currency: "NGN",
        ref:      ref,
        callback: async function(response) {
          await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", ref)
          await supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id)
          await supabase.from("notifications").insert({
            user_id: contract.worker_id,
            title:   "Payment Received!",
            body:    "Escrow payment of NGN " + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title,
            type:    "payment",
            data:    { contract_id: contract.id }
          })
          showPaymentSuccess(user, contract)
        },
        onClose: function() {
          if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Pay NGN " + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
        }
      })
      handler.openIframe()
    } catch(e) {
      console.error("Paystack error:", e)
      alert("Payment error: " + e.message + ". Please try again.")
      if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Pay NGN " + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
    }
  })`

  code = code.replace(oldHandler, newHandler)
  fs.writeFileSync("src/main.js", code, "utf8")
  console.log("Payment handler updated successfully")
}
