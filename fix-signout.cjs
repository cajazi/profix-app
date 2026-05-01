const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Replace all sign out handlers to use soft logout (keep supabase session, just require PIN)
c = c.replace(
  /await supabase\.auth\.signOut\(\)\s*;\s*(?:currentEmail\s*=\s*""\s*;\s*)?(?:currentUser\s*=\s*null\s*;\s*)?(?:ne\s*=\s*""\s*,\s*Z\s*=\s*null\s*,\s*)?showLogin\(\)/g,
  'sessionStorage.removeItem("profix_pin_ok"); currentEmail = ""; currentUser = null; showLogin()'
)

// Also fix menu sign out buttons specifically
c = c.replace(
  /closeMenu\(\);\s*await supabase\.auth\.signOut\(\);\s*currentEmail\s*=\s*"";\s*currentUser\s*=\s*null;\s*showLogin\(\)/g,
  'closeMenu(); sessionStorage.removeItem("profix_pin_ok"); currentEmail = ""; currentUser = null; showLogin()'
)

// Fix profile page sign out
c = c.replace(
  /await supabase\.auth\.signOut\(\);\s*currentEmail\s*=\s*"";\s*currentUser\s*=\s*null;\s*showLogin\(\)/g,
  'sessionStorage.removeItem("profix_pin_ok"); currentEmail = ""; currentUser = null; showLogin()'
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
