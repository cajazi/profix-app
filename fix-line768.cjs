const fs = require("fs")
const lines = fs.readFileSync("src/main.js", "utf8").split("\n")
lines[767] = "  toast.innerHTML=\"<span style='font-size:22px;flex-shrink:0;'>\"+icon+\"</span><div style='flex:1;min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;'>\"+title+\"</p><p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>\"+(body||\"\")+\"</p></div><button onclick=\\\"document.getElementById('toastNotif').remove()\\\" style='background:none;border:none;color:#6b7280;cursor:pointer;font-size:18px;padding:0;flex-shrink:0;line-height:1;'>&#10005;</button>\""
fs.writeFileSync("src/main.js", lines.join("\n"), "utf8")
console.log("Done. Line 768 fixed.")
console.log("New line 768:", lines[767].substring(0, 80))
