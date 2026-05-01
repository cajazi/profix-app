const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")
code = code.replace(
  "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "pk_live_917f97fe3a9db32a1f6c2340c5e30e34f50d6a48"
)
fs.writeFileSync("src/main.js", code, "utf8")
console.log("Paystack key updated")
