const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

// Create a purple gradient SVG icon with wrench
const svgIcon = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#bg)"/>
  <text x="512" y="620" font-size="580" text-anchor="middle" fill="white">🔧</text>
  <text x="512" y="850" font-size="120" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial" font-weight="bold">ProFix</text>
</svg>`

const sizes = {
  "android/app/src/main/res/mipmap-mdpi":    48,
  "android/app/src/main/res/mipmap-hdpi":    72,
  "android/app/src/main/res/mipmap-xhdpi":   96,
  "android/app/src/main/res/mipmap-xxhdpi":  144,
  "android/app/src/main/res/mipmap-xxxhdpi": 192,
}

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon)
  for (const [dir, size] of Object.entries(sizes)) {
    const resized = await sharp(svgBuffer).resize(size, size).png().toBuffer()
    fs.writeFileSync(path.join(dir, "ic_launcher.png"), resized)
    fs.writeFileSync(path.join(dir, "ic_launcher_round.png"), resized)
    console.log("Generated " + size + "x" + size + " icon in " + dir)
  }
  // Also generate foreground icons (larger for adaptive icons)
  for (const [dir, size] of Object.entries(sizes)) {
    const fgSize = Math.round(size * 1.5)
    const resized = await sharp(svgBuffer).resize(fgSize, fgSize).png().toBuffer()
    fs.writeFileSync(path.join(dir, "ic_launcher_foreground.png"), resized)
  }
  console.log("All icons generated successfully!")
}

generateIcons().catch(console.error)
