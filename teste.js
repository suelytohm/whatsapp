const ImageTextExtractor = require('./ImageTextExtractor');

let convertida = "C:\\Users\\suely\\Desktop\\nodejs\\whatsapp-web\\comprovantes\\pix\\redimensionado\\558791087013@c.us-1707683802.jpeg";
// let convertida = "C:\\Users\\suely\\Desktop\\nodejs\\whatsapp-web\\comprovantes\\pix\\redimensionado\\558791087013@c.us-1707682294.jpeg";

(async () => {
    const extractor = new ImageTextExtractor(convertida);
    const extractedText = await extractor.extractText();

    if (extractedText && extractedText.includes("LWBXOK")) {
        console.log("A imagem contém o identificador correto: LWBXOK");
    } else {
        console.log("Não contém o identificador correto");
    }
})();
