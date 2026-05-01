const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Remove budget input field
code = code.replace(
  `        "<div style='margin-bottom:4px;'><label style='display:block;color:#e0e7ff;font-size:13px;font-weight:600;margin-bottom:6px;'>Your Budget (&#8358;) <span style='color:#6b7280;font-size:12px;font-weight:400;'>(optional)</span></label><input id='hireBudget' type='number' placeholder='e.g. 15000' style='width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#fff;font-size:15px;outline:none;box-sizing:border-box;' /></div>" +`,
  ``
)

// Remove budget variable
code = code.replace(
  `    const budget   = parseFloat(document.getElementById("hireBudget").value) || 0`,
  `    const budget   = 0`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Budget field removed")
