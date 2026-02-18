#!/usr/bin/env node
/**
 * Copia a logo do backoffice para o mobile.
 * Uso (a partir da raiz do repo sintonia): node sintonia-mobile/scripts/copy-logo.js
 * Ou, dentro de sintonia-mobile: node scripts/copy-logo.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const backofficeLogo = path.join(repoRoot, 'sintonia-backoffice', 'public', 'assets', 'logo.png');
const mobileLogo = path.join(repoRoot, 'sintonia-mobile', 'assets', 'logo.png');
const mobileIcon = path.join(repoRoot, 'sintonia-mobile', 'assets', 'icon.png');

if (fs.existsSync(backofficeLogo)) {
  fs.copyFileSync(backofficeLogo, mobileLogo);
  console.log('OK: logo copiada de sintonia-backoffice/public/assets/logo.png para sintonia-mobile/assets/logo.png');
} else if (fs.existsSync(mobileIcon)) {
  fs.copyFileSync(mobileIcon, mobileLogo);
  console.log('AVISO: logo.png não encontrada no backoffice. Copiado icon.png para logo.png (use a logo real quando tiver).');
} else {
  console.error('ERRO: Coloque logo.png em sintonia-backoffice/public/assets/ ou em sintonia-mobile/assets/');
  process.exit(1);
}
