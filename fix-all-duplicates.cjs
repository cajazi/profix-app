const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const fns = ['showAdminPanel', 'loadAdminStats', 'loadAdminTab']

fns.forEach(fnName => {
  const pattern1 = `async function ${fnName}`
  const pattern2 = `function ${fnName}`
  
  let searchStr = c.includes(pattern1) ? pattern1 : pattern2
  const first = c.indexOf(searchStr)
  if (first < 0) return
  
  const second = c.indexOf(searchStr, first + 1)
  if (second < 0) return
  
  // Remove the first occurrence
  const nextFn = c.indexOf('\nasync function ', first + 1)
  const nextFn2 = c.indexOf('\nfunction ', first + 1)
  let end = Math.min(
    nextFn > 0 ? nextFn : Infinity,
    nextFn2 > 0 ? nextFn2 : Infinity
  )
  if (end === Infinity) return
  
  c = c.slice(0, first) + c.slice(end)
  console.log('Removed duplicate:', fnName)
})

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
