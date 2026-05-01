const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

// Line 2579 is index 2578, line 2580 is index 2579 - both are }))
// Remove index 2579 (the second one)
console.log("2578:", lines[2577].trim())
console.log("2579:", lines[2578].trim())
console.log("2580:", lines[2579].trim())

if (lines[2578].trim() === "})" + ")" && lines[2579].trim() === "})" + ")") {
  lines.splice(2579, 1)
  console.log("Removed duplicate })) at line 2580")
} else {
  console.log("Pattern mismatch - check lines above")
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Lines:", lines.length)
