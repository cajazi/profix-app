const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Fix email validation - simple check
c = c.replace(
  "if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))",
  "if (!email.includes('@') || !email.includes('.'))"
)

// Fix create account button - just focus the input
c = c.replace(
  'document.getElementById("createLink").addEventListener("click", () => { input.focus() })',
  'document.getElementById("createLink").addEventListener("click", () => { input.focus(); input.placeholder = "Enter your email to get started" })'
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
