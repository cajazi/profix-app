const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

code = code.replace(
  `const { data:reqs } = await supabase.from("withdrawal_requests").select("*, profiles!withdrawal_requests_user_id_fkey(full_name,email)").order("created_at",{ascending:false}).limit(50)`,
  `const { data:reqs, error:reqErr } = await supabase.from("withdrawal_requests").select("*").order("created_at",{ascending:false}).limit(50)
    console.log("Withdrawals:", reqs, reqErr)
    if (reqErr) { container.innerHTML="<p style='color:#f87171;text-align:center;'>Error: "+reqErr.message+"</p>"; return }`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Fixed withdrawals query")
