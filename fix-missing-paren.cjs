const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("backWalletBtn") && lines[i].includes("addEventListener")) {
    // Find the closing }) of this listener
    let j = i + 1
    while (j < lines.length && lines[j].trim() !== "})") j++
    // Check if next line after }) is }) - if not, insert the missing checkWithdrawalPin close
    if (lines[j+1] && lines[j+1].trim() !== "})") {
      lines.splice(j+1, 0, "    }) // end checkWithdrawalPin")
      console.log("Inserted missing }) at line", j+2)
    } else {
      console.log("Already has }), no fix needed")
    }
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
