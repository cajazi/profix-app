const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Remove ALL existing admin functions
const adminFns = ['showAdminPanel', 'loadAdminStats', 'loadAdminTab']
adminFns.forEach(fn => {
  let idx = c.indexOf(`async function ${fn}`)
  if (idx < 0) idx = c.indexOf(`function ${fn}`)
  if (idx < 0) return
  // Find end of function by next top-level function
  const endings = ['async function show', 'async function load', 'async function boot', 'function show', 'function load']
  let end = -1
  endings.forEach(e => {
    const pos = c.indexOf('\n' + e, idx + 10)
    if (pos > 0 && (end < 0 || pos < end)) end = pos
  })
  if (end > 0) {
    c = c.slice(0, idx) + c.slice(end + 1)
    console.log('Removed:', fn)
  }
})

// Clean admin code - no inline onclick, no quote issues
const ADMIN = `
async function showAdminPanel() {
  pushScreen("admin", () => showAdminPanel())
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Admin Panel") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;'>" +
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center;'><p style='color:var(--text-muted);font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Users</p><p id='statUsers' style='color:var(--text-primary);font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center;'><p style='color:#F59E0B;font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Pending KYC</p><p id='statKyc' style='color:#F59E0B;font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center;'><p style='color:var(--primary);font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Jobs</p><p id='statJobs' style='color:var(--primary);font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;text-align:center;'><p style='color:var(--primary);font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Withdrawals</p><p id='statWithdrawals' style='color:var(--primary);font-size:24px;font-weight:700;margin:0;'>-</p></div>" +
      "</div>" +
      "<div id='adminTabs' style='display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px;'>" +
        "<button class='aTab' data-tab='kyc' style='padding:8px 16px;border-radius:20px;border:1.5px solid var(--primary);background:var(--primary);color:#FFFFFF;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;'>KYC Review</button>" +
        "<button class='aTab' data-tab='users' style='padding:8px 16px;border-radius:20px;border:1.5px solid var(--border);background:transparent;color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;'>All Users</button>" +
        "<button class='aTab' data-tab='jobs' style='padding:8px 16px;border-radius:20px;border:1.5px solid var(--border);background:transparent;color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;'>All Jobs</button>" +
        "<button class='aTab' data-tab='withdrawals' style='padding:8px 16px;border-radius:20px;border:1.5px solid var(--border);background:transparent;color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;'>Withdrawals</button>" +
      "</div>" +
      "<div id='adminContent'></div>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.querySelectorAll(".aTab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".aTab").forEach(b => {
        b.style.background = "transparent"
        b.style.borderColor = "var(--border)"
        b.style.color = "var(--text-secondary)"
      })
      btn.style.background = "var(--primary)"
      btn.style.borderColor = "var(--primary)"
      btn.style.color = "#FFFFFF"
      loadAdminTab(btn.dataset.tab)
    })
  })

  await loadAdminStats()
  await loadAdminTab("kyc")
}

async function loadAdminStats() {
  const [u, k, j, w] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("kyc_submitted", true).eq("is_verified", false),
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending")
  ])
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? "-" }
  set("statUsers", u.count)
  set("statKyc", k.count)
  set("statJobs", j.count)
  set("statWithdrawals", w.count)
}

async function loadAdminTab(tab) {
  const box = document.getElementById("adminContent")
  if (!box) return
  box.innerHTML = "<div style='text-align:center;padding:40px 0;'><div style='width:36px;height:36px;border:3px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;'></div><p style='color:var(--text-muted);font-size:13px;'>Loading...</p></div>"

  if (tab === "kyc") {
    const { data } = await supabase.from("profiles").select("*").eq("kyc_submitted", true).eq("is_verified", false).order("updated_at", { ascending: true })
    if (!data || data.length === 0) {
      box.innerHTML = "<div style='text-align:center;padding:48px 16px;'><span style='font-size:48px;'>&#10003;</span><p style='color:var(--text-primary);font-size:16px;font-weight:600;margin:16px 0 6px;'>All caught up!</p><p style='color:var(--text-muted);font-size:13px;'>No pending KYC reviews.</p></div>"
      return
    }
    let html = "<p style='color:var(--text-muted);font-size:13px;margin:0 0 14px;'>" + data.length + " pending</p>"
    data.forEach(u => {
      const init = (u.full_name||u.email||"U")[0].toUpperCase()
      html += "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px;'>"
      html += "<div style='display:flex;align-items:center;gap:12px;margin-bottom:14px;'>"
      html += "<div style='width:44px;height:44px;background:var(--primary);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:17px;flex-shrink:0;'>" + init + "</div>"
      html += "<div style='flex:1;min-width:0;'><p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (u.full_name||"No name") + "</p>"
      html += "<p style='color:var(--text-secondary);font-size:12px;margin:0 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (u.email||"") + "</p>"
      html += "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid var(--border);'>" + (u.role||"worker") + "</span></div></div>"
      if (u.kyc_id_url) {
        html += "<div style='margin-bottom:12px;'><p style='color:var(--text-muted);font-size:11px;font-weight:600;margin:0 0 8px;text-transform:uppercase;'>Government ID</p>"
        html += "<img src='" + u.kyc_id_url + "' data-url='" + u.kyc_id_url + "' class='kycImg' style='width:100%;max-height:200px;object-fit:contain;border-radius:10px;border:1px solid var(--border);cursor:pointer;' /></div>"
      }
      if (u.kyc_selfie_url) {
        html += "<div style='margin-bottom:14px;'><p style='color:var(--text-muted);font-size:11px;font-weight:600;margin:0 0 8px;text-transform:uppercase;'>Selfie</p>"
        html += "<img src='" + u.kyc_selfie_url + "' data-url='" + u.kyc_selfie_url + "' class='kycImg' style='width:100%;max-height:200px;object-fit:contain;border-radius:10px;border:1px solid var(--border);cursor:pointer;' /></div>"
      }
      html += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;'>"
      html += "<button class='rejectKycBtn' data-id='" + u.id + "' data-email='" + (u.email||"") + "' style='padding:11px;background:rgba(224,49,49,0.07);color:var(--danger);font-size:13px;font-weight:600;border:1.5px solid rgba(224,49,49,0.2);border-radius:10px;cursor:pointer;'>&#10005; Reject</button>"
      html += "<button class='approveKycBtn' data-id='" + u.id + "' data-email='" + (u.email||"") + "' style='padding:11px;background:var(--primary);color:#FFFFFF;font-size:13px;font-weight:600;border:none;border-radius:10px;cursor:pointer;'>&#10003; Approve</button>"
      html += "</div></div>"
    })
    box.innerHTML = html
    box.querySelectorAll(".kycImg").forEach(img => img.addEventListener("click", () => window.open(img.dataset.url, "_blank")))
    box.querySelectorAll(".approveKycBtn").forEach(btn => btn.addEventListener("click", async () => {
      if (!confirm("Approve KYC for " + btn.dataset.email + "?")) return
      btn.disabled = true; btn.textContent = "Approving..."
      await supabase.from("profiles").update({ is_verified: true, updated_at: new Date().toISOString() }).eq("id", btn.dataset.id)
      await supabase.from("notifications").insert({ user_id: btn.dataset.id, title: "KYC Approved!", body: "Your identity has been verified. You can now post or accept jobs.", type: "kyc_approved", data: {} })
      await loadAdminStats(); await loadAdminTab("kyc")
    }))
    box.querySelectorAll(".rejectKycBtn").forEach(btn => btn.addEventListener("click", async () => {
      const reason = prompt("Reason for rejection:")
      if (!reason) return
      btn.disabled = true; btn.textContent = "Rejecting..."
      await supabase.from("profiles").update({ kyc_submitted: false, updated_at: new Date().toISOString() }).eq("id", btn.dataset.id)
      await supabase.from("notifications").insert({ user_id: btn.dataset.id, title: "KYC Rejected", body: "Your documents were rejected: " + reason + ". Please resubmit.", type: "kyc_rejected", data: {} })
      await loadAdminStats(); await loadAdminTab("kyc")
    }))

  } else if (tab === "users") {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50)
    if (!data || data.length === 0) { box.innerHTML = "<p style='color:var(--text-muted);text-align:center;padding:40px 0;'>No users found</p>"; return }
    let html = "<p style='color:var(--text-muted);font-size:13px;margin:0 0 14px;'>" + data.length + " users</p>"
    data.forEach(u => {
      const init = (u.full_name||u.email||"U")[0].toUpperCase()
      html += "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;'>"
      html += "<div style='width:40px;height:40px;background:" + (u.is_admin?"#F59E0B":"var(--primary)") + ";border-radius:12px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:16px;flex-shrink:0;'>" + init + "</div>"
      html += "<div style='flex:1;min-width:0;'><p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (u.full_name||"No name") + "</p>"
      html += "<p style='color:var(--text-secondary);font-size:12px;margin:0 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (u.email||"") + "</p>"
      html += "<div style='display:flex;gap:5px;flex-wrap:wrap;'>"
      html += "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;border:1px solid var(--border);'>" + (u.role||"worker") + "</span>"
      if (u.is_verified) html += "<span style='background:rgba(0,194,89,0.10);color:var(--primary);font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;'>&#10003; Verified</span>"
      if (u.kyc_submitted && !u.is_verified) html += "<span style='background:rgba(245,158,11,0.10);color:#F59E0B;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;'>Pending KYC</span>"
      html += "</div></div>"
      html += "<div style='display:flex;flex-direction:column;gap:5px;flex-shrink:0;'>"
      html += "<button class='banBtn' data-id='" + u.id + "' data-email='" + (u.email||"") + "' style='padding:6px 10px;background:rgba(224,49,49,0.08);color:var(--danger);font-size:11px;font-weight:600;border:1.5px solid rgba(224,49,49,0.15);border-radius:8px;cursor:pointer;'>Ban</button>"
      if (u.kyc_submitted && !u.is_verified) html += "<button class='qaBtn' data-id='" + u.id + "' style='padding:6px 10px;background:var(--primary);color:#FFFFFF;font-size:11px;font-weight:600;border:none;border-radius:8px;cursor:pointer;'>Approve</button>"
      html += "</div></div>"
    })
    box.innerHTML = html
    box.querySelectorAll(".banBtn").forEach(btn => btn.addEventListener("click", async () => {
      if (!confirm("Ban " + btn.dataset.email + "?")) return
      await supabase.from("profiles").update({ is_verified: false, kyc_submitted: false }).eq("id", btn.dataset.id)
      await loadAdminTab("users")
    }))
    box.querySelectorAll(".qaBtn").forEach(btn => btn.addEventListener("click", async () => {
      btn.disabled = true
      await supabase.from("profiles").update({ is_verified: true }).eq("id", btn.dataset.id)
      await supabase.from("notifications").insert({ user_id: btn.dataset.id, title: "KYC Approved!", body: "Your identity has been verified.", type: "kyc_approved", data: {} })
      await loadAdminStats(); await loadAdminTab("users")
    }))

  } else if (tab === "jobs") {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(50)
    if (!data || data.length === 0) { box.innerHTML = "<p style='color:var(--text-muted);text-align:center;padding:40px 0;'>No jobs found</p>"; return }
    let html = "<p style='color:var(--text-muted);font-size:13px;margin:0 0 14px;'>" + data.length + " jobs</p>"
    data.forEach(job => {
      html += "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;'>"
      html += "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;'>"
      html += "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 9px;border-radius:20px;border:1px solid var(--border);'>" + (job.category||"General") + "</span>"
      html += "<span style='color:" + (job.status==="open"?"var(--primary)":"var(--text-muted)") + ";font-size:11px;font-weight:700;'>" + (job.status||"open").toUpperCase() + "</span>"
      html += "</div>"
      html += "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 4px;'>" + escapeHtml(job.title) + "</p>"
      html += "<p style='color:var(--text-secondary);font-size:12px;margin:0 0 10px;'>By: " + (job.owner_email||"Unknown") + "</p>"
      html += "<button class='rmJobBtn' data-id='" + job.id + "' style='width:100%;padding:8px;background:rgba(224,49,49,0.07);color:var(--danger);font-size:12px;font-weight:600;border:1.5px solid rgba(224,49,49,0.15);border-radius:8px;cursor:pointer;'>Remove Job</button>"
      html += "</div>"
    })
    box.innerHTML = html
    box.querySelectorAll(".rmJobBtn").forEach(btn => btn.addEventListener("click", async () => {
      if (!confirm("Remove this job?")) return
      btn.disabled = true; btn.textContent = "Removing..."
      await supabase.from("jobs").delete().eq("id", btn.dataset.id)
      await loadAdminStats(); await loadAdminTab("jobs")
    }))

  } else if (tab === "withdrawals") {
    const { data } = await supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false }).limit(50)
    if (!data || data.length === 0) {
      box.innerHTML = "<div style='text-align:center;padding:48px 16px;'><span style='font-size:48px;'>&#128184;</span><p style='color:var(--text-primary);font-size:16px;font-weight:600;margin:16px 0 6px;'>No withdrawal requests</p></div>"
      return
    }
    let html = "<p style='color:var(--text-muted);font-size:13px;margin:0 0 14px;'>" + data.length + " request" + (data.length===1?"":"s") + "</p>"
    data.forEach(w => {
      const sc = w.status==="approved" ? "var(--primary)" : w.status==="rejected" ? "var(--danger)" : "#F59E0B"
      const dt = new Date(w.created_at).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })
      html += "<div style='background:var(--bg-card);border:1.5px solid " + (w.status==="pending"?"#F59E0B":"var(--border)") + ";border-radius:16px;padding:16px;margin-bottom:12px;'>"
      html += "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;'>"
      html += "<p style='color:var(--text-primary);font-size:16px;font-weight:800;margin:0;'>&#8358;" + Number(w.amount).toLocaleString() + "</p>"
      html += "<span style='color:" + sc + ";font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:" + sc + "22;'>" + w.status.toUpperCase() + "</span>"
      html += "</div>"
      html += "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 3px;'>Bank: " + escapeHtml(w.bank_name||"N/A") + "</p>"
      html += "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 3px;'>Account: " + escapeHtml(w.account_number||"N/A") + "</p>"
      html += "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 10px;'>Name: " + escapeHtml(w.account_name||"N/A") + "</p>"
      html += "<p style='color:var(--text-muted);font-size:11px;margin:0 0 10px;'>" + dt + "</p>"
      if (w.status === "pending") {
        html += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;'>"
        html += "<button class='rejectWBtn' data-id='" + w.id + "' data-uid='" + w.user_id + "' data-amt='" + w.amount + "' style='padding:10px;background:rgba(224,49,49,0.07);color:var(--danger);font-size:12px;font-weight:600;border:1.5px solid rgba(224,49,49,0.2);border-radius:10px;cursor:pointer;'>Reject</button>"
        html += "<button class='approveWBtn' data-id='" + w.id + "' data-uid='" + w.user_id + "' data-amt='" + w.amount + "' style='padding:10px;background:var(--primary);color:#FFFFFF;font-size:12px;font-weight:600;border:none;border-radius:10px;cursor:pointer;'>&#10003; Approve</button>"
        html += "</div>"
      }
      html += "</div>"
    })
    box.innerHTML = html

    box.querySelectorAll(".approveWBtn").forEach(btn => btn.addEventListener("click", async () => {
      const amt = Number(btn.dataset.amt)
      if (!confirm("Approve withdrawal of NGN " + amt.toLocaleString() + "? Confirm you have sent the money to their bank.")) return
      btn.disabled = true; btn.textContent = "Approving..."
      await supabase.from("withdrawal_requests").update({ status: "approved", processed_at: new Date().toISOString() }).eq("id", btn.dataset.id)
      const { data: wlt } = await supabase.from("wallets").select("balance,total_withdrawn").eq("user_id", btn.dataset.uid).single()
      if (wlt) {
        await supabase.from("wallets").update({
          balance: Math.max(0, Number(wlt.balance) - amt),
          total_withdrawn: Number(wlt.total_withdrawn) + amt,
          updated_at: new Date().toISOString()
        }).eq("user_id", btn.dataset.uid)
      }
      await supabase.from("wallet_transactions").insert({ user_id: btn.dataset.uid, type: "debit", amount: amt, description: "Withdrawal approved" })
      await supabase.from("notifications").insert({ user_id: btn.dataset.uid, title: "Withdrawal Approved!", body: "Your withdrawal of NGN " + amt.toLocaleString() + " has been sent to your bank.", type: "withdrawal_approved", data: {} })
      await loadAdminStats(); await loadAdminTab("withdrawals")
    }))

    box.querySelectorAll(".rejectWBtn").forEach(btn => btn.addEventListener("click", async () => {
      const reason = prompt("Reason for rejection:")
      if (!reason) return
      btn.disabled = true; btn.textContent = "Rejecting..."
      await supabase.from("withdrawal_requests").update({ status: "rejected", admin_note: reason, processed_at: new Date().toISOString() }).eq("id", btn.dataset.id)
      await supabase.from("notifications").insert({ user_id: btn.dataset.uid, title: "Withdrawal Rejected", body: "Your withdrawal was rejected: " + reason, type: "withdrawal_rejected", data: {} })
      await loadAdminStats(); await loadAdminTab("withdrawals")
    }))
  }
}
`

c = c.replace('\nasync function boot()', ADMIN + '\nasync function boot()')

// Wire up admin button in drawer
if (!c.includes('showAdminPanel()')) {
  c = c.replace(
    `document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`,
    `const adminEmails = ["cossybest24@gmail.com","cossyjay24@gmail.com","support@cosmas.dev"]
  if (adminEmails.includes(user.email)) {
    const aBtn = document.createElement("button")
    aBtn.style.cssText = "width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;"
    aBtn.innerHTML = "<span style='font-size:20px;'>&#128274;</span><span style='color:#F59E0B;font-size:14px;font-weight:600;'>Admin Panel</span>"
    aBtn.addEventListener("click", () => { closeMenu(); showAdminPanel() })
    const sOut = document.getElementById("menuSignOutBtn")
    if (sOut) sOut.parentNode.insertBefore(aBtn, sOut)
  }
  document.getElementById("menuSignOutBtn").addEventListener("click", async () => {`
  )
}

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Admin rebuilt. Lines:', c.split('\n').length)
