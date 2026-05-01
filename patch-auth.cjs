const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

const HELPERS = `
function getDeviceId() {
  let id = localStorage.getItem('profix_device_id')
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('profix_device_id', id)
  }
  return id
}
async function sha256pin(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}
async function isTrustedDevice(profile) {
  const id = getDeviceId()
  const devices = profile.trusted_devices || []
  return devices.includes(id)
}
async function trustDevice(userId) {
  const id = getDeviceId()
  const { data: p } = await supabase.from('profiles').select('trusted_devices').eq('id', userId).single()
  const devices = p?.trusted_devices || []
  if (!devices.includes(id)) { devices.push(id); await supabase.from('profiles').update({ trusted_devices: devices }).eq('id', userId) }
}
`

c = c.replace('function showLogin()', HELPERS + '\nfunction showLogin()')
fs.writeFileSync('src/main.js', c, 'utf8')
console.log('Helpers added. Lines:', c.split('\n').length)
