const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `  const { data, error } = await supabase.from("profiles").select("*").eq("role","worker").eq("is_verified",true).order("rating", { ascending: false })`,
  `  const { data, error } = await supabase.from("profiles").select("*").eq("role","worker").eq("is_verified",true).neq("id", user.id).order("rating", { ascending: false })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
