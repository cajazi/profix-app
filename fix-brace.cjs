const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")
// Line 1911 (index 1910) is the extra }
console.log("Line 1910:", lines[1910])
console.log("Line 1911:", lines[1911])
if (lines[1910].trim() === "}" && lines[1911].trim() === "}") {
  lines.splice(1910, 1)
  console.log("Removed extra }")
} else {
  console.log("Lines dont match - check manually")
}
fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
