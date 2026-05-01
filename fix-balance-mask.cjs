const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

// Fix 1: Wallet screen balance (line 1757) - add id and eye icon
c = c.replace(
  `"<p style='color:#FFFFFF;font-size:36px;font-weight:800;margin:0 0 16px;'>&#8358;" + balance.toLocaleString() + "</p>" +`,
  `"<div style='display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;'>" +
      "<p id='balanceDisplay' style='color:#FFFFFF;font-size:36px;font-weight:800;margin:0;'>&#8358;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;</p>" +
      "<button id='toggleBalance' data-visible='false' data-amount='" + balance + "' style='background:rgba(255,255,255,0.2);border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
        "<span style='font-size:18px;'>&#128065;</span>" +
      "</button>" +
    "</div>" +`
)

// Fix 2: Withdrawal screen balance (line 1842) - add id and eye icon
c = c.replace(
  `"<p style='color:#FFFFFF;font-size:26px;font-weight:800;margin:0;'>&#8358;" + balance.toLocaleString() + "</p>" +`,
  `"<div style='display:flex;align-items:center;gap:10px;'>" +
          "<p id='balanceDisplay2' style='color:#FFFFFF;font-size:26px;font-weight:800;margin:0;'>&#8358;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;</p>" +
          "<button id='toggleBalance2' data-visible='false' data-amount='" + balance + "' style='background:rgba(255,255,255,0.2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
            "<span style='font-size:16px;'>&#128065;</span>" +
          "</button>" +
        "</div>" +`
)

// Fix 3: Wire up toggle for wallet screen
c = c.replace(
  `  const withdrawBtn = document.getElementById("withdrawBtn")`,
  `  // Eye toggle for wallet balance
  var toggleBalBtn = document.getElementById("toggleBalance")
  if (toggleBalBtn) {
    toggleBalBtn.addEventListener("click", function() {
      var display = document.getElementById("balanceDisplay")
      var visible = toggleBalBtn.dataset.visible === "true"
      var amt = Number(toggleBalBtn.dataset.amount)
      if (visible) {
        display.innerHTML = "&#8358;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
        toggleBalBtn.dataset.visible = "false"
        toggleBalBtn.querySelector("span").innerHTML = "&#128065;"
      } else {
        display.innerHTML = "&#8358;" + amt.toLocaleString()
        toggleBalBtn.dataset.visible = "true"
        toggleBalBtn.querySelector("span").innerHTML = "&#128683;"
      }
    })
  }

  const withdrawBtn = document.getElementById("withdrawBtn")`
)

// Fix 4: Wire up toggle for withdrawal screen
c = c.replace(
  `  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.getElementById("submitWithdrawBtn").addEventListener("click", async () => {`,
  `  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  // Eye toggle for withdrawal balance
  var toggleBal2 = document.getElementById("toggleBalance2")
  if (toggleBal2) {
    toggleBal2.addEventListener("click", function() {
      var display = document.getElementById("balanceDisplay2")
      var visible = toggleBal2.dataset.visible === "true"
      var amt = Number(toggleBal2.dataset.amount)
      if (visible) {
        display.innerHTML = "&#8358;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
        toggleBal2.dataset.visible = "false"
        toggleBal2.querySelector("span").innerHTML = "&#128065;"
      } else {
        display.innerHTML = "&#8358;" + amt.toLocaleString()
        toggleBal2.dataset.visible = "true"
        toggleBal2.querySelector("span").innerHTML = "&#128683;"
      }
    })
  }

  document.getElementById("submitWithdrawBtn").addEventListener("click", async () => {`
)

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
