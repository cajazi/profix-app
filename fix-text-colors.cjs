const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// These green tints look bad as text in light mode - replace with proper CSS vars
c = c.replace(/color:#80D4A8/g, 'color:var(--text-secondary)')
c = c.replace(/color:#33CE7A/g, 'color:var(--text-accent)')
c = c.replace(/color:#B3EDCF/g, 'color:var(--text-muted)')
c = c.replace(/color:#C8EDDA/g, 'color:var(--text-muted)')
c = c.replace(/color:#E6F9EE/g, 'color:var(--text-muted)')

// Fix text on white cards - should be dark not green
c = c.replace(/color:#00C259(?=;)/g, 'color:var(--primary)')

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done. Lines:', c.split('\n').length)
