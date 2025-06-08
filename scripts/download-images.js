const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  // Hero section
  'hero-image.jpg': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80', // Equipe colaborando
  
  // Testimonials
  'testimonials/ana.jpg': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', // Designer mulher
  'testimonials/carlos.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', // Desenvolvedor homem
  'testimonials/mariana.jpg': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80', // Profissional marketing

  // Categoria Desenvolvimento
  'categories/development.jpg': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', // Código em tela
  
  // Categoria Design
  'categories/design.jpg': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', // Design tools
  
  // Categoria Marketing
  'categories/marketing.jpg': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', // Marketing analytics
  
  // Categoria Escrita
  'categories/writing.jpg': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80', // Escrita criativa

  // Imagens para projetos
  'projects/web-development.jpg': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80',
  'projects/mobile-app.jpg': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  'projects/ui-design.jpg': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
  'projects/content.jpg': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80',

  // Imagens para blog/recursos
  'blog/remote-work.jpg': 'https://images.unsplash.com/photo-1593642532744-d377ab507dc8?w=800&q=80',
  'blog/productivity.jpg': 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&q=80',
  'blog/freelance-tips.jpg': 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&q=80',
  
  // Banners para seções
  'banners/how-it-works.jpg': 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80',
  'banners/for-companies.jpg': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80',
  'banners/for-freelancers.jpg': 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&q=80',
};

async function downloadImage(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const writeStream = fs.createWriteStream(filepath);
        response.pipe(writeStream);
        writeStream.on('finish', () => {
          writeStream.close();
          resolve();
        });
      } else {
        reject(`Failed to download ${url}`);
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('Iniciando download das imagens...');
  
  for (const [filename, url] of Object.entries(images)) {
    const filepath = path.join(__dirname, '../public', filename);
    console.log(`Baixando ${filename}...`);
    try {
      await downloadImage(url, filepath);
      console.log(`✓ ${filename} baixada com sucesso`);
    } catch (error) {
      console.error(`✗ Erro ao baixar ${filename}:`, error);
    }
  }
  
  console.log('Download de imagens concluído!');
}

downloadAllImages(); 