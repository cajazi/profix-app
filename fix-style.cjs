const fs = require("fs")
let css = fs.readFileSync("src/style.css", "utf8")

// Remove BOM and ensure @import is first
css = css.replace(/^\uFEFF/, "")
css = css.replace(/\u00ef\u00bb\u00bf/g, "")

// Extract @import line
const importLine = '@import "tailwindcss";'
css = css.replace(importLine, "")

// Put @import first then :root then rest
const cleanCss = importLine + "\n" + css.trim()

fs.writeFileSync("src/style.css", cleanCss, "utf8")
console.log("style.css fixed - @import is now first")
