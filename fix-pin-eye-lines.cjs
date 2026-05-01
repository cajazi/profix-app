const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

let fixed = 0
for (let i = 0; i < lines.length; i++) {
  // Find all pinInput lines
  if (lines[i].includes("id='pinInput'") && lines[i].includes("type='tel'")) {
    lines[i] = lines[i]
      .replace("type='tel'", "type='password'")
      .replace(
        "box-sizing:border-box;' />\" +",
        "box-sizing:border-box;' />\" +" +
        "\n      \"<button id='pinEyeBtn' type='button' onclick=\\\"var i=document.getElementById('pinInput');i.type=i.type==='password'?'tel':'password';this.innerHTML=i.type==='password'?'&#128065;':'&#128683;'\\\" style='width:100%;margin-top:8px;padding:8px;background:none;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;font-size:18px;color:var(--text-muted);'>&#128065; Show PIN</button>\" +"
      )
    console.log("Fixed pinInput at line", i+1)
    fixed++
  }

  // Find all wpinInput lines
  if (lines[i].includes("id='wpinInput'") && lines[i].includes("type='tel'")) {
    lines[i] = lines[i]
      .replace("type='tel'", "type='password'")
      .replace(
        "box-sizing:border-box;' />\"",
        "box-sizing:border-box;' />\" +" +
        "\n        \"<button id='wpinEyeBtn' type='button' onclick=\\\"var i=document.getElementById('wpinInput');i.type=i.type==='password'?'tel':'password';this.innerHTML=i.type==='password'?'&#128065;':'&#128683;'\\\" style='width:100%;margin-top:8px;padding:8px;background:none;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;font-size:18px;color:var(--text-muted);'>&#128065; Show PIN</button>\""
      )
    console.log("Fixed wpinInput at line", i+1)
    fixed++
  }
}

console.log("Total fixed:", fixed)
fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
