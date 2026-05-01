const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

code = code.replace(
  `(contract.status === "released" ? "<div style='background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:14px;padding:18px;text-align:center;'><p style='color:#34d399;font-size:15px;font-weight:600;margin:0;'>&#10003; Payment released to worker</p></div>" : "")`,
  `(contract.status === "released" ? "<div style='background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:14px;padding:18px;text-align:center;margin-bottom:10px;'><p style='color:#34d399;font-size:15px;font-weight:600;margin:0;'>&#10003; Payment released to worker</p></div><button id='rateUserBtn' style='width:100%;padding:13px;background:rgba(251,191,36,0.1);color:#fbbf24;font-size:14px;font-weight:600;border:1px solid rgba(251,191,36,0.3);border-radius:12px;cursor:pointer;min-height:48px;'>&#11088; Leave a Review</button>" : "")`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Rate button added to released contracts")
