const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

code = code.replace(
  `if (w) { await supabase.from("wallets").update({balance:Math.max(0,Number(w.balance)-Number(btn.dataset.amt)),total_withdrawn:Number(w.total_withdrawn)+Number(btn.dataset.amt),updated_at:new Date().toISOString()}).eq("user_id",btn.dataset.uid) }`,
  `if (w) {
          const newBal = Math.max(0, Number(w.balance) - Number(btn.dataset.amt))
          const newWithdrawn = Number(w.total_withdrawn) + Number(btn.dataset.amt)
          const { error: wErr } = await supabase.from("wallets").update({
            balance: newBal,
            total_withdrawn: newWithdrawn,
            updated_at: new Date().toISOString()
          }).eq("user_id", btn.dataset.uid)
          console.log("Wallet update error:", wErr, "New balance:", newBal)
        }`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Fixed wallet approval update")
