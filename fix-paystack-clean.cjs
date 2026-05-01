const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Find and replace the entire payNowBtn click handler
const OLD = `  document.getElementById("payNowBtn").addEventListener("click", async () => {
    const btn = document.getElementById("payNowBtn")
    btn.disabled = true; btn.textContent = "Opening payment..."
    await supabase.from("payments").insert({ contract_id: contract.id, amount: contract.agreed_price, paystack_ref: ref, status: "pending" })

    if (typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection.")
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      return
    }`

const NEW = `  document.getElementById("payNowBtn").addEventListener("click", async () => {
    const btn = document.getElementById("payNowBtn")
    btn.disabled = true; btn.textContent = "Opening payment..."

    // Upsert to avoid 409 conflict on retry
    await supabase.from("payments").upsert(
      { contract_id: contract.id, amount: contract.agreed_price, paystack_ref: ref, status: "pending" },
      { onConflict: "paystack_ref" }
    )

    if (typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection.")
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      return
    }`

c = c.replace(OLD, NEW)

// Now replace the try block with clean PaystackPop.setup using window callback
const OLD_TRY = c.slice(c.indexOf('    window.__pf_contract = contract'), c.indexOf('    }\n  })\n}') + '    }\n  })\n}'.length)

// Find more precisely
const tryStart = c.indexOf('    // Store contract data globally for callback access')
const tryEnd   = c.indexOf("var b = document.getElementById(\"payNowBtn\")\n      if (b) { b.disabled = false; b.textContent = \"Pay \u20a6\" + Number(contract.agreed_price).toLocaleString() + \" via Paystack\" }\n    }") + "var b = document.getElementById(\"payNowBtn\")\n      if (b) { b.disabled = false; b.textContent = \"Pay \u20a6\" + Number(contract.agreed_price).toLocaleString() + \" via Paystack\" }\n    }".length

if (tryStart > 0 && tryEnd > tryStart) {
  const CLEAN_TRY = `    // Paystack v1 - callback must be plain window function
    window.__pfSuccess = function(response) {
      supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", ref)
        .then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id) })
        .then(function() { return supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "\u20a6" + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title, type: "payment", data: {} }) })
        .then(function() { showPaymentSuccess(user, contract) })
    }
    window.__pfClose = function() {
      btn.disabled = false
      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
    }
    PaystackPop.setup({
      key:      "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713",
      email:    user.email,
      amount:   Math.round(contract.agreed_price * 100),
      currency: "NGN",
      ref:      ref,
      callback: window.__pfSuccess,
      onClose:  window.__pfClose
    }).openIframe()`

  c = c.slice(0, tryStart) + CLEAN_TRY + '\n  })\n}' + c.slice(tryEnd)
  console.log('Try block replaced')
} else {
  console.log('ERROR: Could not find try block at', tryStart, tryEnd)
}

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
