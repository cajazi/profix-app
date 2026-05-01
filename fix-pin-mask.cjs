const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

// ── LOGIN PIN inputs (3 occurrences) - 6 digit ──────────────────
// Change type tel to password and wrap with eye button
const OLD_PIN_INPUT = `"<input id='pinInput' type='tel' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px;border-radius:12px;border:2px solid #e5e7eb;color:var(--text-primary);background:var(--bg-input);font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
      "<p id='pinErr'`

const NEW_PIN_INPUT = `"<div style='position:relative;width:100%;margin-bottom:0;'>" +
        "<input id='pinInput' type='password' inputmode='numeric' maxlength='6' placeholder='------' style='width:100%;padding:15px 50px 15px 15px;border-radius:12px;border:2px solid #e5e7eb;color:var(--text-primary);background:var(--bg-input);font-size:26px;text-align:center;letter-spacing:10px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
        "<button id='pinEyeBtn' type='button' style='position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-muted);padding:4px;'>&#128065;</button>" +
      "</div>" +
      "<p id='pinErr'`

// Replace all 3 occurrences
let count = 0
while (c.includes(OLD_PIN_INPUT)) {
  c = c.replace(OLD_PIN_INPUT, NEW_PIN_INPUT)
  count++
}
console.log("PIN inputs replaced:", count)

// ── Wire eye toggle after each inp.focus() for login pins ────────
const OLD_INP_FOCUS = `  const inp = document.getElementById("pinInput")
  inp.focus()
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/D/g,"").slice(0,6) })`

const NEW_INP_FOCUS = `  const inp = document.getElementById("pinInput")
  inp.focus()
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/D/g,"").slice(0,6) })
  var pinEye = document.getElementById("pinEyeBtn")
  if (pinEye) {
    pinEye.addEventListener("click", function() {
      if (inp.type === "password") { inp.type = "tel"; pinEye.innerHTML = "&#128683;" }
      else { inp.type = "password"; pinEye.innerHTML = "&#128065;" }
    })
  }`

count = 0
while (c.includes(OLD_INP_FOCUS)) {
  c = c.replace(OLD_INP_FOCUS, NEW_INP_FOCUS)
  count++
}
console.log("Login PIN eye wired:", count)

// ── Also fix the other inp.focus() without input listener (pinLogin) ─
const OLD_INP_FOCUS2 = `  const inp = document.getElementById("pinInput")
  inp.focus()
  inp.addEventListener("keydown"`

const NEW_INP_FOCUS2 = `  const inp = document.getElementById("pinInput")
  inp.focus()
  var pinEye = document.getElementById("pinEyeBtn")
  if (pinEye) {
    pinEye.addEventListener("click", function() {
      if (inp.type === "password") { inp.type = "tel"; pinEye.innerHTML = "&#128683;" }
      else { inp.type = "password"; pinEye.innerHTML = "&#128065;" }
    })
  }
  inp.addEventListener("keydown"`

count = 0
while (c.includes(OLD_INP_FOCUS2)) {
  c = c.replace(OLD_INP_FOCUS2, NEW_INP_FOCUS2)
  count++
}
console.log("PinLogin eye wired:", count)

// ── WITHDRAWAL PIN inputs (2 occurrences) - 4 digit ─────────────
const OLD_WPIN = `"<input id='wpinInput' type='tel' inputmode='numeric' maxlength='4' placeholder='----' style='width:100%;padding:16px;border-radius:12px;border:2px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:32px;text-align:center;letter-spacing:16px;font-family:monospace;outline:none;box-sizing:border-box;margin-bottom:8px;' />"`

const NEW_WPIN = `"<div style='position:relative;width:100%;margin-bottom:8px;'>" +
        "<input id='wpinInput' type='password' inputmode='numeric' maxlength='4' placeholder='----' style='width:100%;padding:16px 50px 16px 16px;border-radius:12px;border:2px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:32px;text-align:center;letter-spacing:16px;font-family:monospace;outline:none;box-sizing:border-box;' />" +
        "<button id='wpinEyeBtn' type='button' style='position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-muted);padding:4px;'>&#128065;</button>" +
      "</div>"`

count = 0
while (c.includes(OLD_WPIN)) {
  c = c.replace(OLD_WPIN, NEW_WPIN)
  count++
}
console.log("WPIN inputs replaced:", count)

// ── Wire eye toggle for withdrawal PIN ───────────────────────────
const OLD_WPIN_FOCUS = `  const inp = document.getElementById("wpinInput")
  inp.focus()
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/\\D/g,"").slice(0,4) })`

const NEW_WPIN_FOCUS = `  const inp = document.getElementById("wpinInput")
  inp.focus()
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/\\D/g,"").slice(0,4) })
  var wpinEye = document.getElementById("wpinEyeBtn")
  if (wpinEye) {
    wpinEye.addEventListener("click", function() {
      if (inp.type === "password") { inp.type = "tel"; wpinEye.innerHTML = "&#128683;" }
      else { inp.type = "password"; wpinEye.innerHTML = "&#128065;" }
    })
  }`

count = 0
while (c.includes(OLD_WPIN_FOCUS)) {
  c = c.replace(OLD_WPIN_FOCUS, NEW_WPIN_FOCUS)
  count++
}
console.log("WPIN eye wired:", count)

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
