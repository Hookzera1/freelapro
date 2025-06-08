const sharp = require('sharp');
const path = require('path');

const ICONS_DIR = path.join(process.cwd(), 'public');

async function generateIcons() {
  try {
    // Criar um ícone base azul com as iniciais FP
    const size = 512;
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#3b82f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial" font-weight="bold" font-size="${size/2}px">
          FP
        </text>
      </svg>
    `;

    // Gerar os diferentes tamanhos
    const sizes = [
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'favicon.ico', size: 32 }
    ];

    for (const { name, size } of sizes) {
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .toFile(path.join(ICONS_DIR, name));
    }

    console.log('✅ Ícones gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons(); 