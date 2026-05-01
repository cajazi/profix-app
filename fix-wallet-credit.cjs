const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const oldRelease = `      const { error } = await supabase.from("contracts").update({
        status:       "released",
        completed_at: new Date().toISOString(),
        released_at:  new Date().toISOString()
      }).eq("id", contract.id)

      if (error) { alert("Failed: " + error.message); confirmBtn.disabled = false; return }

      await supabase.from("notifications").insert({
        user_id: contract.worker_id,
        title:   "Payment Released!",
        body:    "NGN " + Number(contract.agreed_price).toLocaleString() + " has been released for " + contract.job_title,
        type:    "payment_released",
        data:    { contract_id: contract.id }
      })`

const newRelease = `      const { error } = await supabase.from("contracts").update({
        status:       "released",
        completed_at: new Date().toISOString(),
        released_at:  new Date().toISOString()
      }).eq("id", contract.id)

      if (error) { alert("Failed: " + error.message); confirmBtn.disabled = false; return }

      await creditWallet(contract.worker_id, contract.agreed_price, "Payment for " + contract.job_title, contract.id)

      await supabase.from("notifications").insert({
        user_id: contract.worker_id,
        title:   "Payment Released!",
        body:    "NGN " + Number(contract.agreed_price).toLocaleString() + " has been added to your wallet for " + contract.job_title,
        type:    "payment_released",
        data:    { contract_id: contract.id }
      })`

if (code.includes(oldRelease)) {
  code = code.replace(oldRelease, newRelease)
  fs.writeFileSync("src/main.js", code, "utf8")
  console.log("Wallet credit added on payment release")
} else {
  console.log("Pattern not found")
}
