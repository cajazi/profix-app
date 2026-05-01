const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

c = c.replace(
  `const { data:jobs } = await supabase.from("jobs").select("*, profiles!jobs_owner_id_fkey(full_name,email)").order("created_at",{ascending:false}).limit(50)`,
  `const { data:jobs } = await supabase.from("jobs").select("*").order("created_at",{ascending:false}).limit(50)`
)

c = c.replace(
  `(job.profiles?.full_name||job.profiles?.email||job.owner_email||"Unknown")`,
  `(job.owner_email||"Unknown")`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Fixed. Lines:', c.split('\n').length)
