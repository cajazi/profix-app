const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

// Replace lines 1599-1614 (0-indexed: 1598-1613)
const newLines = [
'    try {',
'      window.__pfDone = function(res) {',
'        supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", ref)',
'          .then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id) })',
'          .then(function() { return supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "\u20a6" + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title, type: "payment", data: {} }) })',
'          .then(function() { showPaymentSuccess(user, contract) })',
'      }',
'      window.__pfClose = function() {',
'        btn.disabled = false',
'        btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"',
'      }',
'      PaystackPop.setup({',
'        key: "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713",',
'        email: user.email,',
'        amount: Math.round(contract.agreed_price * 100),',
'        currency: "NGN",',
'        ref: ref,',
'        callback: window.__pfDone,',
'        onClose: window.__pfClose',
'      }).openIframe()',
'    } catch(e) {',
'      console.error("Paystack error:", e)',
'      btn.disabled = false',
'      btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"',
'    }',
]

// Replace lines 1600 to 1614 (1-indexed), which is index 1599 to 1613
lines.splice(1599, 15, ...newLines)

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Fixed. Lines:', lines.length)
