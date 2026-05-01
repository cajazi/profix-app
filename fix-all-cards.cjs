const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `html += "<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:8px;'>" +
      "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;'>" +
        "<span style='background:#4f46e5;color:#fff;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;'>" + (job.category||"General") + "</span>" +
        "<span style='color:" + (job.status==="open"?"#34d399":"#9ca3af") + ";font-size:11px;font-weight:600;'>" + (job.status||"open").toUpperCase() + "</span>" +
      "</div>" +
      "<p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 3px;'>" + job.title + "</p>" +
      "<p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (job.description||"") + "</p>" +
    "</div>"`,
  `html +=
    "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:14px;'>" +
      "<div style='width:46px;height:46px;background:" + (job.status==="open"?"var(--primary)":"#9ca3af") + ";border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
        "<span style='color:#FFFFFF;font-size:20px;'>&#128295;</span>" +
      "</div>" +
      "<div style='flex:1;min-width:0;'>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;'>" +
          "<p style='color:var(--text-primary);font-size:14px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%;'>" + job.title + "</p>" +
          "<span style='color:" + (job.status==="open"?"var(--primary)":"var(--text-muted)") + ";font-size:11px;font-weight:700;'>" + (job.status||"open").toUpperCase() + "</span>" +
        "</div>" +
        "<p style='color:var(--text-secondary);font-size:12px;margin:0 0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (job.description||"") + "</p>" +
        "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid var(--border);'>" + (job.category||"General") + "</span>" +
      "</div>" +
    "</div>"`
)

c = c.replace(
  `html += "<div class='jobCard' data-id='" + job.id + "' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);border-radius:16px;padding:16px;margin-bottom:12px;cursor:pointer;'>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;'><span style='background:#4f46e5;color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;'>" + (job.category||"General") + "</span><span style='color:#34d399;font-size:12px;font-weight:700;'>OPEN</span></div>" +
        "<p style='color:#fff;font-size:15px;font-weight:600;margin:0 0 6px;'>" + job.title + "</p>" +
        "<p style='color:#a5b4fc;font-size:13px;margin:0 0 12px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;'>" + (job.description||"") + "</p>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;'>" +
          "<span style='color:#6b7280;font-size:12px;'>" + (job.location?"&#128205; "+job.location:"") + "</span>" +
          "<button class='applyBtn' data-id='" + job.id + "' style='background:#4f46e5;color:#fff;font-size:13px;font-weight:600;padding:8px 18px;border:none;border-radius:8px;cursor:pointer;'>Apply</button>" +
        "</div>" +
      "</div>"`,
  `html +=
    "<div class='jobCard' data-id='" + job.id + "' style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:12px;cursor:pointer;box-shadow:var(--shadow-sm);'>" +
      "<div style='display:flex;align-items:flex-start;gap:14px;'>" +
        "<div style='width:46px;height:46px;background:var(--primary);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--shadow-green);'>" +
          "<span style='color:#FFFFFF;font-size:20px;'>&#128295;</span>" +
        "</div>" +
        "<div style='flex:1;min-width:0;'>" +
          "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;'>" +
            "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:75%;'>" + job.title + "</p>" +
            "<span style='color:var(--primary);font-size:11px;font-weight:700;'>OPEN</span>" +
          "</div>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 10px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;'>" + (job.description||"") + "</p>" +
          "<div style='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;'>" +
            "<div style='display:flex;align-items:center;gap:6px;'>" +
              "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid var(--border);'>" + (job.category||"General") + "</span>" +
            "</div>" +
            "<button class='applyBtn' data-id='" + job.id + "' style='background:var(--primary);color:#FFFFFF;font-size:13px;font-weight:700;padding:8px 18px;border:none;border-radius:10px;cursor:pointer;'>Apply</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>"`
)

c = c.replace(
  `html += "<div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px;margin-bottom:10px;'>" +
      "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;'><span style='background:#4f46e5;color:#fff;font-size:10px;font-weight:600;padding:2px 9px;border-radius:20px;'>" + (job.category||"General") + "</span><span style='color:" + (job.status==="open"?"#34d399":"#9ca3af") + ";font-size:11px;font-weight:700;'>" + (job.status||"open").toUpperCase() + "</span></div>" +
      "<p style='color:#fff;font-size:15px;font-weight:600;margin:0 0 5px;'>" + job.title + "</p>" +
      "<p style='color:#6b7280;font-size:12px;margin:0 0 10px;'>&#128205; " + (job.location||"Not specified") + "</p>" +
      "<button class='viewAppsBtn' data-jobid='" + job.id + "' style='width:100%;padding:10px;background:rgba(79,70,229,0.2);color:#818cf8;font-size:13px;font-weight:600;border:1px solid rgba(79,70,229,0.3);border-radius:10px;cursor:pointer;min-height:42px;'>&#128203; View Applications</button>" +
    "</div>"`,
  `html +=
    "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:var(--shadow-sm);display:flex;align-items:flex-start;gap:14px;'>" +
      "<div style='width:46px;height:46px;background:" + (job.status==="open"?"var(--primary)":"#9ca3af") + ";border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
        "<span style='color:#FFFFFF;font-size:20px;'>&#128203;</span>" +
      "</div>" +
      "<div style='flex:1;min-width:0;'>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;'>" +
          "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:75%;'>" + job.title + "</p>" +
          "<span style='color:" + (job.status==="open"?"var(--primary)":"var(--text-muted)") + ";font-size:11px;font-weight:700;'>" + (job.status||"open").toUpperCase() + "</span>" +
        "</div>" +
        "<p style='color:var(--text-secondary);font-size:12px;margin:0 0 8px;'>&#128205; " + (job.location||"Not specified") + "</p>" +
        "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid var(--border);display:inline-block;margin-bottom:10px;'>" + (job.category||"General") + "</span>" +
        "<button class='viewAppsBtn' data-jobid='" + job.id + "' style='width:100%;padding:10px;background:rgba(0,194,89,0.08);color:var(--primary);font-size:13px;font-weight:700;border:1.5px solid var(--border-active);border-radius:10px;cursor:pointer;min-height:42px;'>&#128203; View Applications</button>" +
      "</div>" +
    "</div>"`
)

c = c.replace(
  `html += "<div class='chatCard' data-id='" + room.id + "' data-title='" + (room.job_title||"Chat") + "' data-other='" + (otherEmail||"") + "' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);border-radius:16px;padding:16px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:14px;'>" +
      "<div style='width:46px;height:46px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;'>" + initial + "</div>" +
      "<div style='flex:1;min-width:0;'><p style='color:#fff;font-size:15px;font-weight:600;margin:0 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (room.job_title||"Job Chat") + "</p><p style='color:#a5b4fc;font-size:13px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (otherEmail||"Unknown") + "</p></div>" +
      "<span style='color:#a5b4fc;font-size:22px;'>&#8250;</span></div>"`,
  `html +=
    "<div class='chatCard' data-id='" + room.id + "' data-title='" + (room.job_title||"Chat") + "' data-other='" + (otherEmail||"") + "' style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;cursor:pointer;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:14px;'>" +
      "<div style='width:46px;height:46px;background:var(--primary);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:18px;flex-shrink:0;box-shadow:var(--shadow-green);'>" + initial + "</div>" +
      "<div style='flex:1;min-width:0;'>" +
        "<p style='color:var(--text-primary);font-size:15px;font-weight:700;margin:0 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (room.job_title||"Job Chat") + "</p>" +
        "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>" + (otherEmail||"Unknown") + "</p>" +
        "<span style='background:var(--bg-card-subtle);color:var(--text-muted);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid var(--border);'>" + (room.owner_id===user.id?"Owner":"Worker") + "</span>" +
      "</div>" +
      "<span style='color:var(--text-muted);font-size:22px;'>&#8250;</span>" +
    "</div>"`
)

c = c.replace(
  `html += "<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;'>" +
        "<div style='width:36px;height:36px;background:" + (isCredit?"rgba(52,211,153,0.15)":"rgba(239,68,68,0.15)") + ";border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
          "<span style='font-size:16px;'>" + (isCredit?"&#8593;":"&#8595;") + "</span>" +
        "</div>" +
        "<div style='flex:1;min-width:0;'>" +
          "<p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;'>" + (tx.description||tx.type) + "</p>" +
          "<p style='color:#6b7280;font-size:12px;margin:0;'>" + txDate + "</p>" +
        "</div>" +
        "<p style='color:" + (isCredit?"#34d399":"#f87171") + ";font-size:15px;font-weight:700;margin:0;flex-shrink:0;'>" + (isCredit?"+":"-") + "&#8358;" + Number(tx.amount).toLocaleString() + "</p>" +
      "</div>"`,
  `html +=
    "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:14px;'>" +
      "<div style='width:46px;height:46px;background:" + (isCredit?"rgba(0,194,89,0.10)":"rgba(224,49,49,0.08)") + ";border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid " + (isCredit?"rgba(0,194,89,0.20)":"rgba(224,49,49,0.15)") + ";'>" +
        "<span style='font-size:20px;color:" + (isCredit?"var(--primary)":"var(--danger)") + ";'>" + (isCredit?"&#8593;":"&#8595;") + "</span>" +
      "</div>" +
      "<div style='flex:1;min-width:0;'>" +
        "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 2px;'>" + (tx.description||tx.type) + "</p>" +
        "<p style='color:var(--text-muted);font-size:12px;margin:0;'>" + txDate + "</p>" +
      "</div>" +
      "<p style='color:" + (isCredit?"var(--primary)":"var(--danger)") + ";font-size:15px;font-weight:800;margin:0;flex-shrink:0;'>" + (isCredit?"+":"-") + "&#8358;" + Number(tx.amount).toLocaleString() + "</p>" +
    "</div>"`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('All cards updated. Lines:', c.split('\n').length)
