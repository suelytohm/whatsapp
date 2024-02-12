const ImageResizer = require('./ImageResizer');
const ImageTextExtractor = require('./ImageTextExtractor');
const path = require('path');



const fileName = "558791087013@c.us-1707701278835.jpeg"
const imagePath = path.join(__dirname, 'comprovantes/pix/original/', fileName);
const outputPath = path.join(__dirname, 'comprovantes/pix/redimensionado/', 'example_resized.jpg');

// Instancia a classe ImageResizer com o caminho da imagem de entrada
const imageResizer = new ImageResizer(imagePath);

// Chama o método resizeAndSave para redimensionar e salvar a imagem
imageResizer.resizeAndSave(outputPath)
  .then(async outputPath => {
    console.log('Imagem redimensionada e salva em:', outputPath);
    const extractor = new ImageTextExtractor(outputPath);
    const extractedText = await extractor.extractText();

    if (extractedText && extractedText.includes("XBWZHY")) {
        console.log("COMPROVANTE AUTENTICADO ✔")
    }
  })
  .catch(err => {
    console.error('Erro ao redimensionar e salvar a imagem:', err);
  });
