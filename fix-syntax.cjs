const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

// Find the broken postJobBtn listener and fix missing opening brace
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("postJobBtn") && lines[i].includes("addEventListener") && !lines[i-1].includes('}')) {
    console.log('Found issue at line', i+1)
    console.log('Line before:', lines[i-1])
    console.log('Line:', lines[i])
    break
  }
}

// Find and fix - the }) from escrow is eating the postJobBtn opening
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Load escrow total')) {
    // Check if lines i+8 and i+9 are correct
    console.log('Escrow block lines:')
    for (let j = i; j <= i+12; j++) {
      console.log(j+1, ':', lines[j])
    }
    break
  }
}
