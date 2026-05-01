const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const CONTRACTS = `
// ── CONTRACTS & ESCROW ────────────────────────────────────────────────────────

async function showMyContracts(user) {
  pushScreen("myContracts", () => showMyContracts(user))
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("My Contracts") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div id='contractsList' style='text-align:center;color:var(--text-muted);padding:40px 0;'>" +
        "<div style='width:40px;height:40px;border:3px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>" +
        "Loading contracts..." +
      "</div>" +
    "</div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  const { data: contracts, error } = await supabase
    .from("contracts").select("*")
    .or("owner_id.eq." + user.id + ",worker_id.eq." + user.id)
    .order("created_at", { ascending: false })

  const container = document.getElementById("contractsList")
  if (!container) return
  if (error) { container.innerHTML = "<p style='color:var(--danger);text-align:center;'>Failed to load</p>"; return }
  if (!contracts || contracts.length === 0) {
    container.innerHTML =
      "<div style='text-align:center;padding:60px 16px;'>" +
        "<div style='width:72px;height:72px;background:var(--bg-card-subtle);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid var(--border);'>" +
          "<span style='font-size:32px;'>&#128196;</span>" +
        "</div>" +
        "<p style='color:var(--text-primary);font-size:16px;font-weight:600;margin:0 0 6px;'>No contracts yet</p>" +
        "<p style='color:var(--text-muted);font-size:13px;margin:0;'>Contracts are created from chat after agreeing on a price.</p>" +
      "</div>"
    return
  }

  const statusConfig = {
    pending_payment: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)", label: "Pending Payment" },
    active:          { color: "var(--primary)", bg: "rgba(0,194,89,0.10)", label: "In Progress" },
    completed:       { color: "var(--primary)", bg: "rgba(0,194,89,0.10)", label: "Completed" },
    released:        { color: "var(--primary)", bg: "rgba(0,194,89,0.10)", label: "Released" },
    disputed:        { color: "var(--danger)",  bg: "rgba(224,49,49,0.10)", label: "Disputed" },
  }

  let html = ""
  contracts.forEach(contract => {
    const isOwner = contract.owner_id === user.id
    const cfg = statusConfig[contract.status] || statusConfig.pending_payment
    const other = isOwner ? contract.worker_email : contract.owner_email
    const date = new Date(contract.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    html +=
      "<div class='contractCard' data-id='" + contract.id + "' style='background:var(--bg-card);border:1.5px solid " + (contract.status==="active"?"var(--border-active)":"var(--border)") + ";border-radius:16px;padding:16px;margin-bottom:12px;cursor:pointer;box-shadow:var(--shadow-sm);'>" +
        "<div style='display:flex;align-items:flex-start;gap:14px;'>" +
          "<div style='width:46px;height:46px;background:" + cfg.bg + ";border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid " + cfg.color + ";'>" +
            "<span style='font-size:20px;'>&#128196;</span>" +
          "</div>" +
          "<div style='flex:1;min-width:0;'>" +
            "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;'>" +
              "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:65%;'>" + contract.job_title + "</p>" +
              "<span style='color:" + cfg.color + ";font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:" + cfg.bg + ";'>" + cfg.label + "</span>" +
            "</div>" +
            "<p style='color:var(--text-secondary);font-size:12px;margin:0 0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (isOwner ? "Worker: " : "Owner: ") + other + "</p>" +
            "<div style='display:flex;align-items:center;justify-content:space-between;'>" +
              "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid var(--border);'>" + (isOwner ? "&#127968; Owner" : "&#128296; Worker") + "</span>" +
              "<p style='color:var(--primary);font-size:16px;font-weight:800;margin:0;'>&#8358;" + Number(contract.agreed_price).toLocaleString() + "</p>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
  })

  container.innerHTML = html
  container.querySelectorAll(".contractCard").forEach(card => {
    card.addEventListener("click", () => {
      const contract = contracts.find(c => c.id === card.dataset.id)
      if (contract) showContractDetail(user, contract)
    })
  })
}

async function showCreateContract(user, room) {
  pushScreen("createContract", () => showCreateContract(user, room))
  const workerEmail = room.owner_id === user.id ? room.worker_email : room.owner_email

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Create Contract") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      "<div style='background:rgba(0,194,89,0.07);border:1px solid rgba(0,194,89,0.2);border-radius:14px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px;'>" +
        "<span style='font-size:20px;flex-shrink:0;'>&#128274;</span>" +
        "<div>" +
          "<p style='color:var(--primary);font-size:13px;font-weight:700;margin:0 0 3px;'>Escrow Protection</p>" +
          "<p style='color:var(--text-secondary);font-size:12px;margin:0;line-height:1.5;'>Payment is held securely until you confirm the job is complete. Worker only gets paid after your approval.</p>" +
        "</div>" +
      "</div>" +

      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px;'>" +
        "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;'>Contract Details</p>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Job</p>" +
          "<p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;max-width:60%;text-align:right;'>" + (room.job_title || "Job") + "</p>" +
        "</div>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Worker</p>" +
          "<p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;'>" + workerEmail + "</p>" +
        "</div>" +
        "<div style='padding:12px 0 0;'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 8px;'>Agreed Price (&#8358;) *</p>" +
          "<input id='contractPrice' type='number' placeholder='Enter agreed amount' style='width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--border);color:var(--text-primary);background:var(--bg-input);font-size:16px;outline:none;box-sizing:border-box;' />" +
        "</div>" +
      "</div>" +

      "<div style='background:var(--bg-card-subtle);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:20px;'>" +
        "<p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0 0 8px;'>What happens next?</p>" +
        "<div style='display:flex;flex-direction:column;gap:8px;'>" +
          "<div style='display:flex;align-items:center;gap:10px;'><div style='width:22px;height:22px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='color:#fff;font-size:11px;font-weight:700;'>1</span></div><p style='color:var(--text-secondary);font-size:12px;margin:0;'>Create contract &amp; pay into escrow</p></div>" +
          "<div style='display:flex;align-items:center;gap:10px;'><div style='width:22px;height:22px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='color:#fff;font-size:11px;font-weight:700;'>2</span></div><p style='color:var(--text-secondary);font-size:12px;margin:0;'>Worker completes the job</p></div>" +
          "<div style='display:flex;align-items:center;gap:10px;'><div style='width:22px;height:22px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;'><span style='color:#fff;font-size:11px;font-weight:700;'>3</span></div><p style='color:var(--text-secondary);font-size:12px;margin:0;'>You confirm completion &amp; payment releases</p></div>" +
        "</div>" +
      "</div>" +

      "<p id='contractErr' style='color:var(--danger);font-size:13px;margin:0 0 14px;display:none;background:rgba(224,49,49,0.07);padding:12px;border-radius:10px;border:1px solid rgba(224,49,49,0.15);'></p>" +
      "<button id='createContractBtn' style='width:100%;padding:15px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;min-height:52px;box-shadow:var(--shadow-green);'>Create Contract &amp; Pay</button>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.getElementById("createContractBtn").addEventListener("click", async () => {
    const price = parseFloat(document.getElementById("contractPrice").value)
    const errEl = document.getElementById("contractErr")
    errEl.style.display = "none"
    if (!price || price <= 0) { errEl.textContent = "Please enter the agreed price"; errEl.style.display = "block"; return }
    if (price < 100) { errEl.textContent = "Minimum contract amount is \u20a6100"; errEl.style.display = "block"; return }
    setBtn("createContractBtn", true, "Create Contract & Pay")

    const workerId = room.owner_id === user.id ? room.worker_id : room.owner_id
    const { data: contract, error } = await supabase.from("contracts").insert({
      job_id: room.job_id, room_id: room.id,
      owner_id: user.id, worker_id: workerId,
      owner_email: user.email, worker_email: workerEmail,
      job_title: room.job_title, agreed_price: price,
      status: "pending_payment"
    }).select().single()

    if (error) { setBtn("createContractBtn", false, "Create Contract & Pay"); errEl.textContent = "Failed: " + error.message; errEl.style.display = "block"; return }
    showPayment(user, contract)
  })
}

function showPayment(user, contract) {
  pushScreen("payment", () => showPayment(user, contract))
  const ref = "PROFIX_" + Date.now() + "_" + Math.random().toString(36).substr(2,9).toUpperCase()

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Secure Payment") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px;'>" +
        "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;'>Payment Summary</p>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Job</p>" +
          "<p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;max-width:60%;text-align:right;'>" + contract.job_title + "</p>" +
        "</div>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Worker</p>" +
          "<p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;'>" + contract.worker_email + "</p>" +
        "</div>" +
        "<div style='display:flex;justify-content:space-between;padding:12px 0 0;'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Amount</p>" +
          "<p style='color:var(--primary);font-size:22px;font-weight:800;margin:0;'>&#8358;" + Number(contract.agreed_price).toLocaleString() + "</p>" +
        "</div>" +
      "</div>" +

      "<div style='background:var(--bg-card-subtle);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:16px;'>" +
        "<p style='color:var(--text-muted);font-size:11px;margin:0;'>Reference: <span style='color:var(--text-secondary);font-weight:600;'>" + ref + "</span></p>" +
      "</div>" +

      "<div style='background:rgba(0,194,89,0.07);border:1px solid rgba(0,194,89,0.2);border-radius:14px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px;'>" +
        "<span style='font-size:20px;flex-shrink:0;'>&#128274;</span>" +
        "<div>" +
          "<p style='color:var(--primary);font-size:13px;font-weight:700;margin:0 0 3px;'>Your money is safe</p>" +
          "<p style='color:var(--text-secondary);font-size:12px;margin:0;line-height:1.5;'>Funds held in escrow until you confirm job completion. Full refund if worker fails to deliver.</p>" +
        "</div>" +
      "</div>" +

      "<button id='payNowBtn' style='width:100%;padding:15px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:52px;box-shadow:var(--shadow-green);'>Pay &#8358;" + Number(contract.agreed_price).toLocaleString() + " via Paystack</button>" +
      "<button id='cancelPayBtn' style='width:100%;padding:13px;background:var(--bg-card);color:var(--text-secondary);font-size:14px;font-weight:600;border:1.5px solid var(--border);border-radius:14px;cursor:pointer;min-height:48px;'>Cancel</button>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  document.getElementById("cancelPayBtn").addEventListener("click", () => popScreen())
  document.getElementById("payNowBtn").addEventListener("click", async () => {
    const btn = document.getElementById("payNowBtn")
    btn.disabled = true; btn.textContent = "Opening payment..."
    await supabase.from("payments").insert({ contract_id: contract.id, amount: contract.agreed_price, paystack_ref: ref, status: "pending" })

    if (typeof PaystackPop === "undefined") {
      alert("Payment system not loaded. Check your internet connection.")
      btn.disabled = false; btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack"
      return
    }
    try {
      PaystackPop.setup({
        key: "pk_test_29c35e7d031ad2ac45966157a4f5cd02af30a713",
        email: user.email,
        amount: Math.round(contract.agreed_price * 100),
        currency: "NGN", ref,
        callback: async (response) => {
          await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paystack_ref", ref)
          await supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id)
          await supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Received!", body: "Escrow payment of \u20a6" + Number(contract.agreed_price).toLocaleString() + " received for " + contract.job_title, type: "payment", data: { contract_id: contract.id } })
          showPaymentSuccess(user, contract)
        },
        onClose: () => { btn.disabled = false; btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
      }).openIframe()
    } catch(e) { alert("Payment error: " + e.message); btn.disabled = false; btn.textContent = "Pay \u20a6" + Number(contract.agreed_price).toLocaleString() + " via Paystack" }
  })
}

function showPaymentSuccess(user, contract) {
  pushScreen("paySuccess", () => showPaymentSuccess(user, contract))
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg-page);'>" +
    "<div style='width:100%;max-width:380px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:24px;padding:36px 24px;text-align:center;box-shadow:var(--shadow-modal);'>" +
      "<div style='width:80px;height:80px;background:rgba(0,194,89,0.10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;border:2px solid rgba(0,194,89,0.25);'>" +
        "<span style='font-size:36px;'>&#128274;</span>" +
      "</div>" +
      "<h2 style='color:var(--text-primary);font-size:22px;font-weight:800;margin:0 0 8px;'>Payment Secured!</h2>" +
      "<p style='color:var(--primary);font-size:18px;font-weight:700;margin:0 0 6px;'>&#8358;" + Number(contract.agreed_price).toLocaleString() + " in escrow</p>" +
      "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 28px;line-height:1.6;'>Worker has been notified. Once they complete the job, confirm completion to release payment.</p>" +
      "<button id='viewContractBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin-bottom:10px;min-height:50px;'>View Contract</button>" +
      "<button id='backDashBtn' style='width:100%;padding:13px;background:var(--bg-card-subtle);color:var(--text-secondary);font-size:14px;font-weight:600;border:1.5px solid var(--border);border-radius:12px;cursor:pointer;min-height:48px;'>Back to Dashboard</button>" +
    "</div></div>"
  document.getElementById("viewContractBtn").addEventListener("click", () => showContractDetail(user, contract))
  document.getElementById("backDashBtn").addEventListener("click", () => showDashboard(user))
}

async function showContractDetail(user, contract) {
  pushScreen("contractDetail", () => showContractDetail(user, contract))
  const { data: fresh } = await supabase.from("contracts").select("*").eq("id", contract.id).single()
  if (fresh) contract = fresh
  const isOwner = contract.owner_id === user.id

  const statusConfig = {
    pending_payment: { color: "#F59E0B", label: "Pending Payment" },
    active:          { color: "var(--primary)", label: "In Progress" },
    completed:       { color: "var(--primary)", label: "Completed" },
    released:        { color: "var(--primary)", label: "Released" },
    disputed:        { color: "var(--danger)",  label: "Disputed" },
  }
  const cfg = statusConfig[contract.status] || statusConfig.pending_payment

  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Contract") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:14px;'>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;'>" +
          "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;margin:0;'>Contract</p>" +
          "<span style='color:" + cfg.color + ";font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:" + cfg.color + "22;'>" + cfg.label + "</span>" +
        "</div>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'><p style='color:var(--text-secondary);font-size:13px;margin:0;'>Job</p><p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;max-width:60%;text-align:right;'>" + contract.job_title + "</p></div>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'><p style='color:var(--text-secondary);font-size:13px;margin:0;'>Owner</p><p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;max-width:60%;'>" + contract.owner_email + "</p></div>" +
        "<div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--divider);'><p style='color:var(--text-secondary);font-size:13px;margin:0;'>Worker</p><p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;max-width:60%;'>" + contract.worker_email + "</p></div>" +
        "<div style='display:flex;justify-content:space-between;padding:12px 0 0;'><p style='color:var(--text-secondary);font-size:13px;margin:0;'>Amount</p><p style='color:var(--primary);font-size:22px;font-weight:800;margin:0;'>&#8358;" + Number(contract.agreed_price).toLocaleString() + "</p></div>" +
      "</div>" +

      (contract.status === "active" && isOwner ?
        "<button id='confirmBtn' style='width:100%;padding:14px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:52px;box-shadow:var(--shadow-green);'>&#10003; Confirm Job Complete &amp; Release Payment</button>" +
        "<button id='disputeBtn' style='width:100%;padding:13px;background:rgba(224,49,49,0.07);color:var(--danger);font-size:14px;font-weight:600;border:1.5px solid rgba(224,49,49,0.2);border-radius:14px;cursor:pointer;margin-bottom:10px;min-height:48px;'>&#9888; Raise Dispute</button>"
      : "") +

      (contract.status === "released" ?
        "<div style='background:rgba(0,194,89,0.07);border:1px solid rgba(0,194,89,0.2);border-radius:14px;padding:16px;text-align:center;margin-bottom:10px;'>" +
          "<p style='color:var(--primary);font-size:15px;font-weight:700;margin:0;'>&#10003; Payment released to worker</p>" +
        "</div>" +
        "<button id='rateBtn' style='width:100%;padding:13px;background:rgba(245,158,11,0.08);color:#F59E0B;font-size:14px;font-weight:700;border:1.5px solid rgba(245,158,11,0.25);border-radius:14px;cursor:pointer;min-height:48px;'>&#11088; Leave a Review</button>"
      : "") +

    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  const confirmBtn = document.getElementById("confirmBtn")
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!confirm("Confirm job is complete? This will release \u20a6" + Number(contract.agreed_price).toLocaleString() + " to the worker.")) return
      confirmBtn.disabled = true; confirmBtn.textContent = "Releasing payment..."
      await supabase.from("contracts").update({ status: "released", completed_at: new Date().toISOString(), released_at: new Date().toISOString() }).eq("id", contract.id)
      await creditWallet(contract.worker_id, contract.agreed_price, "Payment for " + contract.job_title, contract.id)
      await supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Payment Released!", body: "\u20a6" + Number(contract.agreed_price).toLocaleString() + " added to your wallet for " + contract.job_title, type: "payment_released", data: { contract_id: contract.id } })
      contract.status = "released"
      showContractDetail(user, contract)
    })
  }

  const rateBtn = document.getElementById("rateBtn")
  if (rateBtn) rateBtn.addEventListener("click", () => showRateUser(user, contract))

  const disputeBtn = document.getElementById("disputeBtn")
  if (disputeBtn) {
    disputeBtn.addEventListener("click", async () => {
      const reason = prompt("Describe the issue:")
      if (!reason) return
      await supabase.from("contracts").update({ status: "disputed" }).eq("id", contract.id)
      await supabase.from("notifications").insert({ user_id: contract.worker_id, title: "Dispute Raised", body: "A dispute was raised for " + contract.job_title + ": " + reason, type: "dispute", data: { contract_id: contract.id } })
      alert("Dispute raised. Our team will review within 24 hours.")
      contract.status = "disputed"
      showContractDetail(user, contract)
    })
  }
}

async function getOrCreateWallet(userId) {
  const { data } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()
  if (data) return data
  const { data: newWallet } = await supabase.from("wallets").insert({ user_id: userId, balance: 0, total_earned: 0, total_withdrawn: 0 }).select().single()
  return newWallet
}

async function creditWallet(userId, amount, description, contractId) {
  const wallet = await getOrCreateWallet(userId)
  if (!wallet) return false
  const newBalance = Number(wallet.balance) + Number(amount)
  const newEarned  = Number(wallet.total_earned) + Number(amount)
  await supabase.from("wallets").update({ balance: newBalance, total_earned: newEarned, updated_at: new Date().toISOString() }).eq("user_id", userId)
  await supabase.from("wallet_transactions").insert({ user_id: userId, type: "credit", amount, description, contract_id: contractId })
  return true
}
`

// Insert before boot
c = c.replace('\nasync function boot()', CONTRACTS + '\nasync function boot()')

// Add Contract button in chat room (owner only)
c = c.replace(
  `supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(function(res) {`,
  `supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(function(res) {
    if (res.data && res.data.owner_id === user.id) {
      const room = res.data
      const navDiv = document.querySelector("nav > div")
      if (navDiv) {
        const contractBtn = document.createElement("button")
        contractBtn.style.cssText = "background:rgba(0,194,89,0.12);border:1.5px solid var(--border-active);color:var(--primary);font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;margin-left:auto;white-space:nowrap;"
        contractBtn.textContent = "Contract"
        navDiv.appendChild(contractBtn)
        contractBtn.addEventListener("click", () => showCreateContract(user, room))
      }
    }`
)

// Add My Contracts to drawer menu
c = c.replace(
  `"<button id='menuWalletBtn'`,
  `"<button id='menuContractsBtn' style='width:100%;display:flex;align-items:center;gap:14px;padding:13px 14px;background:none;border:none;border-radius:10px;cursor:pointer;'>" +
        "<span style='font-size:20px;'>&#128196;</span><span style='color:var(--text-primary);font-size:14px;font-weight:500;text-align:left;'>My Contracts</span>" +
      "</button>" +
      "<button id='menuWalletBtn'`
)

// Wire up contracts button
c = c.replace(
  `document.getElementById("menuWalletBtn").addEventListener("click", () => {`,
  `document.getElementById("menuContractsBtn").addEventListener("click", () => { closeMenu(); showMyContracts(user) })
  document.getElementById("menuWalletBtn").addEventListener("click", () => {`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Contracts added. Lines:', c.split('\n').length)
