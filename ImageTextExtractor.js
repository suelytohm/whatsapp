const Tesseract = require('tesseract.js');
class ImageTextExtractor {
  constructor(imagePath) {
    this.imagePath = imagePath;
  }

  async extractText() {
    try {
      const result = await Tesseract.recognize(
        this.imagePath,
        'eng', // Inglês, Chinês ou Russo
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