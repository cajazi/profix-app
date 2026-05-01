const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Change pin boxes from 4 to 6 in showPinLogin
code = code.replace(
  `[1,2,3,4].map(i => "<input id='pinBox" + i + "' type='password' inputmode='numeric' maxlength='1' style='width:56px;height:64px;border-radius:14px;border:2px solid #E5E7EB;color:#1F2937;background:#fff;font-size:28px;font-weight:700;text-align:center;outline:none;box-sizing:border-box;' />").join("")`,
  `[1,2,3,4,5,6].map(i => "<input id='pinBox" + i + "' type='password' inputmode='numeric' maxlength='1' style='width:44px;height:54px;border-radius:12px;border:2px solid #E5E7EB;color:#1F2937;background:#fff;font-size:24px;font-weight:700;text-align:center;outline:none;box-sizing:border-box;' />").join("")`
)

// Fix loop from 4 to 6 in showPinLogin
code = code.replace(
  `  for (let i = 1; i <= 4; i++) {
    const box = document.getElementById("pinBox" + i)
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\\D/g, "").slice(0,1)
      if (box.value && i < 4) document.getElementById("pinBox" + (i+1)).focus()
      if (i === 4 && box.value) document.getElementById("pinLoginBtn").click()
    })
    box.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !box.value && i > 1) document.getElementById("pinBox" + (i-1)).focus()
    })
  }`,
  `  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById("pinBox" + i)
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\\D/g, "").slice(0,1)
      if (box.value && i < 6) document.getElementById("pinBox" + (i+1)).focus()
      if (i === 6 && box.value) document.getElementById("pinLoginBtn").click()
    })
    box.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !box.value && i > 1) document.getElementById("pinBox" + (i-1)).focus()
    })
  }`
)

// Fix pin join from 4 to 6 in pinLoginBtn handler
code = code.replace(
  `    const pin = [1,2,3,4].map(i => document.getElementById("pinBox" + i).value).join("")`,
  `    const pin = [1,2,3,4,5,6].map(i => document.getElementById("pinBox" + i).value).join("")`
)

// Fix pin length check from 4 to 6 in pinLoginBtn
code = code.replace(
  `    if (pin.length !== 4) {
      if (errEl) { errEl.textContent = "Please enter your 4-digit PIN"; errEl.style.display = "block" }`,
  `    if (pin.length !== 6) {
      if (errEl) { errEl.textContent = "Please enter your 6-digit PIN"; errEl.style.display = "block" }`
)

// Fix reset loop from 4 to 6
code = code.replace(
  `      for (let i = 1; i <= 4; i++) document.getElementById("pinBox" + i).value = ""`,
  `      for (let i = 1; i <= 6; i++) document.getElementById("pinBox" + i).value = ""`
)

// Fix createPinV2 boxes from 4 to 6
code = code.replace(
  `[1,2,3,4].map(i => "<input id='newPinBox" + i + "' type='password' inputmode='numeric' maxlength='1' style='width:56px;height:64px;border-radius:14px;border:2px solid #E5E7EB;color:#1F2937;background:#fff;font-size:28px;font-weight:700;text-align:center;outline:none;box-sizing:border-box;' />").join("")`,
  `[1,2,3,4,5,6].map(i => "<input id='newPinBox" + i + "' type='password' inputmode='numeric' maxlength='1' style='width:44px;height:54px;border-radius:12px;border:2px solid #E5E7EB;color:#1F2937;background:#fff;font-size:24px;font-weight:700;text-align:center;outline:none;box-sizing:border-box;' />").join("")`
)

code = code.replace(
  `[1,2,3,4].map(i => "<input id='confirmPinBox" + i + "' type='password' inputmode='numeric' maxlength='1' style='width:56px;height:64px;border-radius:14px;border:2px solid #E5E7EB;color:#1F2937;background:#fff;font-size:28px;font-weight:700;text-align:center;outline:none;box-sizing:border-box;' />").join("")`,
  `[1,2,3,4,5,6].map(i => "<input id='confirmPinBox" + i + "' type='password' inputmode='numeric' maxlength='1' style='width:44px;height:54px;border-radius:12px;border:2px solid #E5E7EB;color:#1F2937;background:#fff;font-size:24px;font-weight:700;text-align:center;outline:none;box-sizing:border-box;' />").join("")`
)

// Fix join from 4 to 6 in createPinV2
code = code.replace(
  `    const pin1 = [1,2,3,4].map(i => document.getElementById("newPinBox" + i).value).join("")
    const pin2 = [1,2,3,4].map(i => document.getElementById("confirmPinBox" + i).value).join("")`,
  `    const pin1 = [1,2,3,4,5,6].map(i => document.getElementById("newPinBox" + i).value).join("")
    const pin2 = [1,2,3,4,5,6].map(i => document.getElementById("confirmPinBox" + i).value).join("")`
)

// Fix length check from 4 to 6 in createPinV2
code = code.replace(
  `    if (pin1.length !== 4) { if (errEl) { errEl.textContent = "Please enter a 4-digit PIN"`,
  `    if (pin1.length !== 6) { if (errEl) { errEl.textContent = "Please enter a 6-digit PIN"`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("PIN changed to 6 digits")
