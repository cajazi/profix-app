const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Find both occurrences
const first = c.indexOf('async function showAdminPanel(')
const second = c.indexOf('async function showAdminPanel(', first + 1)

console.log('First at char:', first)
console.log('Second at char:', second)

if (second > 0) {
  // Remove the first (older) one - find its end
  const nextFn = c.indexOf('\nasync function ', first + 1)
  const oldFn = c.slice(first, nextFn)
  c = c.slice(0, first) + c.slice(nextFn)
  console.log('Removed old showAdminPanel')
}

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
