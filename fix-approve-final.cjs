const fs = require('fs')
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n')

// Replace lines 2561-2576 (1-indexed) = indices 2560-2575 (0-indexed)
// 16 lines total — the entire approveWBtn forEach block
const newLines = [
  '    box.querySelectorAll(".approveWBtn").forEach(btn => btn.addEventListener("click", async () => {',
  '      const amt = Number(btn.dataset.amt)',
  '      if (!confirm("Approve withdrawal of NGN " + amt.toLocaleString() + "? Confirm you have sent the money to their bank.")) return',
  '      btn.disabled = true; btn.textContent = "Approving..."',
  '      const { data: rpcResult, error: rpcErr } = await supabase.rpc("approve_withdrawal_admin", {',
  '        p_withdrawal_id: btn.dataset.id,',
  '        p_admin_uid:     (await supabase.auth.getUser()).data.user.id',
  '      })',
  '      if (rpcErr || !rpcResult?.ok) {',
  '        alert("Approval failed: " + (rpcErr?.message || rpcResult?.error || "Unknown error"))',
  '        btn.disabled = false; btn.textContent = "Approve & Pay"',
  '        return',
  '      }',
  '      await supabase.from("notifications").insert({ user_id: btn.dataset.uid, title: "Withdrawal Approved!", body: "Your withdrawal of NGN " + amt.toLocaleString() + " has been sent to your bank.", type: "withdrawal_approved", data: {} })',
  '      await loadAdminStats(); await loadAdminTab("withdrawals")',
  '    }))',
]

// Verify we are replacing the right block
console.log('Line 2561:', lines[2560])
console.log('Line 2576:', lines[2575])

lines.splice(2560, 16, ...newLines)

fs.writeFileSync('src/main.js', lines.join('\n'), 'utf8')
console.log('Done. Lines:', lines.length)
