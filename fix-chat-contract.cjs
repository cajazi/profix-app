const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Replace the chat nav to include a contract button placeholder
c = c.replace(
  `"<div style='max-width:520px;margin:0 auto;display:flex;align-items:center;gap:12px;'><button id='backBtn' style='background:none;border:none;color:#a5b4fc;font-size:24px;cursor:pointer;padding:0;min-width:36px;min-height:36px;line-height:1;'>&#8592;</button><div style='width:38px;height:38px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0;'>" + initial + "</div><div style='flex:1;min-width:0;'><p style='color:#fff;font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (otherEmail||"User") + "</p><p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + jobTitle + "</p></div></div></nav>`,
  `"<div style='max-width:520px;margin:0 auto;display:flex;align-items:center;gap:12px;'><button id='backBtn' style='background:none;border:none;color:var(--text-primary);font-size:24px;cursor:pointer;padding:0;min-width:36px;min-height:36px;line-height:1;'>&#8592;</button><div style='width:38px;height:38px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:15px;flex-shrink:0;'>" + initial + "</div><div style='flex:1;min-width:0;'><p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (otherEmail||"User") + "</p><p style='color:var(--text-secondary);font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + jobTitle + "</p></div><button id='contractNavBtn' style='background:rgba(0,194,89,0.12);border:1.5px solid var(--border-active);color:var(--primary);font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;white-space:nowrap;display:none;'>Contract</button></div></nav>`
)

// Wire up the contract button after DOM is built
c = c.replace(
  `  await loadMessages(user, roomId)`,
  `  // Load room info and show contract button for owner
  supabase.from("chat_rooms").select("*").eq("id", roomId).single().then(res => {
    if (res.data && res.data.owner_id === user.id) {
      const btn = document.getElementById("contractNavBtn")
      if (btn) {
        btn.style.display = "block"
        btn.addEventListener("click", () => showCreateContract(user, res.data))
      }
    }
  })
  await loadMessages(user, roomId)`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Done. Lines:', c.split('\n').length)
