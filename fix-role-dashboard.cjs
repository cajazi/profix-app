const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Load profile role and adjust dashboard menu
c = c.replace(
  `  document.getElementById("menuFindWorkersBtn").addEventListener("click", () => { closeMenu(); showWorkerDiscovery(user) })`,
  `  // Show/hide menu items based on role
  supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data: prof }) => {
    const isWorker = prof?.role === "worker"
    const findWorkersBtn = document.getElementById("menuFindWorkersBtn")
    if (findWorkersBtn) findWorkersBtn.style.display = isWorker ? "none" : "flex"
    const postJobBtn = document.getElementById("postJobBtn")
    const myJobsBtn  = document.getElementById("myJobsBtn")
    if (isWorker) {
      if (postJobBtn) postJobBtn.style.display = "none"
      if (myJobsBtn)  myJobsBtn.style.display  = "none"
    }
  })
  document.getElementById("menuFindWorkersBtn").addEventListener("click", () => { closeMenu(); showWorkerDiscovery(user) })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
