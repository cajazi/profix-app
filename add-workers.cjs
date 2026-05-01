const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const WORKERS = `
// ── WORKER DISCOVERY ─────────────────────────────────────────────────────────

async function showWorkerDiscovery(user) {
  pushScreen("workers", () => showWorkerDiscovery(user))
  const skills = ["All","Plumbing","Electrical","Carpentry","Painting","Cleaning","Landscaping","Roofing","HVAC","Security","Tech","Building & Construction","Tiling & Flooring","Welding & Fabrication","Generator & Solar","AC Repair","Fumigation & Pest Control","Interior Design","Moving & Logistics","Catering & Events","Fashion & Tailoring","Photography","Tutoring"]
  let pillsHtml = ""
  skills.forEach((s, i) => {
    pillsHtml += "<button class='skillPill' data-skill='" + s + "' style='padding:7px 15px;border-radius:20px;border:1.5px solid " + (i===0?"var(--primary)":"var(--border)") + ";background:" + (i===0?"var(--primary)":"transparent") + ";color:" + (i===0?"#FFFFFF":"var(--text-secondary)") + ";font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;min-height:36px;'>" + s + "</button>"
  })

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Find Workers") +
    "<div style='flex:1;padding:14px 16px 32px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div style='position:relative;margin-bottom:12px;'>" +
        "<input id='workerSearch' type='text' placeholder='Search by name, skill or location...' style='width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-card);font-size:15px;outline:none;box-sizing:border-box;' />" +
      "</div>" +
      "<div style='overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:14px;padding-bottom:6px;scrollbar-width:none;'>" +
        "<div id='skillPillsRow' style='display:inline-flex;gap:7px;padding:2px 4px;'>" + pillsHtml + "</div>" +
      "</div>" +
      "<p id='workerCount' style='color:var(--text-muted);font-size:13px;margin:0 0 12px;'>Loading workers...</p>" +
      "<div id='workersList'>" +
        "<div style='text-align:center;padding:40px 0;'><div style='width:40px;height:40px;border:3px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div><p style='color:var(--text-muted);font-size:14px;margin:0;'>Loading workers...</p></div>" +
      "</div>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  let selectedSkill = "All", searchTerm = "", allWorkers = []

  const { data, error } = await supabase.from("profiles").select("*").eq("role","worker").eq("is_verified",true).order("rating", { ascending: false })
  allWorkers = data || []
  renderWorkers()

  document.getElementById("skillPillsRow").addEventListener("click", e => {
    const pill = e.target.closest(".skillPill")
    if (!pill) return
    selectedSkill = pill.dataset.skill
    document.querySelectorAll(".skillPill").forEach(p => {
      const active = p.dataset.skill === selectedSkill
      p.style.background = active ? "var(--primary)" : "transparent"
      p.style.borderColor = active ? "var(--primary)" : "var(--border)"
      p.style.color = active ? "#FFFFFF" : "var(--text-secondary)"
    })
    renderWorkers()
  })

  document.getElementById("workerSearch").addEventListener("input", e => {
    searchTerm = e.target.value.toLowerCase().trim()
    renderWorkers()
  })

  function renderWorkers() {
    let filtered = allWorkers
    if (selectedSkill !== "All") {
      filtered = filtered.filter(w => w.skills && w.skills.some(s => s.toLowerCase().includes(selectedSkill.toLowerCase())))
    }
    if (searchTerm) {
      filtered = filtered.filter(w =>
        (w.full_name||"").toLowerCase().includes(searchTerm) ||
        (w.email||"").toLowerCase().includes(searchTerm) ||
        (w.location||"").toLowerCase().includes(searchTerm) ||
        (w.skills||[]).some(s => s.toLowerCase().includes(searchTerm))
      )
    }

    const countEl = document.getElementById("workerCount")
    if (countEl) countEl.textContent = filtered.length === 0 ? "No workers found" : filtered.length + " verified worker" + (filtered.length === 1 ? "" : "s") + " available"

    const list = document.getElementById("workersList")
    if (!list) return

    if (filtered.length === 0) {
      list.innerHTML =
        "<div style='text-align:center;padding:60px 16px;'>" +
          "<div style='width:72px;height:72px;background:var(--bg-card-subtle);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid var(--border);'>" +
            "<span style='font-size:32px;'>&#128269;</span>" +
          "</div>" +
          "<p style='color:var(--text-primary);font-size:16px;font-weight:600;margin:0 0 6px;'>No workers found</p>" +
          "<p style='color:var(--text-muted);font-size:13px;margin:0;'>Try a different skill or search term</p>" +
        "</div>"
      return
    }

    let html = ""
    filtered.forEach(w => {
      const initial     = (w.full_name||w.email||"W")[0].toUpperCase()
      const rating      = Number(w.rating||0).toFixed(1)
      const reviewCount = w.total_reviews || 0
      const skills      = w.skills && w.skills.length > 0 ? w.skills.slice(0,3) : []

      html +=
        "<div class='workerCard' data-id='" + w.id + "' style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:12px;cursor:pointer;box-shadow:var(--shadow-sm);'>" +
          "<div style='display:flex;align-items:center;gap:14px;margin-bottom:12px;'>" +
            (w.avatar_url
              ? "<img src='" + w.avatar_url + "' style='width:52px;height:52px;border-radius:14px;object-fit:cover;border:2px solid var(--border-active);flex-shrink:0;' />"
              : "<div style='width:52px;height:52px;background:var(--primary);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:22px;flex-shrink:0;box-shadow:var(--shadow-green);'>" + initial + "</div>") +
            "<div style='flex:1;min-width:0;'>" +
              "<div style='display:flex;align-items:center;gap:6px;margin-bottom:2px;'>" +
                "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (w.full_name||"ProFix Worker") + "</p>" +
                "<span style='background:rgba(0,194,89,0.10);color:var(--primary);font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;flex-shrink:0;'>&#10003; KYC</span>" +
              "</div>" +
              "<p style='color:var(--text-secondary);font-size:12px;margin:0 0 4px;'>&#128205; " + (w.location||"Nigeria") + "</p>" +
              (reviewCount > 0
                ? "<p style='color:#F59E0B;font-size:13px;margin:0;'>&#11088; " + rating + " <span style='color:var(--text-muted);font-size:11px;'>(" + reviewCount + " review" + (reviewCount===1?"":"s") + ")</span></p>"
                : "<p style='color:var(--text-muted);font-size:12px;margin:0;'>New worker</p>") +
            "</div>" +
          "</div>" +
          (w.bio ? "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 10px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;'>" + w.bio + "</p>" : "") +
          "<div style='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;'>" +
            "<div style='display:flex;gap:5px;flex-wrap:wrap;'>" +
              skills.map(s => "<span style='background:var(--bg-card-subtle);color:var(--text-secondary);font-size:10px;font-weight:600;padding:3px 8px;border-radius:20px;border:1px solid var(--border);'>" + s + "</span>").join("") +
            "</div>" +
            "<button class='hireBtn' data-id='" + w.id + "' style='background:var(--primary);color:#FFFFFF;font-size:13px;font-weight:700;padding:9px 18px;border:none;border-radius:10px;cursor:pointer;flex-shrink:0;min-height:38px;box-shadow:var(--shadow-green);'>Hire Now</button>" +
          "</div>" +
        "</div>"
    })

    list.innerHTML = html

    list.querySelectorAll(".workerCard").forEach(card => {
      card.addEventListener("click", e => {
        if (e.target.closest(".hireBtn")) return
        const w = allWorkers.find(x => x.id === card.dataset.id)
        if (w) showWorkerProfile(user, w)
      })
    })

    list.querySelectorAll(".hireBtn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation()
        const w = allWorkers.find(x => x.id === btn.dataset.id)
        if (w) showHireWorker(user, w)
      })
    })
  }
}

function showWorkerProfile(user, worker) {
  pushScreen("workerProfile", () => showWorkerProfile(user, worker))
  const initial     = (worker.full_name||worker.email||"W")[0].toUpperCase()
  const rating      = Number(worker.rating||0).toFixed(1)
  const reviewCount = worker.total_reviews || 0

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Worker Profile") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      "<div style='text-align:center;margin-bottom:24px;'>" +
        (worker.avatar_url
          ? "<img src='" + worker.avatar_url + "' style='width:90px;height:90px;border-radius:22px;object-fit:cover;border:3px solid var(--primary);margin:0 auto 12px;display:block;' />"
          : "<div style='width:90px;height:90px;background:var(--primary);border-radius:22px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:36px;margin:0 auto 12px;box-shadow:var(--shadow-green);'>" + initial + "</div>") +
        "<h2 style='color:var(--text-primary);font-size:20px;font-weight:700;margin:0 0 4px;'>" + (worker.full_name||"ProFix Worker") + "</h2>" +
        "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 6px;'>&#128205; " + (worker.location||"Nigeria") + "</p>" +
        (reviewCount > 0
          ? "<p style='color:#F59E0B;font-size:15px;margin:0 0 8px;'>&#11088; " + rating + " <span style='color:var(--text-muted);font-size:12px;'>(" + reviewCount + " reviews)</span></p>"
          : "") +
        "<span style='background:rgba(0,194,89,0.10);color:var(--primary);font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1px solid rgba(0,194,89,0.25);'>&#10003; KYC Verified</span>" +
      "</div>" +

      (worker.bio
        ? "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:var(--shadow-sm);'>" +
            "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 8px;'>About</p>" +
            "<p style='color:var(--text-secondary);font-size:14px;margin:0;line-height:1.7;'>" + worker.bio + "</p>" +
          "</div>"
        : "") +

      (worker.skills && worker.skills.length > 0
        ? "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:var(--shadow-sm);'>" +
            "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 12px;'>Skills</p>" +
            "<div style='display:flex;flex-wrap:wrap;gap:8px;'>" +
              worker.skills.map(s => "<span style='background:var(--bg-card-subtle);color:var(--text-secondary);font-size:13px;font-weight:600;padding:6px 14px;border-radius:20px;border:1px solid var(--border);'>" + s + "</span>").join("") +
            "</div>" +
          "</div>"
        : "") +

      "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;'>" +
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:12px;padding:14px;text-align:center;box-shadow:var(--shadow-sm);'>" +
          "<p style='color:var(--text-muted);font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Rating</p>" +
          "<p style='color:#F59E0B;font-size:20px;font-weight:700;margin:0;'>" + (reviewCount > 0 ? rating : "New") + "</p>" +
        "</div>" +
        "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:12px;padding:14px;text-align:center;box-shadow:var(--shadow-sm);'>" +
          "<p style='color:var(--text-muted);font-size:11px;margin:0 0 4px;text-transform:uppercase;font-weight:600;'>Reviews</p>" +
          "<p style='color:var(--text-primary);font-size:20px;font-weight:700;margin:0;'>" + reviewCount + "</p>" +
        "</div>" +
      "</div>" +

      "<button id='hireWorkerBtn' style='width:100%;padding:15px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:52px;box-shadow:var(--shadow-green);'>Hire " + (worker.full_name||"This Worker") + "</button>" +
      "<button id='viewReviewsBtn' style='width:100%;padding:13px;background:var(--bg-card);color:var(--text-secondary);font-size:14px;font-weight:600;border:1.5px solid var(--border);border-radius:14px;cursor:pointer;min-height:48px;'>View Reviews</button>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.getElementById("hireWorkerBtn").addEventListener("click", () => showHireWorker(user, worker))
  document.getElementById("viewReviewsBtn").addEventListener("click", () => showUserReviews(worker.id, worker.full_name||"Worker"))
}

async function showHireWorker(user, worker) {
  pushScreen("hireWorker", () => showHireWorker(user, worker))
  const initial = (worker.full_name||worker.email||"W")[0].toUpperCase()

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Hire Worker") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      "<div style='display:flex;align-items:center;gap:14px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:20px;box-shadow:var(--shadow-sm);'>" +
        (worker.avatar_url
          ? "<img src='" + worker.avatar_url + "' style='width:50px;height:50px;border-radius:14px;object-fit:cover;border:2px solid var(--border-active);flex-shrink:0;' />"
          : "<div style='width:50px;height:50px;background:var(--primary);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:20px;flex-shrink:0;'>" + initial + "</div>") +
        "<div>" +
          "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0 0 2px;'>" + (worker.full_name||"ProFix Worker") + "</p>" +
          "<p style='color:var(--primary);font-size:12px;font-weight:600;margin:0;'>&#10003; KYC Verified</p>" +
        "</div>" +
      "</div>" +

      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow-sm);'>" +
        "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;'>Job Details</p>" +
        "<div style='margin-bottom:14px;'>" +
          "<label style='display:block;color:var(--text-primary);font-size:13px;font-weight:600;margin-bottom:6px;'>Job Title *</label>" +
          "<input id='hireTitle' type='text' placeholder='e.g. Fix my kitchen sink' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;' />" +
        "</div>" +
        "<div style='margin-bottom:14px;'>" +
          "<label style='display:block;color:var(--text-primary);font-size:13px;font-weight:600;margin-bottom:6px;'>Description *</label>" +
          "<textarea id='hireDesc' placeholder='Describe what you need done...' rows='3' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;resize:none;line-height:1.5;'></textarea>" +
        "</div>" +
        "<div>" +
          "<label style='display:block;color:var(--text-primary);font-size:13px;font-weight:600;margin-bottom:6px;'>Location</label>" +
          "<input id='hireLocation' type='text' placeholder='e.g. Lekki, Lagos' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;' />" +
        "</div>" +
      "</div>" +

      "<p id='hireErr' style='color:var(--danger);font-size:13px;margin:0 0 14px;display:none;background:rgba(224,49,49,0.07);padding:12px;border-radius:10px;border:1px solid rgba(224,49,49,0.15);'></p>" +
      "<button id='sendHireBtn' style='width:100%;padding:15px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;min-height:52px;box-shadow:var(--shadow-green);'>Send Hire Request</button>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.getElementById("sendHireBtn").addEventListener("click", async () => {
    const title    = document.getElementById("hireTitle").value.trim()
    const desc     = document.getElementById("hireDesc").value.trim()
    const location = document.getElementById("hireLocation").value.trim()
    const errEl    = document.getElementById("hireErr")
    errEl.style.display = "none"

    if (!title)         { errEl.textContent = "Please enter a job title"; errEl.style.display = "block"; return }
    if (!desc)          { errEl.textContent = "Please describe the job"; errEl.style.display = "block"; return }
    if (desc.length<20) { errEl.textContent = "Description must be at least 20 characters"; errEl.style.display = "block"; return }

    setBtn("sendHireBtn", true, "Send Hire Request")

    const { data: job, error: jobErr } = await supabase.from("jobs").insert({
      owner_id: user.id, owner_email: user.email,
      title, category: worker.skills?.[0] || "General",
      description: desc, location: location || "Not specified",
      status: "open", budget_min: 0, budget_max: 0,
      photos: [], skills: worker.skills || [], is_remote: false
    }).select().single()

    if (jobErr) { setBtn("sendHireBtn", false, "Send Hire Request"); errEl.textContent = "Failed: " + jobErr.message; errEl.style.display = "block"; return }

    const { data: room, error: roomErr } = await supabase.from("chat_rooms").insert({
      job_id: job.id, owner_id: user.id, worker_id: worker.id,
      owner_email: user.email, worker_email: worker.email, job_title: title
    }).select().single()

    if (roomErr) { setBtn("sendHireBtn", false, "Send Hire Request"); errEl.textContent = "Failed to create chat: " + roomErr.message; errEl.style.display = "block"; return }

    await supabase.from("notifications").insert({
      user_id: worker.id, title: "New Hire Request!",
      body: user.email + " wants to hire you for: " + title,
      type: "hire_request", data: { job_id: job.id, room_id: room.id }
    })

    app.innerHTML =
      "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg-page);'>" +
      "<div style='width:100%;max-width:380px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:24px;padding:36px 24px;text-align:center;box-shadow:var(--shadow-modal);'>" +
        "<div style='width:80px;height:80px;background:rgba(0,194,89,0.10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;border:2px solid rgba(0,194,89,0.25);'>" +
          "<span style='font-size:36px;'>&#127881;</span>" +
        "</div>" +
        "<h2 style='color:var(--text-primary);font-size:22px;font-weight:800;margin:0 0 8px;'>Hire Request Sent!</h2>" +
        "<p style='color:var(--text-secondary);font-size:14px;margin:0 0 28px;line-height:1.6;'>" + (worker.full_name||"The worker") + " has been notified. Start chatting to discuss the details.</p>" +
        "<button id='openChatBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin-bottom:10px;min-height:50px;'>&#128172; Open Chat</button>" +
        "<button id='backDashBtn' style='width:100%;padding:13px;background:var(--bg-card-subtle);color:var(--text-secondary);font-size:14px;font-weight:600;border:1.5px solid var(--border);border-radius:12px;cursor:pointer;min-height:48px;'>Back to Dashboard</button>" +
      "</div></div>"

    document.getElementById("openChatBtn").addEventListener("click", () => showChatRoom(user, room.id, title, worker.email))
    document.getElementById("backDashBtn").addEventListener("click", () => showDashboard(user))
  })
}
`

c = c.replace('\nasync function boot()', WORKERS + '\nasync function boot()')

// Add Find Workers to drawer menu
c = c.replace(
  `"<button id='menuContractsBtn'`,
  `"<button id='menuFindWorkersBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
        "<span style='font-size:20px;'>&#128269;</span><span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>Find Workers</span>" +
      "</button>" +
      "<button id='menuContractsBtn'`
)

// Wire up
c = c.replace(
  `document.getElementById("menuContractsBtn").addEventListener("click", () => { closeMenu(); showMyContracts(user) })`,
  `document.getElementById("menuFindWorkersBtn").addEventListener("click", () => { closeMenu(); showWorkerDiscovery(user) })
  document.getElementById("menuContractsBtn").addEventListener("click", () => { closeMenu(); showMyContracts(user) })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Worker Discovery added. Lines:', c.split('\n').length)
