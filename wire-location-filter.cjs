const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Add locationTerm variable
code = code.replace(
  `  let selectedSkill = "All"
  let searchTerm = ""
  let allWorkers = []`,
  `  let selectedSkill = "All"
  let searchTerm = ""
  let locationTerm = ""
  let allWorkers = []`
)

// Add location filter event listener
code = code.replace(
  `  document.getElementById("workerSearch").addEventListener("input", function(e) {
    searchTerm = e.target.value.toLowerCase().trim()
    renderWorkers()
  })`,
  `  document.getElementById("workerSearch").addEventListener("input", function(e) {
    searchTerm = e.target.value.toLowerCase().trim()
    renderWorkers()
  })

  document.getElementById("locationFilter").addEventListener("input", function(e) {
    locationTerm = e.target.value.toLowerCase().trim()
    renderWorkers()
  })`
)

// Add location filter to renderWorkers
code = code.replace(
  `    if (searchTerm) {
      filtered = filtered.filter(function(w) {
        return (w.full_name||"").toLowerCase().includes(searchTerm) ||
               (w.email||"").toLowerCase().includes(searchTerm) ||
               (w.bio||"").toLowerCase().includes(searchTerm) ||
               (w.skills||[]).some(function(s) { return s.toLowerCase().includes(searchTerm) })
      })
    }`,
  `    if (searchTerm) {
      filtered = filtered.filter(function(w) {
        return (w.full_name||"").toLowerCase().includes(searchTerm) ||
               (w.email||"").toLowerCase().includes(searchTerm) ||
               (w.bio||"").toLowerCase().includes(searchTerm) ||
               (w.skills||[]).some(function(s) { return s.toLowerCase().includes(searchTerm) })
      })
    }

    if (locationTerm) {
      filtered = filtered.filter(function(w) {
        return (w.location||"").toLowerCase().includes(locationTerm)
      })
    }`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Location filter logic added")
