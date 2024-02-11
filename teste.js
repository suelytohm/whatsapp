const sharp = require('sharp');

// Caminho para a imagem original
const imagePath = './comprovantes/2.jpeg';

// Caminho para salvar a imagem redimensionada
const outputPath = './comprovantes/3.jpg';

// Dimensões desejadas para a imagem redimensionada
const width = 1440;
const height = 4164;

// Redimensionamento da imagem
sharp(imagePath)
  .resize(width, height)
  .toFile(outputPath, (err, info) => {
    if (err) {
      console.error('Erro ao redimensionar a imagem:', err);
    } else {
      console.log('Imagem redimensionada com sucesso:', info);
    }
  });
