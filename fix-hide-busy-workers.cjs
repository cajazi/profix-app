const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `  const { data, error } = await supabase.from("profiles").select("*").eq("role","worker").eq("is_verified",true).neq("id", user.id).order("rating", { ascending: false })
  allWorkers = data || []`,
  `  const { data, error } = await supabase.from("profiles").select("*").eq("role","worker").eq("is_verified",true).neq("id", user.id).order("rating", { ascending: false })
  // Get workers with active contracts
  const { data: activeContracts } = await supabase.from("contracts").select("worker_id").eq("status","active")
  const busyWorkerIds = (activeContracts || []).map(c => c.worker_id)
  allWorkers = (data || []).filter(w => !busyWorkerIds.includes(w.id))`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
