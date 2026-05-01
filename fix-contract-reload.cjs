const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const oldShow = `async function showContract(user, contract) {
  pushScreen("contract", () => showContract(user, contract))`

const newShow = `async function showContract(user, contract) {
  pushScreen("contract", () => showContract(user, contract))
  // Always fetch fresh contract data from DB
  const { data: fresh } = await supabase.from("contracts").select("*").eq("id", contract.id).single()
  if (fresh) contract = fresh`

if (code.includes(oldShow)) {
  code = code.replace(oldShow, newShow)
  fs.writeFileSync("src/main.js", code, "utf8")
  console.log("Fixed - contract now reloads fresh data")
} else {
  console.log("Pattern not found")
}
