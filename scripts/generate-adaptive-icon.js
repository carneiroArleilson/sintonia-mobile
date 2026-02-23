/**
 * Gera adaptive-icon.png com o logo centralizado na zona segura (66%),
 * evitando que o ícone seja cortado nas bordas no Android.
 * Uso: node scripts/generate-adaptive-icon.js
 */
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const inputPath = path.join(assetsDir, 'sintonia-icon.png');
const outputPath = path.join(assetsDir, 'adaptive-icon.png');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Instale sharp: npm install --save-dev sharp');
    process.exit(1);
  }

  const safeRatio = 66 / 108; // zona segura = 66dp de 108dp
  const size = 1024;
  const safeSize = Math.round(size * safeRatio); // ~672

  // Redimensiona o ícone para caber na zona segura e centraliza em 1024x1024
  const scaled = await sharp(inputPath)
    .resize(safeSize, safeSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const left = Math.round((size - safeSize) / 2);
  const top = Math.round((size - safeSize) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: scaled, left, top }])
    .png()
    .toFile(outputPath);

  console.log('adaptive-icon.png gerado em assets/ com zona segura (66%).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
