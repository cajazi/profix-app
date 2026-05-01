const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")
const oldToast = `toast.innerHTML="<span style='font-size:22px;flex-shrink:0;'>"+icon+"</span><div style='flex:1;min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;'>"+title+"</p><p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+(body||"")+"</p></div><button onclick="document.getElementById('toastNotif').remove()" style='background:none;border:none;color:#6b7280;cursor:pointer;font-size:18px;padding:0;flex-shrink:0;line-height:1;'>&#10005;</button>"`
const newToast = `toast.innerHTML="<span style='font-size:22px;flex-shrink:0;'>"+icon+"</span><div style='flex:1;min-width:0;'><p style='color:#fff;font-size:14px;font-weight:600;margin:0 0 2px;'>"+title+"</p><p style='color:#a5b4fc;font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+(body||"")+"</p></div><button onclick=\\"document.getElementById('toastNotif').remove()\\" style='background:none;border:none;color:#6b7280;cursor:pointer;font-size:18px;padding:0;flex-shrink:0;line-height:1;'>&#10005;</button>"`
if (code.includes(oldToast)) {
  code = code.replace(oldToast, newToast)
  console.log("Fixed toast button")
} else {
  console.log("Pattern not found")
}
fs.writeFileSync("src/main.js", code, "utf8")
