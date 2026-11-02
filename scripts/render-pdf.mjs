import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createCanvas } from '@napi-rs/canvas'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const doc = await getDocument({ data: new Uint8Array(readFileSync('leadership-cards-source.pdf')), useSystemFonts: true }).promise
mkdirSync('.card-extraction', { recursive: true })
for (let n = 3; n <= doc.numPages; n++) {
  const page = await doc.getPage(n)
  const viewport = page.getViewport({ scale: 3 })
  const canvas = createCanvas(viewport.width, viewport.height)
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  writeFileSync(`.card-extraction/page-${n}.png`, canvas.toBuffer('image/png'))
  console.log(`Rendered page ${n}`)
}
