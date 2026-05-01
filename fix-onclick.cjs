const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

// Fix line 854 - ID image onclick
lines[853] = lines[853].replace(
  `onclick="window.open('"+p.kyc_id_url+"','_blank')"`,
  `onclick=\\"window.open('\"+p.kyc_id_url+\"','_blank')\\"`
)

// Fix line 855 - selfie image onclick (check nearby lines too)
for (let i = 853; i < 860; i++) {
  if (lines[i] && lines[i].includes("kyc_selfie_url") && lines[i].includes("onclick=\"window.open")) {
    lines[i] = lines[i].replace(
      `onclick="window.open('"+p.kyc_selfie_url+"','_blank')"`,
      `onclick=\\"window.open('\"+p.kyc_selfie_url+\"','_blank')\\"`
    )
    console.log("Fixed selfie onclick on line", i+1)
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Fixed ID onclick on line 854.")
