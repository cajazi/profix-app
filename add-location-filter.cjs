const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

// Add location input after search bar
code = code.replace(
  `"<div style='position:relative;margin-bottom:12px;'>" +
        "<input id='workerSearch' type='text' placeholder='Search workers by name or skill...' style='width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#ffffff;font-size:15px;outline:none;box-sizing:border-box;' />" +
      "</div>"`,
  `"<div style='position:relative;margin-bottom:10px;'>" +
        "<input id='workerSearch' type='text' placeholder='Search workers by name or skill...' style='width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#ffffff;font-size:15px;outline:none;box-sizing:border-box;' />" +
      "</div>" +
      "<div style='position:relative;margin-bottom:12px;'>" +
        "<span style='position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;'>&#128205;</span>" +
        "<input id='locationFilter' type='text' placeholder='Filter by city e.g. Lagos, Abuja...' style='width:100%;padding:12px 14px 12px 40px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);color:#111827;background:#ffffff;font-size:15px;outline:none;box-sizing:border-box;' />" +
      "</div>"`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Location filter input added")
