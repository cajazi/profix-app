const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")

// Find line with tab==="jobs"
let jobsLine = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('} else if (tab==="jobs")')) {
    jobsLine = i
    break
  }
}

if (jobsLine === -1) { console.log("jobs line not found"); process.exit(1) }
console.log("Found jobs tab at line", jobsLine + 1)

const withdrawalsCode = [
  '  } else if (tab==="withdrawals") {',
  '    const { data:reqs, error:wErr } = await supabase.from("withdrawal_requests").select("*").order("created_at",{ascending:false}).limit(50)',
  '    if (wErr) { container.innerHTML="<p style=\'color:#f87171;text-align:center;\'>Error: "+wErr.message+"</p>"; return }',
  '    if (!reqs||reqs.length===0) { container.innerHTML="<div style=\'text-align:center;padding:48px 16px;\'><span style=\'font-size:44px;\'>&#128184;</span><p style=\'color:#fff;font-size:16px;font-weight:600;margin:14px 0 6px;\'>No withdrawal requests</p></div>"; return }',
  '    let html="<p style=\'color:#a5b4fc;font-size:13px;margin:0 0 14px;\'>"+reqs.length+" request"+(reqs.length===1?"":"s")+"</p>"',
  '    reqs.forEach(function(r) {',
  '      const sc=r.status==="approved"?"#34d399":r.status==="rejected"?"#f87171":"#fbbf24"',
  '      const dt=new Date(r.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short"})',
  '      html+="<div style=\'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:16px;margin-bottom:10px;\'>" +',
  '        "<div style=\'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;\'>" +',
  '          "<p style=\'color:#fff;font-size:15px;font-weight:700;margin:0;\'>&#8358;"+Number(r.amount).toLocaleString()+"</p>" +',
  '          "<span style=\'color:"+sc+";font-size:11px;font-weight:700;\'>"+r.status.toUpperCase()+"</span>" +',
  '        "</div>" +',
  '        "<p style=\'color:#a5b4fc;font-size:12px;margin:0 0 3px;\'>Bank: "+(r.bank_name||"N/A")+"</p>" +',
  '        "<p style=\'color:#a5b4fc;font-size:12px;margin:0 0 3px;\'>Account: "+(r.account_number||"N/A")+"</p>" +',
  '        "<p style=\'color:#a5b4fc;font-size:12px;margin:0 0 3px;\'>Name: "+(r.account_name||"N/A")+"</p>" +',
  '        "<p style=\'color:#6b7280;font-size:11px;margin:0 0 10px;\'>"+dt+"</p>" +',
  '        (r.status==="pending" ?',
  '          "<div style=\'display:grid;grid-template-columns:1fr 1fr;gap:8px;\'>" +',
  '            "<button class=\'rejectWBtn\' data-id=\'"+r.id+"\' data-uid=\'"+r.user_id+"\' data-amt=\'"+r.amount+"\' style=\'padding:10px;background:rgba(239,68,68,0.1);color:#f87171;font-size:12px;font-weight:600;border:1px solid rgba(239,68,68,0.2);border-radius:10px;cursor:pointer;\'>Reject</button>" +',
  '            "<button class=\'approveWBtn\' data-id=\'"+r.id+"\' data-uid=\'"+r.user_id+"\' data-amt=\'"+r.amount+"\' style=\'padding:10px;background:#059669;color:#fff;font-size:12px;font-weight:600;border:none;border-radius:10px;cursor:pointer;\'>Approve</button>" +',
  '          "</div>"',
  '        : "") +',
  '      "</div>"',
  '    })',
  '    container.innerHTML=html',
  '    container.querySelectorAll(".approveWBtn").forEach(function(btn) {',
  '      btn.addEventListener("click", async function() {',
  '        if (!confirm("Approve withdrawal of NGN "+Number(btn.dataset.amt).toLocaleString()+"? Make sure you have sent the money to their bank.")) return',
  '        btn.disabled=true; btn.textContent="..."',
  '        await supabase.from("withdrawal_requests").update({status:"approved",processed_at:new Date().toISOString()}).eq("id",btn.dataset.id)',
  '        const {data:w} = await supabase.from("wallets").select("balance,total_withdrawn").eq("user_id",btn.dataset.uid).single()',
  '        if (w) { await supabase.from("wallets").update({balance:Math.max(0,Number(w.balance)-Number(btn.dataset.amt)),total_withdrawn:Number(w.total_withdrawn)+Number(btn.dataset.amt),updated_at:new Date().toISOString()}).eq("user_id",btn.dataset.uid) }',
  '        await supabase.from("wallet_transactions").insert({user_id:btn.dataset.uid,type:"debit",amount:btn.dataset.amt,description:"Withdrawal approved"})',
  '        await supabase.from("notifications").insert({user_id:btn.dataset.uid,title:"Withdrawal Approved!",body:"Your withdrawal of NGN "+Number(btn.dataset.amt).toLocaleString()+" has been sent to your bank.",type:"withdrawal_approved",data:{}})',
  '        await loadAdminTab("withdrawals",user)',
  '      })',
  '    })',
  '    container.querySelectorAll(".rejectWBtn").forEach(function(btn) {',
  '      btn.addEventListener("click", async function() {',
  '        const reason=prompt("Reason for rejection:"); if(!reason) return',
  '        btn.disabled=true; btn.textContent="..."',
  '        await supabase.from("withdrawal_requests").update({status:"rejected",admin_note:reason,processed_at:new Date().toISOString()}).eq("id",btn.dataset.id)',
  '        await supabase.from("notifications").insert({user_id:btn.dataset.uid,title:"Withdrawal Rejected",body:"Your withdrawal was rejected: "+reason,type:"withdrawal_rejected",data:{}})',
  '        await loadAdminTab("withdrawals",user)',
  '      })',
  '    })',
]

lines.splice(jobsLine, 0, ...withdrawalsCode)
fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Withdrawals handler inserted before line", jobsLine + 1)
