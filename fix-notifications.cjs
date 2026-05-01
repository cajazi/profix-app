const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const OLD = `async function showNotifications(user) {
  pushScreen("notifications", () => showNotifications(user))
  app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("Notifications") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div id='notifList' style='text-align:center;color:#a5b4fc;padding:40px 0;'><div style='width:40px;height:40px;border:3px solid #818cf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>Loading notifications...</div></div></div>"
  document.getElementById("backBtn").addEventListener("click", () => popScreen())
  const { data: notifs, error } = await supabase.from("notifications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50)
  const container = document.getElementById("notifList")
  if (!container) return
  if (error) { container.innerHTML="<p style='color:#f87171;text-align:center;'>Failed to load</p>"; return }
  if (!notifs||notifs.length===0) { container.innerHTML="<div style='text-align:center;padding:48px 16px;'><span style='font-size:48px;'>&#128276;</span><p style='color:#fff;font-size:16px;font-weight:600;margin:16px 0 8px;'>No notifications yet</p></div>"; return }
  const unreadIds=notifs.filter(n=>!n.is_read).map(n=>n.id)
  if (unreadIds.length>0) { supabase.from("notifications").update({is_read:true}).in("id",unreadIds).then(()=>{ unreadCount=0; updateNotifBadge() }) }
  const iconMap={message:"&#128172;",application:"&#128203;",application_update:"&#127881;",kyc_approved:"&#10003;",kyc_rejected:"&#10005;"}
  const colorMap={message:"#4f46e5",application:"#059669",application_update:"#d97706",kyc_approved:"#059669",kyc_rejected:"#ef4444"}
  let html="<button id='markAllBtn' style='width:100%;padding:11px;background:rgba(255,255,255,0.06);color:#a5b4fc;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,0.1);border-radius:10px;cursor:pointer;margin-bottom:14px;'>Mark all as read</button>"
  notifs.forEach(function(n) {
    const icon=iconMap[n.type]||"&#128276;", color=colorMap[n.type]||"#4f46e5"
    const time=new Date(n.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})
    html+="<div style='background:"+(n.is_read?"rgba(255,255,255,0.05)":"rgba(99,102,241,0.1)")+";border:1px solid "+(n.is_read?"rgba(255,255,255,0.08)":"rgba(99,102,241,0.25)")+";border-radius:14px;padding:14px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;'>" +
      "<div style='width:40px;height:40px;background:"+color+";border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;'>"+icon+"</div>" +
      "<div style='flex:1;min-width:0;'><div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;'><p style='color:#fff;font-size:14px;font-weight:"+(n.is_read?"500":"700")+";margin:0;'>"+n.title+"</p>"+(!n.is_read?"<div style='width:8px;height:8px;background:#4f46e5;border-radius:50%;flex-shrink:0;margin-left:8px;'></div>":"")+"></div>" +
      "<p style='color:#a5b4fc;font-size:13px;margin:0 0 4px;line-height:1.5;'>"+(n.body||"")+"</p><p style='color:#6b7280;font-size:11px;margin:0;'>"+time+"</p></div></div>"
  })
  container.innerHTML=html
  document.getElementById("markAllBtn").addEventListener("click", async () => {
    await supabase.from("notifications").update({is_read:true}).eq("user_id",user.id)
    unreadCount=0; updateNotifBadge(); showNotifications(user)
  })
}`

const NEW = `async function showNotifications(user) {
  pushScreen("notifications", () => showNotifications(user))
  app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Notifications") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +
      "<div id='notifList' style='text-align:center;color:var(--text-muted);padding:40px 0;'>" +
        "<div style='width:40px;height:40px;border:3px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;'></div>" +
        "Loading notifications..." +
      "</div>" +
    "</div></div>"

  document.getElementById("backBtn").addEventListener("click", () => popScreen())

  const { data: notifs, error } = await supabase
    .from("notifications").select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const container = document.getElementById("notifList")
  if (!container) return

  if (error) {
    container.innerHTML = "<p style='color:var(--danger);text-align:center;padding:20px;'>Failed to load notifications</p>"
    return
  }

  if (!notifs || notifs.length === 0) {
    container.innerHTML =
      "<div style='text-align:center;padding:60px 16px;'>" +
        "<div style='width:72px;height:72px;background:var(--bg-card-subtle);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid var(--border);'>" +
          "<span style='font-size:32px;'>&#128276;</span>" +
        "</div>" +
        "<p style='color:var(--text-primary);font-size:16px;font-weight:600;margin:0 0 6px;'>All caught up!</p>" +
        "<p style='color:var(--text-muted);font-size:13px;margin:0;'>No notifications yet. We will notify you about jobs, applications and payments.</p>" +
      "</div>"
    return
  }

  // Mark unread as read
  const unreadIds = notifs.filter(n => !n.is_read).map(n => n.id)
  if (unreadIds.length > 0) {
    supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)
      .then(() => { unreadCount = 0; updateNotifBadge() })
  }

  const typeConfig = {
    message:            { icon: "&#128172;", bg: "#00C259", label: "Message" },
    application:        { icon: "&#128203;", bg: "#0EA5E9", label: "Application" },
    application_update: { icon: "&#127881;", bg: "#F59E0B", label: "Update" },
    kyc_approved:       { icon: "&#10003;",  bg: "#00C259", label: "KYC" },
    kyc_rejected:       { icon: "&#10005;",  bg: "#E03131", label: "KYC" },
    payment:            { icon: "&#128184;", bg: "#00C259", label: "Payment" },
    payment_released:   { icon: "&#128184;", bg: "#00C259", label: "Payment" },
    withdrawal:         { icon: "&#8593;",   bg: "#6366F1", label: "Withdrawal" },
    withdrawal_approved:{ icon: "&#10003;",  bg: "#00C259", label: "Withdrawal" },
    withdrawal_rejected:{ icon: "&#10005;",  bg: "#E03131", label: "Withdrawal" },
    review:             { icon: "&#11088;",  bg: "#F59E0B", label: "Review" },
    hire_request:       { icon: "&#128296;", bg: "#0EA5E9", label: "Hire" },
    dispute:            { icon: "&#9888;",   bg: "#E03131", label: "Dispute" },
  }

  // Group by date
  const today    = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1)
  const groups   = { "Today": [], "Yesterday": [], "Earlier": [] }

  notifs.forEach(n => {
    const d = new Date(n.created_at); d.setHours(0,0,0,0)
    if (d.getTime() === today.getTime())     groups["Today"].push(n)
    else if (d.getTime() === yesterday.getTime()) groups["Yesterday"].push(n)
    else                                     groups["Earlier"].push(n)
  })

  const unreadCount2 = notifs.filter(n => !n.is_read).length

  let html =
    // Header row
    "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;'>" +
      "<p style='color:var(--text-primary);font-size:13px;font-weight:600;margin:0;'>" +
        notifs.length + " notification" + (notifs.length === 1 ? "" : "s") +
        (unreadCount2 > 0 ? " &bull; <span style='color:var(--primary);'>" + unreadCount2 + " unread</span>" : "") +
      "</p>" +
      "<button id='markAllBtn' style='background:none;border:none;color:var(--primary);font-size:13px;font-weight:600;cursor:pointer;padding:4px 0;'>Mark all read</button>" +
    "</div>"

  Object.entries(groups).forEach(([groupLabel, items]) => {
    if (items.length === 0) return
    html += "<p style='color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 8px;'>" + groupLabel + "</p>"

    items.forEach(n => {
      const cfg  = typeConfig[n.type] || { icon: "&#128276;", bg: "#00C259", label: "Info" }
      const time = new Date(n.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
      const date = new Date(n.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })

      html +=
        "<div style='" +
          "background:var(--bg-card);" +
          "border:1.5px solid " + (n.is_read ? "var(--border)" : "var(--border-active)") + ";" +
          "border-radius:16px;" +
          "padding:14px;" +
          "margin-bottom:10px;" +
          "display:flex;" +
          "align-items:flex-start;" +
          "gap:14px;" +
          "box-shadow:" + (n.is_read ? "var(--shadow-sm)" : "0 2px 12px rgba(0,194,89,0.10)") + ";" +
          "position:relative;" +
        "'>" +
          // Left accent bar for unread
          (!n.is_read ? "<div style='position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--primary);border-radius:16px 0 0 16px;'></div>" : "") +

          // Icon circle
          "<div style='" +
            "width:46px;height:46px;" +
            "background:" + cfg.bg + ";" +
            "border-radius:14px;" +
            "display:flex;align-items:center;justify-content:center;" +
            "flex-shrink:0;font-size:20px;" +
            "box-shadow:0 4px 12px " + cfg.bg + "44;" +
          "'>" +
            "<span style='color:#FFFFFF;'>" + cfg.icon + "</span>" +
          "</div>" +

          // Content
          "<div style='flex:1;min-width:0;'>" +
            // Title row
            "<div style='display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;'>" +
              "<p style='color:var(--text-primary);font-size:14px;font-weight:" + (n.is_read ? "500" : "700") + ";margin:0;line-height:1.3;'>" + n.title + "</p>" +
              "<span style='color:var(--text-muted);font-size:11px;flex-shrink:0;margin-top:2px;'>" + time + "</span>" +
            "</div>" +
            // Body
            "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 6px;line-height:1.5;'>" + (n.body || "") + "</p>" +
            // Footer row
            "<div style='display:flex;align-items:center;gap:8px;'>" +
              "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid var(--border);'>" + cfg.label + "</span>" +
              (!n.is_read ? "<span style='background:var(--primary);color:#FFFFFF;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;'>NEW</span>" : "") +
            "</div>" +
          "</div>" +
        "</div>"
    })
    html += "<div style='height:8px;'></div>"
  })

  container.innerHTML = html
  document.getElementById("markAllBtn").addEventListener("click", async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)
    unreadCount = 0; updateNotifBadge(); showNotifications(user)
  })
}`

if (c.includes('async function showNotifications(user)')) {
  // Find and replace the full function
  const start = c.indexOf('async function showNotifications(user)')
  const end   = c.indexOf('\nasync function showAdminPanel')
  c = c.slice(0, start) + NEW + '\n' + c.slice(end)
  console.log('Notifications redesigned')
} else {
  console.log('ERROR: showNotifications not found')
}

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
