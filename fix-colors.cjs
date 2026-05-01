const fs = require("fs")

// Update style.css with CSS variables
const cssVars = `
:root {
  --primary:        #00A859;
  --primary-dark:   #008C4A;
  --primary-light:  #33C27F;
  --primary-bg:     rgba(0,168,89,0.1);
  --primary-border: rgba(0,168,89,0.3);
  --bg-dark:        #0D1117;
  --bg-mid:         #1a2332;
  --bg-card:        rgba(255,255,255,0.06);
  --bg-card-hover:  rgba(255,255,255,0.10);
  --surface:        #FFFFFF;
  --border:         rgba(255,255,255,0.12);
  --accent:         #FF8C00;
  --accent-bg:      rgba(255,140,0,0.1);
  --text-primary:   #FFFFFF;
  --text-secondary: #9CA3AF;
  --text-muted:     #6B7280;
  --success:        #34d399;
  --success-bg:     rgba(52,211,153,0.1);
  --danger:         #f87171;
  --danger-bg:      rgba(239,68,68,0.1);
  --warning:        #fbbf24;
  --warning-bg:     rgba(251,191,36,0.1);
}
`

let css = fs.readFileSync("src/style.css", "utf8")
if (!css.includes(":root")) {
  css = cssVars + css
  fs.writeFileSync("src/style.css", css, "utf8")
  console.log("CSS variables added to style.css")
} else {
  console.log("CSS variables already exist")
}

// Replace colors in main.js
let code = fs.readFileSync("src/main.js", "utf8")

const replacements = [
  // Backgrounds - dark purple to dark green
  ["linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)", "linear-gradient(135deg,#0D1117 0%,#1a2332 50%,#0D1117 100%)"],
  ["linear-gradient(135deg,#1e1b4b,#312e81)", "linear-gradient(135deg,#0D1117,#1a2332)"],
  ["background:rgba(30,27,75,0.97)", "background:rgba(13,17,23,0.97)"],
  ["background:#1e1b4b", "background:#0D1117"],
  ["background:rgba(30,27,75", "background:rgba(13,17,23"],

  // Primary purple to green
  ["background:#4f46e5", "background:#00A859"],
  ["background:rgba(79,70,229,0.2)", "background:rgba(0,168,89,0.15)"],
  ["background:rgba(79,70,229,0.15)", "background:rgba(0,168,89,0.12)"],
  ["background:rgba(79,70,229,0.1)", "background:rgba(0,168,89,0.1)"],
  ["background:rgba(79,70,229,0.4)", "background:rgba(0,168,89,0.35)"],
  ["background:rgba(79,70,229,0.5)", "background:rgba(0,168,89,0.4)"],
  ["color:#4f46e5", "color:#00A859"],
  ["color:#818cf8", "color:#33C27F"],
  ["color:#a5b4fc", "color:#9CA3AF"],
  ["color:#c7d2fe", "color:#D1FAE5"],
  ["color:#c4b5fd", "color:#D1FAE5"],
  ["border:1px solid rgba(99,102,241,0.3)", "border:1px solid rgba(0,168,89,0.3)"],
  ["border:1px solid rgba(99,102,241,0.25)", "border:1px solid rgba(0,168,89,0.25)"],
  ["border:1px solid rgba(99,102,241,0.2)", "border:1px solid rgba(0,168,89,0.2)"],
  ["border:1.5px solid rgba(255,255,255,0.15)", "border:1.5px solid #E5E7EB"],
  ["border-bottom:1px solid rgba(99,102,241,0.3)", "border-bottom:1px solid rgba(0,168,89,0.3)"],

  // Hover states
  ["'#4338ca'", "'#008C4A'"],
  ["background:'#4f46e5'", "background:'#00A859'"],

  // Primary gradient
  ["linear-gradient(135deg,#4f46e5,#7c3aed)", "linear-gradient(135deg,#00A859,#008C4A)"],
  ["linear-gradient(135deg,#4f46e5 0%,#312e81 50%,#1e1b4b 100%)", "linear-gradient(135deg,#00A859 0%,#008C4A 100%)"],
  ["box-shadow:0 8px 28px rgba(79,70,229,0.4)", "box-shadow:0 8px 28px rgba(0,168,89,0.3)"],
  ["box-shadow:0 16px 40px rgba(79,70,229,0.5)", "box-shadow:0 16px 40px rgba(0,168,89,0.4)"],
  ["box-shadow:0 8px 24px rgba(79,70,229,0.4)", "box-shadow:0 8px 24px rgba(0,168,89,0.35)"],

  // Input focus borders
  ["borderColor='#4f46e5'", "borderColor='#00A859'"],
  ["borderColor:#4f46e5", "borderColor:#00A859"],

  // Purple tints in backgrounds
  ["background:rgba(99,102,241,0.15)", "background:rgba(0,168,89,0.12)"],
  ["background:rgba(99,102,241,0.1)", "background:rgba(0,168,89,0.1)"],
  ["background:rgba(99,102,241,0.08)", "background:rgba(0,168,89,0.08)"],
  ["background:#4338ca", "background:#008C4A"],
  ["background:#312e81", "background:#1a2332"],
  ["background:#7c3aed", "background:#008C4A"],

  // Nav and drawer backgrounds
  ["background:rgba(30,27,75,0.97)", "background:rgba(13,17,23,0.97)"],

  // Input backgrounds - keep white for readability
  ["background:#f9fafb", "background:#F7F9FA"],
]

let changeCount = 0
replacements.forEach(function([from, to]) {
  const count = (code.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length
  if (count > 0) {
    code = code.split(from).join(to)
    console.log("Replaced " + count + "x: " + from.substring(0, 50))
    changeCount += count
  }
})

fs.writeFileSync("src/main.js", code, "utf8")
console.log("\nTotal replacements: " + changeCount)
console.log("Color refactor complete!")
