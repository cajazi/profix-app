const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

code = code.replace(
  `"<h2 style='color:#fff;font-size:20px;font-weight:700;margin:0 0 4px;'>"+(profile.full_name||"No name yet")+"</h2>" +
      "<p style='color:#a5b4fc;font-size:13px;margin:0 0 8px;'>"+(profile.email||"")+"</p>"`,
  `"<h2 style='color:#fff;font-size:20px;font-weight:700;margin:0 0 4px;'>"+(profile.full_name||"No name yet")+"</h2>" +
      "<p style='color:#a5b4fc;font-size:13px;margin:0 0 6px;'>"+(profile.email||"")+"</p>" +
      (profile.total_reviews>0?"<p style='color:#fbbf24;font-size:14px;margin:0 0 8px;'>&#11088; "+Number(profile.rating).toFixed(1)+" <span style='color:#a5b4fc;font-size:12px;'>("+profile.total_reviews+" review"+(profile.total_reviews===1?"":"s")+")</span></p>":"<p style='color:#6b7280;font-size:12px;margin:0 0 8px;'>No reviews yet</p>")`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Rating added to profile view")
