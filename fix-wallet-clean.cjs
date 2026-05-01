const fs = require("fs")
let c = fs.readFileSync("src/main.js", "utf8")

// ── STEP 1: Fix all markdown link corruption ─────────────────
c = c.replace(/\[btn\.dataset\.id\]\(http:\/\/btn\.dataset\.id\)/g, "btn.dataset.id")
c = c.replace(/\[btn\.dataset\.uid\]\(http:\/\/btn\.dataset\.uid\)/g, "btn.dataset.uid")
c = c.replace(/\[btn\.dataset\.amt\]\(http:\/\/btn\.dataset\.amt\)/g, "btn.dataset.amt")
c = c.replace(/\[data\.user\.id\]\(http:\/\/data\.user\.id\)/g, "data.user.id")
c = c.replace(/\[wlt\.total\]\(http:\/\/wlt\.total\)_withdrawn/g, "wlt.total_withdrawn")
console.log("Corruption fixed")

// ── STEP 2: Find and replace the ENTIRE withdrawals tab section ──
const START_MARKER = `box.querySelectorAll(".approveWBtn")`
const END_MARKER   = `box.querySelectorAll(".rejectWBtn")`

const si = c.indexOf(START_MARKER)
const ei = c.indexOf(END_MARKER)

if (si < 0 || ei < 0) {
  console.log("ERROR: Could not find markers. si="+si+" ei="+ei)
  process.exit(1)
}

// Remove duplicate })) that sits between the two blocks
const between = c.slice(si, ei)
console.log("Block between markers:", between.slice(0, 80) + "...")

const CLEAN_APPROVE = `box.querySelectorAll(".approveWBtn").forEach(function(btn) {
    btn.addEventListener("click", async function() {
      var amt = Number(btn.dataset.amt)
      var wid = btn.dataset.id
      var uid = btn.dataset.uid
      if (!confirm("Approve ₦" + amt.toLocaleString() + " withdrawal? Only confirm after you have sent the money.")) return
      btn.disabled = true
      btn.textContent = "Approving..."
      try {
        var me = await supabase.auth.getUser()
        var adminId = me.data.user.id
        var res = await supabase.rpc("approve_withdrawal_admin", {
          p_withdrawal_id: wid,
          p_admin_uid: adminId
        })
        if (res.error || !res.data || !res.data.ok) {
          var msg = (res.error && res.error.message) || (res.data && res.data.error) || "Unknown error"
          alert("Approval failed: " + msg)
          btn.disabled = false
          btn.textContent = "Approve & Pay"
          return
        }
        await supabase.from("notifications").insert({
          user_id: uid,
          title: "Withdrawal Approved!",
          body: "Your withdrawal of ₦" + amt.toLocaleString() + " has been processed.",
          type: "withdrawal_approved",
          data: {}
        })
        await loadAdminStats()
        await loadAdminTab("withdrawals")
      } catch(e) {
        alert("Error: " + e.message)
        btn.disabled = false
        btn.textContent = "Approve & Pay"
      }
    })
  })
  `

c = c.slice(0, si) + CLEAN_APPROVE + c.slice(ei)
console.log("Approval block replaced")

// ── STEP 3: Fix reject block too (clean up any corruption) ───
c = c.replace(
  `box.querySelectorAll(".rejectWBtn").forEach(btn => btn.addEventListener("click", async () => {
      const reason = prompt("Reason for rejection:")
      if (!reason) return
      btn.disabled = true; btn.textContent = "Rejecting..."
      await supabase.from("withdrawal_requests").update({ status: "rejected", admin_note: reason, processed_at: new Date().toISOString() }).eq("id", btn.dataset.id)
      await supabase.from("notifications").insert({ user_id: btn.dataset.uid, title: "Withdrawal Rejected", body: "Your withdrawal was rejected: " + reason, type: "withdrawal_rejected", data: {} })
      await loadAdminStats(); await loadAdminTab("withdrawals")
    }))`,
  `box.querySelectorAll(".rejectWBtn").forEach(function(btn) {
    btn.addEventListener("click", async function() {
      var reason = prompt("Reason for rejection:")
      if (!reason) return
      btn.disabled = true
      btn.textContent = "Rejecting..."
      await supabase.from("withdrawal_requests").update({
        status: "rejected",
        admin_note: reason,
        processed_at: new Date().toISOString()
      }).eq("id", btn.dataset.id)
      await supabase.from("notifications").insert({
        user_id: btn.dataset.uid,
        title: "Withdrawal Rejected",
        body: "Your withdrawal was rejected: " + reason,
        type: "withdrawal_rejected",
        data: {}
      })
      await loadAdminStats()
      await loadAdminTab("withdrawals")
    })
  })`
)
console.log("Reject block cleaned")

fs.writeFileSync("src/main.js", c, "utf8")
console.log("Done. Lines:", c.split("\n").length)
