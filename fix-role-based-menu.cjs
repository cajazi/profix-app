const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Change the static menu item to be dynamic based on role
code = code.replace(
  `"<button id='menuFindWorkersBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128269;</span><span style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>Find Workers</span>" +
        "</button>" +`,
  `"<button id='menuFindWorkersBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
          "<span style='font-size:20px;'>&#128269;</span><span id='menuFindWorkersLabel' style='color:#fff;font-size:14px;font-weight:500;text-align:left;'>Find Workers</span>" +
        "</button>" +`
)

// Update the wire-up to check role and update label
code = code.replace(
  `  document.getElementById("menuFindWorkersBtn").addEventListener("click", () => { closeMenu(); showWorkerDiscovery(user) })`,
  `  supabase.from("profiles").select("role").eq("id", user.id).single().then(function(res) {
    const role = res.data?.role || "owner"
    const label = document.getElementById("menuFindWorkersLabel")
    if (label) label.textContent = role === "worker" ? "Find Work" : "Find Workers"
    document.getElementById("menuFindWorkersBtn").addEventListener("click", () => {
      closeMenu()
      if (role === "worker") showBrowseJobs(user)
      else showWorkerDiscovery(user)
    })
  })`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Role-based menu item fixed")
