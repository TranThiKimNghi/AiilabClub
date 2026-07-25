import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const inputPath = path.join(__dirname, '../src/assets/logo.png')
const outputPath = path.join(__dirname, '../src/assets/logo.png')

try {
  // Trim whitespace (any pixel that matches the top-left corner pixel color)
  // threshold: 40 allows slight color differences (anti-aliasing around edges)
  await sharp(inputPath)
    .trim({ threshold: 40 })
    .toFile(outputPath + '.trimmed.png')

  // Overwrite original
  await sharp(outputPath + '.trimmed.png')
    .toFile(outputPath)

  console.log('✅ Logo trimmed and saved successfully!')

  // Get new dimensions
  const metadata = await sharp(outputPath).metadata()
  console.log(`New size: ${metadata.width}x${metadata.height}px`)
} catch (err) {
  console.error('❌ Error:', err)
}
