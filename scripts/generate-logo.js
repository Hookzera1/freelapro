const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/logo.svg'));

// Gerar logo.png para o manifest
sharp(svgBuffer)
  .resize(192, 192)
  .png()
  .toFile(path.join(__dirname, '../public/logo.png'))
  .then(() => console.log('Logo PNG gerada com sucesso!'))
  .catch(err => console.error('Erro ao gerar logo:', err)); 