const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `  const { data, error } = await supabase.from("profiles").select("*").eq("role","worker").eq("is_verified",true).neq("id", user.id).order("rating", { ascending: false })
  // Get workers with active contracts
  const { data: activeContracts } = await supabase.from("contracts").select("worker_id").eq("status","active")
  const busyWorkerIds = (activeContracts || []).map(c => c.worker_id)
  allWorkers = (data || []).filter(w => !busyWorkerIds.includes(w.id))`,
  `  const { data, error } = await supabase.from("profiles").select("*").eq("role","worker").eq("is_verified",true).neq("id", user.id).order("rating", { ascending: false })
  const { data: activeContracts } = await supabase.from("contracts").select("worker_id").eq("status","active")
  console.log("Active contracts:", activeContracts)
  const busyWorkerIds = (activeContracts || []).map(c => c.worker_id)
  console.log("Busy worker ids:", busyWorkerIds)
  allWorkers = (data || []).filter(w => !busyWorkerIds.includes(w.id))
  console.log("Final workers:", allWorkers.map(w => w.email))`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('done')
