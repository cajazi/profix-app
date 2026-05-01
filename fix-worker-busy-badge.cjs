const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Remove the filter that hides busy workers
c = c.replace(
  `  allWorkers = (data || []).filter(w => !busyWorkerIds.includes(w.id))
  console.log("Final workers:", allWorkers.map(w => w.email))`,
  `  allWorkers = (data || []).map(w => ({ ...w, isBusy: busyWorkerIds.includes(w.id) }))`
)

// Add Busy badge and disable Hire Now button for busy workers
c = c.replace(
  `"<div style='display:flex;align-items:center;gap:6px;margin-bottom:2px;'>" +
                "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (w.full_name||"ProFix Worker") + "</p>" +
                "<span style='background:rgba(0,194,89,0.10);color:var(--primary);font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;flex-shrink:0;'>&#10003; KYC</span>" +
              "</div>"`,
  `"<div style='display:flex;align-items:center;gap:6px;margin-bottom:2px;'>" +
                "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (w.full_name||"ProFix Worker") + "</p>" +
                "<span style='background:rgba(0,194,89,0.10);color:var(--primary);font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;flex-shrink:0;'>&#10003; KYC</span>" +
                (w.isBusy ? "<span style='background:rgba(245,158,11,0.12);color:#F59E0B;font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;flex-shrink:0;'>&#128336; Busy</span>" : "") +
              "</div>"`
)

// Disable Hire Now button for busy workers
c = c.replace(
  `"<button class='hireBtn' data-id='" + w.id + "' style='background:var(--primary);color:#FFFFFF;font-size:13px;font-weight:700;padding:9px 18px;border:none;border-radius:10px;cursor:pointer;flex-shrink:0;min-height:38px;box-shadow:var(--shadow-green);'>Hire Now</button>"`,
  `(w.isBusy
            ? "<button class='hireBtn' data-id='" + w.id + "' disabled style='background:var(--border);color:var(--text-muted);font-size:13px;font-weight:700;padding:9px 18px;border:none;border-radius:10px;cursor:not-allowed;flex-shrink:0;min-height:38px;'>Unavailable</button>"
            : "<button class='hireBtn' data-id='" + w.id + "' style='background:var(--primary);color:#FFFFFF;font-size:13px;font-weight:700;padding:9px 18px;border:none;border-radius:10px;cursor:pointer;flex-shrink:0;min-height:38px;box-shadow:var(--shadow-green);'>Hire Now</button>")`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
