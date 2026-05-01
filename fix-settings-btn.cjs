const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

c = c.replace(
  `"<div id='adminBtnSlot'></div>" +`,
  `"<div id='adminBtnSlot'></div>" +
        "<button id='menuSettingsBtn' style='width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;width:24px;text-align:center;'>&#9881;</span>" +
          "<span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>Settings</span>" +
        "</button>" +`
)

if (c.includes("menuSettingsBtn' style")) {
  console.log("Settings button added to drawer HTML")
} else {
  console.log("ERROR: pattern not found")
}

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
