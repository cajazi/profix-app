const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")
code = code.replace(
  'initNotifications(user)',
  'initNotifications(user)\n  initPushNotifications(user)'
)
fs.writeFileSync("src/main.js", code, "utf8")
console.log("Push notifications wired up")
