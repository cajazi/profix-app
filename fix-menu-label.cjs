const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Change default label from "Find Workers" to "Find Work / Workers"  
code = code.replace(
  `"<span id='menuFindWorkersLabel' style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>Find Workers</span>"`,
  `"<span id='menuFindWorkersLabel' style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>Find Work</span>"`
)

// Update role check to set correct label
code = code.replace(
  `    const label = document.getElementById("menuFindWorkersLabel")
    if (label) label.textContent = role === "worker" ? "Find Work" : "Find Workers"`,
  `    const label = document.getElementById("menuFindWorkersLabel")
    if (label) label.textContent = role === "worker" ? "Find Work" : "Find Workers"
    // Set icon too
    const btn = document.getElementById("menuFindWorkersBtn")
    if (btn) btn.querySelector("span").textContent = role === "worker" ? "&#128269;" : "&#128269;"`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Menu label fixed")
