const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onclick=') && lines[i].includes('window.open') && lines[i].includes('kyc_id_url')) {
    lines[i] = lines[i]
      .replace(`onclick="window.open('" + u.kyc_id_url + "','_blank')"`, `onclick=\"window.open('\" + u.kyc_id_url + \"','_blank')\"`)
    console.log('Fixed kyc_id_url onclick at line', i+1)
  }
  if (lines[i].includes('onclick=') && lines[i].includes('window.open') && lines[i].includes('kyc_selfie_url')) {
    lines[i] = lines[i]
      .replace(`onclick="window.open('" + u.kyc_selfie_url + "','_blank')"`, `onclick=\"window.open('\" + u.kyc_selfie_url + \"','_blank')\"`)
    console.log('Fixed kyc_selfie_url onclick at line', i+1)
  }
}

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
