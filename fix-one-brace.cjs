const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "}" && lines[i-1].trim() === "}" && lines[i+1].includes("RATINGS")) {
    lines.splice(i, 1)
    console.log("Removed extra } at line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
