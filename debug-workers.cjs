const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")
code = code.replace(
  `const { data: workers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "worker")
    .eq("is_verified", true)
    .order("rating", { ascending: false })`,
  `const { data: workers, error: wErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "worker")
    .eq("is_verified", true)
    .order("rating", { ascending: false })
  console.log("Workers query result:", workers, "Error:", wErr)`
)
fs.writeFileSync("src/main.js", code, "utf8")
console.log("Debug added")
