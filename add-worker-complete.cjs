const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Add Mark Complete button for worker in contract detail
c = c.replace(
  `      (contract.status === "active" && isOwner ?
        "<button id='confirmBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:52px;box-shadow:var(--shadow-green);'>&#10003; Confirm Job Complete &amp; Release Payment</button>" +
        "<button id='disputeBtn' style='width:100%;padding:13px;background:rgba(224,49,49,0.07);color:var(--danger);font-size:14px;font-weight:600;border:1.5px solid rgba(224,49,49,0.2);border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:48px;'>&#9888; Raise Dispute</button>"
      : "") +`,
  `      (contract.status === "active" && isOwner ?
        "<button id='confirmBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:52px;box-shadow:var(--shadow-green);'>&#10003; Confirm Job Complete &amp; Release Payment</button>" +
        "<button id='disputeBtn' style='width:100%;padding:13px;background:rgba(224,49,49,0.07);color:var(--danger);font-size:14px;font-weight:600;border:1.5px solid rgba(224,49,49,0.2);border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:48px;'>&#9888; Raise Dispute</button>"
      : "") +
      (contract.status === "active" && !isOwner ?
        "<div style='background:rgba(0,194,89,0.07);border:1px solid rgba(0,194,89,0.2);border-radius:14px;padding:14px;margin-bottom:10px;'>" +
          "<p style='color:var(--primary);font-size:13px;font-weight:600;margin:0 0 10px;'>&#128296; Worker Actions</p>" +
          "<button id='workerDoneBtn' style='width:100%;padding:13px;background:var(--primary);color:#FFFFFF;font-size:14px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:48px;box-shadow:var(--shadow-green);'>&#9989; Mark Job as Complete</button>" +
          "<p style='color:var(--text-muted);font-size:11px;margin:8px 0 0;text-align:center;'>This notifies the owner to confirm and release payment</p>" +
        "</div>"
      : "") +`
)

// Wire up worker done button
c = c.replace(
  `  const confirmBtn = document.getElementById("confirmBtn")`,
  `  const workerDoneBtn = document.getElementById("workerDoneBtn")
  if (workerDoneBtn) {
    workerDoneBtn.addEventListener("click", async () => {
      if (!confirm("Mark this job as complete? The owner will be notified to release payment.")) return
      workerDoneBtn.disabled = true
      workerDoneBtn.textContent = "Notifying owner..."
      await supabase.from("notifications").insert({
        user_id: contract.owner_id,
        title: "Job Completed!",
        body: "Worker has marked '" + contract.job_title + "' as complete. Please confirm to release payment.",
        type: "job_completed",
        data: { contract_id: contract.id }
      })
      await supabase.from("contracts").update({ worker_marked_done: true }).eq("id", contract.id)
      workerDoneBtn.textContent = "&#10003; Owner Notified"
      workerDoneBtn.style.background = "var(--border)"
      workerDoneBtn.style.color = "var(--text-muted)"
      alert("Owner has been notified to confirm and release payment.")
    })
  }
  const confirmBtn = document.getElementById("confirmBtn")`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
