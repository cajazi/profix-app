const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Add withdrawals tab button
code = code.replace(
  `"<button class='adminTab' data-tab='jobs' style='padding:8px 16px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:#a5b4fc;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>&#128203; All Jobs</button>" +`,
  `"<button class='adminTab' data-tab='jobs' style='padding:8px 16px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:#a5b4fc;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>&#128203; All Jobs</button>" +
    "<button class='adminTab' data-tab='withdrawals' style='padding:8px 16px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:#a5b4fc;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>&#128184; Withdrawals</button>" +`
)

console.log(code.includes("withdrawals") ? "Tab added" : "Tab not added")
fs.writeFileSync("src/main.js", code, "utf8")
