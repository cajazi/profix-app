const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

code = code.replace(
  `  } else {
    showLogin()
  }
}

boot()`,
  `  } else {
    showLoginV2()
  }
}

boot()`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Boot updated to use new login")
