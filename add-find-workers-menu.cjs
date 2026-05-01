const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("menuContractsBtn") && lines[i].includes("display:flex")) {
    const findWorkersBtn = `        "<button id='menuFindWorkersBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128269;</span><span style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>Find Workers</span>" +
        "</button>" +`
    lines.splice(i, 0, findWorkersBtn)
    console.log("Added Find Workers menu item at line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
