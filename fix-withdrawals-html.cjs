const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")
code = code.replace(
  `"<p style='color:#a5b4fc;font-size:12px;margin:0 0 4px;'>"+(r.profiles?.full_name||r.profiles?.email||"Unknown")+"</p>"`,
  `"<p style='color:#a5b4fc;font-size:12px;margin:0 0 4px;'>"+(r.user_id||"Unknown")+"</p>"`
)
fs.writeFileSync("src/main.js", code, "utf8")
console.log("Fixed profile reference")
