const fs = require('fs')

// Fix in style.css - force the button to always be visible
let css = fs.readFileSync('src/style.css', 'utf8')
css += `
/* Wallet withdraw button - always visible */
#withdrawBtn {
  background: #FFFFFF !important;
  color: #007A38 !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  padding: 12px 28px !important;
  border: 3px solid #007A38 !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  min-width: 160px !important;
}
#withdrawBtn:disabled {
  background: rgba(255,255,255,0.2) !important;
  color: #FFFFFF !important;
  border-color: rgba(255,255,255,0.4) !important;
}
`
fs.writeFileSync('src/style.css', css, 'utf8')
console.log('CSS fix applied')
