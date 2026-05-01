const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const fn = `
async function loadRecentJobs(user) {
  const { data: jobs } = await supabase.from("jobs").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(5)
  if (!jobs || jobs.length === 0) return
  const countEl = document.getElementById("activeJobsCount")
  if (countEl) countEl.textContent = jobs.filter(j => j.status === "open").length
  const container = document.getElementById("recentJobs")
  if (!container) return
  let html = ""
  jobs.forEach(function(job) {
    const date = new Date(job.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
    const statusColor = job.status === "open" ? "#34d399" : job.status === "in_progress" ? "#818cf8" : "#6b7280"
    html += "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;' onclick='void(0)'>" +
      "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;'>" +
        "<p style='color:#fff;font-size:14px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%;'>" + job.title + "</p>" +
        "<span style='color:" + statusColor + ";font-size:11px;font-weight:700;'>" + job.status.toUpperCase() + "</span>" +
      "</div>" +
      "<p style='color:#9CA3AF;font-size:12px;margin:0;'>" + (job.location || "Remote") + " • " + date + "</p>" +
    "</div>"
  })
  container.innerHTML = html
}
`

// Add before showBrowseJobs
code = code.replace(
  "async function showBrowseJobs(user) {",
  fn + "\nasync function showBrowseJobs(user) {"
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("loadRecentJobs added")
