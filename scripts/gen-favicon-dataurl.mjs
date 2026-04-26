import fs from 'fs'
const svg = fs.readFileSync('src/ifk-favicon.svg', 'utf8').trim().replace(/\s+/g, ' ')
process.stdout.write('data:image/svg+xml,' + encodeURIComponent(svg))
