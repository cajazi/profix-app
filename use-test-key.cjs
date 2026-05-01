
const fs = require("fs")

let code = fs.readFileSync("src/main.js", "utf8")

code = code.replace(/pk_live_[a-zA-Z0-9]+/, "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713")

fs.writeFileSync("src/main.js", code, "utf8")

console.log("Switched to test key")

