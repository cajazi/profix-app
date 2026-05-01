const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `      const navRow = document.querySelector("nav > div")
      if (navRow && !document.getElementById("contractNavBtn")) {
        const btn = document.createElement("button")
        btn.id = "contractNavBtn"
        btn.textContent = "Contract"
        btn.style.cssText = "background:rgba(0,194,89,0.12);border:1.5px solid var(--border-active);color:var(--primary);font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;white-space:nowrap;margin-left:auto;"
        btn.onclick = () => showCreateContract(user, res.data)
        navRow.appendChild(btn)
      }`,
  `      const backBtn = document.getElementById("backBtn")
      if (backBtn && !document.getElementById("contractNavBtn")) {
        const navRow = backBtn.closest("div")
        const btn = document.createElement("button")
        btn.id = "contractNavBtn"
        btn.textContent = "Contract"
        btn.style.cssText = "background:rgba(0,194,89,0.12);border:1.5px solid var(--border-active);color:var(--primary);font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;white-space:nowrap;margin-left:auto;flex-shrink:0;"
        btn.onclick = () => showCreateContract(user, res.data)
        navRow.appendChild(btn)
      }`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
