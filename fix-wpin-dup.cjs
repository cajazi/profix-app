const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const fns = ['checkWithdrawalPin', 'showSetWithdrawalPin', 'showVerifyWithdrawalPin']
fns.forEach(fn => {
  const first = c.indexOf(`async function ${fn}`) > 0 ? c.indexOf(`async function ${fn}`) : c.indexOf(`function ${fn}`)
  if (first < 0) return
  const second = c.indexOf(`function ${fn}`, first + 10)
  if (second < 0) return
  // find end of first function
  const nextFn = c.indexOf('\nfunction ', first + 10)
  const nextAsync = c.indexOf('\nasync function ', first + 10)
  let end = Math.min(nextFn > 0 ? nextFn : 999999, nextAsync > 0 ? nextAsync : 999999)
  if (end === 999999) return
  c = c.slice(0, first) + c.slice(end + 1)
  console.log('Removed duplicate:', fn)
})

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
