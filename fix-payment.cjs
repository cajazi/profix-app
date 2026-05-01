const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("payNowBtn") && lines[i].includes("addEventListener")) {
    // Find the handler block and replace it
    let start = i
    let end = i
    let depth = 0
    for (let j = i; j < Math.min(i + 40, lines.length); j++) {
      if (lines[j].includes("{")) depth += (lines[j].match(/{/g)||[]).length
      if (lines[j].includes("}")) depth -= (lines[j].match(/}/g)||[]).length
      end = j
      if (j > i && depth <= 0) break
    }
    
    const newHandler = `  document.getElementById("payNowBtn").addEventListener("click", async () => {
    if (typeof PaystackPop === "undefined") {
      alert("Payment system is loading. Please wait a moment and try again.")
      return
    }
    const payBtn = document.getElementById("payNowBtn")
    if (payBtn) payBtn.textContent = "Opening payment..."

    await supabase.from("payments").insert({
      contract_id:  contract.id,
      amount:       contract.agreed_price,
      paystack_ref: ref,
      status:       "pending"
    })

    const handler = PaystackPop.setup({
      key:      "pk_live_917f97fe3a9db32a1f6c2340c5e30e34f50d6a48",
      email:    user.email,
      amount:   Math.round(contract.agreed_price * 100),
      currency: "NGN",
      ref:      ref,
      metadata: { contract_id: contract.id, job_title: contract.job_title, worker_email: contract.worker_email },
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
        const pb = document.getElementById("payNowBtn")
        if (pb) { pb.disabled = false; pb.textContent = "Pay NGN " + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
      }
    })
    handler.openIframe()
  })`

    lines.splice(start, end - start + 1, ...newHandler.split("\n"))
    console.log("Payment handler fixed at line", start + 1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
