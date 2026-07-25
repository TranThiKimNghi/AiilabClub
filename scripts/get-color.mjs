import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inputPath = path.join(__dirname, '../src/assets/logo.png')

const meta = await sharp(inputPath).metadata()
console.log(`Image size: ${meta.width}x${meta.height}`)

// Sample the full bottom 35% of the image (where AiiLab text is)
const textTop = Math.floor(meta.height * 0.65)
const regionH = meta.height - textTop

const { data } = await sharp(inputPath)
  .extract({ left: 0, top: textTop, width: meta.width, height: regionH })
  .raw()
  .toBuffer({ resolveWithObject: true })

// Count all dark blue pixels (low R, low G, high B - "pure blue" family)
const colorCount = {}
for (let i = 0; i < data.length; i += meta.channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  // Only count pixels that are strongly blue (B is dominant, R and G are low)
  if (b > 100 && r < b * 0.4 && g < b * 0.4) {
    // Round to nearest 4 to group similar colors
    const rr = Math.round(r / 4) * 4
    const gg = Math.round(g / 4) * 4
    const bb = Math.round(b / 4) * 4
    const hex = `#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`
    colorCount[hex] = (colorCount[hex] || 0) + 1
  }
}

const sorted = Object.entries(colorCount).sort((a, b) => b[1] - a[1])
console.log('\n✅ Most common blue colors in text area (grouped):')
sorted.slice(0, 15).forEach(([hex, count]) => {
  console.log(`  ${hex}  →  ${count} pixels`)
})
console.log('\n🎯 Best match (most common):', sorted[0]?.[0])
