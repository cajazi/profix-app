const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// Close job when contract becomes active after payment
c = c.replace(
  `.then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id) })`,
  `.then(function() { return supabase.from("contracts").update({ status: "active", funded_at: new Date().toISOString() }).eq("id", contract.id) })
        .then(function() { return supabase.from("jobs").update({ status: "closed" }).eq("id", contract.job_id) })`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
