const Tesseract = require('tesseract.js');

class ImageTextExtractor {
  constructor(imagePath) {
    this.imagePath = imagePath;
  }

  async extractText() {
    try {
      const result = await Tesseract.recognize(
        this.imagePath,
        'eng', // idioma da imagem (pode ser necessário ajustar dependendo do idioma da imagem)
        // { logger: m => console.log(m) } // opcional: para ver logs no console
      );
      console.log('Texto extraído:', result.data.text);
      return result.data.text;
    } catch (error) {
      console.error('Erro ao extrair texto:', error);
      return null;
    }
  }
}

module.exports = ImageTextExtractor



// const Tesseract = require('tesseract.js');

// // Caminho para a imagem que você quer extrair o texto
// const imagePath = './comprovantes/12.jpg';

// // Função para extrair texto da imagem
// async function extractTextFromImage(imagePath) {
//   try {
//     const result = await Tesseract.recognize(
//       imagePath,
//       'eng', // idioma da imagem (pode ser necessário ajustar dependendo do idioma da imagem)
//       { logger: m => console.log(m) } // opcional: para ver logs no console
//     );
//     console.log('Texto extraído:', result.data.text);
//     return result.data.text;
//   } catch (error) {
//     console.error('Erro ao extrair texto:', error);
//     return null;
//   }
// }

// // Chamando a função para extrair texto da imagem
// extractTextFromImage(imagePath);
