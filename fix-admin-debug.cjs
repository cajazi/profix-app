const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

// Find the admin check line
for (let i = 225; i < 235; i++) {
  if (lines[i] && lines[i].includes("supabase.from(\"profiles\").select(\"is_admin\")")) {
    lines[i] = lines[i].replace(
      "supabase.from(\"profiles\").select(\"is_admin\").eq(\"id\", user.id).single().then(function(r) {",
      "supabase.from(\"profiles\").select(\"is_admin\").eq(\"id\", user.id).single().then(function(r) { console.log(\"Admin check:\", r.data, r.error);"
    )
    console.log("Added debug on line", i+1)
    break
  }
}

fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
