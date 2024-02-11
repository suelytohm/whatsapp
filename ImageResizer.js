const sharp = require('sharp');

class ImageResizer {
  constructor(imagePath) {
    this.imagePath = imagePath;
  }

  resizeAndSave(outputPath) {
    sharp(this.imagePath)
      .metadata()
      .then(metadata => {
        let height = metadata.height * 5;
        let width = metadata.width * 5;
        sharp(this.imagePath)
          .resize(width, height)
          .toFile(outputPath, (err, info) => {
            if (err) {
              console.error('Erro ao redimensionar a imagem:', err);
            } else {
              console.log('Imagem redimensionada com sucesso:', info);
              return outputPath
            }
          });
      })
      .catch(err => {
        console.error('Erro ao acessar os metadados da imagem:', err);
      });
  }
}


module.exports = ImageResizer
// Exemplo de utilização