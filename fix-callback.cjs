const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const oldCallback = `        callback: async function(response) {
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
        },`

const newCallback = `        callback: function(response) {
          supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", ref).then(function() {
            return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id)
          }).then(function() {
            return supabase.from("notifications").insert({
              user_id: contract.worker_id,
              title:   "Payment Received!",
              body:    "Escrow payment of NGN " + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title,
              type:    "payment",
              data:    { contract_id: contract.id }
            })
          }).then(function() {
            showPaymentSuccess(user, contract)
          })
        },`

if (code.includes(oldCallback)) {
  code = code.replace(oldCallback, newCallback)
  fs.writeFileSync("src/main.js", code, "utf8")
  console.log("Callback fixed successfully")
} else {
  console.log("Pattern not found - trying line search...")
  const lines = code.split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("callback: async function")) {
      lines[i] = lines[i].replace("callback: async function", "callback: function")
      console.log("Fixed async on line", i+1)
    }
  }
  fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
}
