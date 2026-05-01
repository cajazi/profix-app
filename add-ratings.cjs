const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const RATINGS = `
// ── RATINGS & REVIEWS ─────────────────────────────────────────────────────────

async function showRateUser(user, contract) {
  pushScreen("rate", () => showRateUser(user, contract))
  const isOwner   = contract.owner_id === user.id
  const ratedId   = isOwner ? contract.worker_id   : contract.owner_id
  const ratedEmail = isOwner ? contract.worker_email : contract.owner_email
  const role      = isOwner ? "owner" : "worker"
  let selectedScore = 0

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Leave a Review") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;text-align:center;box-shadow:var(--shadow-sm);'>" +
        "<div style='width:64px;height:64px;background:var(--primary);border-radius:18px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:26px;margin:0 auto 12px;box-shadow:var(--shadow-green);'>" + (ratedEmail||"U")[0].toUpperCase() + "</div>" +
        "<p style='color:var(--text-primary);font-size:16px;font-weight:700;margin:0 0 4px;'>" + ratedEmail + "</p>" +
        "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Rate your experience for <strong>" + contract.job_title + "</strong></p>" +
      "</div>" +

      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:var(--shadow-sm);'>" +
        "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 16px;text-align:center;'>How would you rate this experience?</p>" +
        "<div id='starsRow' style='display:flex;justify-content:center;gap:10px;margin-bottom:10px;'>" +
          "<button class='starBtn' data-score='1' style='font-size:38px;background:none;border:none;cursor:pointer;opacity:0.25;transition:all 0.2s;padding:0;'>&#11088;</button>" +
          "<button class='starBtn' data-score='2' style='font-size:38px;background:none;border:none;cursor:pointer;opacity:0.25;transition:all 0.2s;padding:0;'>&#11088;</button>" +
          "<button class='starBtn' data-score='3' style='font-size:38px;background:none;border:none;cursor:pointer;opacity:0.25;transition:all 0.2s;padding:0;'>&#11088;</button>" +
          "<button class='starBtn' data-score='4' style='font-size:38px;background:none;border:none;cursor:pointer;opacity:0.25;transition:all 0.2s;padding:0;'>&#11088;</button>" +
          "<button class='starBtn' data-score='5' style='font-size:38px;background:none;border:none;cursor:pointer;opacity:0.25;transition:all 0.2s;padding:0;'>&#11088;</button>" +
        "</div>" +
        "<p id='scoreLabel' style='color:var(--text-muted);font-size:13px;text-align:center;margin:0;'>Tap a star to rate</p>" +
      "</div>" +

      "<div style='margin-bottom:20px;'>" +
        "<label style='display:block;color:var(--text-primary);font-size:14px;font-weight:600;margin-bottom:8px;'>Write a review (optional)</label>" +
        "<textarea id='reviewText' placeholder='Share your experience...' rows='4' maxlength='500' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:15px;outline:none;box-sizing:border-box;resize:none;line-height:1.6;'></textarea>" +
      "</div>" +

      "<p id='rateErr' style='color:var(--danger);font-size:13px;margin:0 0 14px;display:none;background:rgba(224,49,49,0.07);padding:12px;border-radius:10px;border:1px solid rgba(224,49,49,0.15);'></p>" +
      "<button id='submitRatingBtn' style='width:100%;padding:15px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;min-height:52px;box-shadow:var(--shadow-green);'>Submit Review</button>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"]
  document.querySelectorAll(".starBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedScore = parseInt(btn.dataset.score)
      document.querySelectorAll(".starBtn").forEach((b, i) => {
        b.style.opacity = i < selectedScore ? "1" : "0.25"
        b.style.transform = i < selectedScore ? "scale(1.1)" : "scale(1)"
      })
      const lbl = document.getElementById("scoreLabel")
      lbl.textContent = labels[selectedScore] + " (" + selectedScore + "/5)"
      lbl.style.color = "var(--primary)"
      lbl.style.fontWeight = "700"
    })
  })

  document.getElementById("submitRatingBtn").addEventListener("click", async () => {
    const errEl = document.getElementById("rateErr")
    errEl.style.display = "none"
    if (!selectedScore) { errEl.textContent = "Please select a star rating"; errEl.style.display = "block"; return }
    const review = document.getElementById("reviewText").value.trim()
    setBtn("submitRatingBtn", true, "Submit Review")

    const { error } = await supabase.from("ratings").insert({
      contract_id: contract.id, rater_id: user.id, rated_id: ratedId,
      rater_email: user.email, rated_email: ratedEmail,
      score: selectedScore, review: review || null, role
    })

    if (error) {
      setBtn("submitRatingBtn", false, "Submit Review")
      errEl.textContent = error.message.includes("unique") ? "You have already rated this contract" : "Failed: " + error.message
      errEl.style.display = "block"
      return
    }

    // Update profile rating
    const { data: allRatings } = await supabase.from("ratings").select("score").eq("rated_id", ratedId)
    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length
      await supabase.from("profiles").update({ rating: Math.round(avg * 100) / 100, total_reviews: allRatings.length }).eq("id", ratedId)
    }

    await supabase.from("notifications").insert({
      user_id: ratedId, title: "New Review Received!",
      body: user.email + " gave you " + selectedScore + " stars for " + contract.job_title,
      type: "review", data: { contract_id: contract.id, score: selectedScore }
    })

    app.innerHTML =
      "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg-page);'>" +
      "<div style='width:100%;max-width:380px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:24px;padding:36px 24px;text-align:center;box-shadow:var(--shadow-modal);'>" +
        "<div style='width:80px;height:80px;background:rgba(245,158,11,0.10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;border:2px solid rgba(245,158,11,0.25);'>" +
          "<span style='font-size:36px;'>&#11088;</span>" +
        "</div>" +
        "<h2 style='color:var(--text-primary);font-size:22px;font-weight:800;margin:0 0 8px;'>Review Submitted!</h2>" +
        "<p style='color:var(--text-secondary);font-size:14px;margin:0 0 28px;line-height:1.6;'>Thank you for your feedback. It helps build trust in the ProFix community.</p>" +
        "<button id='backDashBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Back to Dashboard</button>" +
      "</div></div>"
    document.getElementById("backDashBtn").addEventListener("click", () => showDashboard(user))
  })
}

async function showUserReviews(profileId, profileName) {
  pushScreen("userReviews", () => showUserReviews(profileId, profileName))
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar(profileName + " Reviews") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div id='reviewsList' style='text-align:center;color:var(--text-muted);padding:40px 0;'>" +
        "<div style='width:40px;height:40px;border:3px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>" +
        "Loading reviews..." +
      "</div>" +
    "</div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  const { data: ratings } = await supabase.from("ratings").select("*").eq("rated_id", profileId).order("created_at", { ascending: false })
  const container = document.getElementById("reviewsList")
  if (!container) return

  if (!ratings || ratings.length === 0) {
    container.innerHTML =
      "<div style='text-align:center;padding:60px 16px;'>" +
        "<div style='width:72px;height:72px;background:var(--bg-card-subtle);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid var(--border);'>" +
          "<span style='font-size:32px;'>&#11088;</span>" +
        "</div>" +
        "<p style='color:var(--text-primary);font-size:16px;font-weight:600;margin:0 0 6px;'>No reviews yet</p>" +
        "<p style='color:var(--text-muted);font-size:13px;margin:0;'>Reviews appear here after completing jobs.</p>" +
      "</div>"
    return
  }

  const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length
  let html =
    "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;text-align:center;box-shadow:var(--shadow-sm);'>" +
      "<p style='color:#F59E0B;font-size:32px;margin:0 0 6px;'>" + "&#11088;".repeat(Math.round(avg)) + "</p>" +
      "<p style='color:var(--text-primary);font-size:28px;font-weight:800;margin:0 0 4px;'>" + avg.toFixed(1) + " / 5</p>" +
      "<p style='color:var(--text-muted);font-size:13px;margin:0;'>" + ratings.length + " review" + (ratings.length === 1 ? "" : "s") + "</p>" +
    "</div>"

  ratings.forEach(r => {
    const date = new Date(r.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    const stars = "&#11088;".repeat(r.score) + "<span style='opacity:0.25;'>" + "&#11088;".repeat(5 - r.score) + "</span>"
    html +=
      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:10px;box-shadow:var(--shadow-sm);'>" +
        "<div style='display:flex;align-items:center;gap:12px;margin-bottom:10px;'>" +
          "<div style='width:40px;height:40px;background:var(--primary);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:16px;flex-shrink:0;'>" + (r.rater_email||"U")[0].toUpperCase() + "</div>" +
          "<div style='flex:1;min-width:0;'>" +
            "<p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (r.rater_email||"Anonymous") + "</p>" +
            "<p style='color:var(--text-muted);font-size:11px;margin:0;'>" + date + "</p>" +
          "</div>" +
        "</div>" +
        "<p style='color:#F59E0B;font-size:20px;margin:0 0 6px;'>" + stars + "</p>" +
        (r.review ? "<p style='color:var(--text-secondary);font-size:13px;margin:0;line-height:1.6;'>" + escapeHtml(r.review) + "</p>" : "") +
      "</div>"
  })

  container.innerHTML = html
}
`

c = c.replace('\nasync function boot()', RATINGS + '\nasync function boot()')

// Add Rate button on released contracts in showContractDetail
c = c.replace(
  `  const rateBtn = document.getElementById("rateBtn")
  if (rateBtn) rateBtn.addEventListener("click", () => showRateUser(user, contract))`,
  `  const rateBtn = document.getElementById("rateBtn")
  if (rateBtn) rateBtn.addEventListener("click", () => showRateUser(user, contract))
  const reviewsBtn = document.getElementById("viewReviewsBtn")
  if (reviewsBtn) reviewsBtn.addEventListener("click", () => showUserReviews(contract.worker_id, contract.worker_email))`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Ratings added. Lines:', c.split('\n').length)
