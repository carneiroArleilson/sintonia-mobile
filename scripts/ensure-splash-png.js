/**
 * Converte assets/logo.png (ou WebP) para assets/splash-logo.png em PNG.
 * O prebuild do Expo usa Jimp, que não suporta WebP; usar PNG evita o erro.
 * Rode antes de: npx expo prebuild --clean
 * Uso: node scripts/ensure-splash-png.js
 */
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, '..', 'assets');
const inputPath = path.join(assetsDir, 'logo.png');
const outputPath = path.join(assetsDir, 'splash-logo.png');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Instale sharp: npm install --save-dev sharp');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error('Arquivo não encontrado: assets/logo.png');
    process.exit(1);
  }

  await sharp(inputPath)
    .png()
    .toFile(outputPath);

  console.log('assets/splash-logo.png gerado (PNG) a partir de logo.png.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
