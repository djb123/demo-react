import { createWorker, PSM } from 'tesseract.js'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'node:fs'

mkdirSync('.card-extraction', { recursive: true })
const workers = await Promise.all([0, 1].map(() => createWorker('eng', 1, { cachePath: '.card-extraction' })))
await Promise.all(workers.map(w => w.setParameters({ tessedit_pageseg_mode: PSM.AUTO })))
let nextPage = 4
await Promise.all(workers.map(async worker => {
  while (nextPage <= 29) {
    const n = nextPage++
    const source = await loadImage(`.card-extraction/page-${n}.png`)
    const sides = []
    for (const row of [0, 1]) for (const col of [0, 1]) {
      const x = Math.round(source.width * (col ? .52 : .075))
      const y = Math.round(source.height * (row ? .509 : .041))
      const width = Math.round(source.width * .408)
      const height = Math.round(source.height * .451)
      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source, x, y, width, height, 0, 0, width, height)
      const pixels = ctx.getImageData(0, 0, width, height)
      for (let py = 0; py < height; py++) {
        let colors = 0
        for (let px = 0; px < width; px++) {
          const i = (py * width + px) * 4
          const values = [...pixels.data.slice(i, i + 3)]
          if (Math.max(...values) - Math.min(...values) > 60) colors++
        }
        for (let px = 0; px < width; px++) {
          const i = (py * width + px) * 4
          const values = [...pixels.data.slice(i, i + 3)]
          const max = Math.max(...values), min = Math.min(...values)
          const colored = max - min > 60
          const ink = colored ? colors < width * .45 : max > 130
          pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = ink ? 0 : 255
        }
      }
      ctx.putImageData(pixels, 0, 0)
      const png = canvas.toBuffer('image/png')
      writeFileSync(`.card-extraction/${n}-${row}-${col}.png`, png)
      const { data } = await worker.recognize(png)
      sides.push(data.text)
    }
    writeFileSync(`.card-extraction/page-${n}.json`, JSON.stringify(sides, null, 2))
    console.log(`Extracted page ${n}\n${sides.join('\n---\n')}`)
  }
  await worker.terminate()
}))
