const fs = require('fs');
const pdf = require('pdf-parse');

class PdfTextExtractor {
    constructor(pdfPath){
        this.pdfPath = pdfPath;
    }

    async extractText(){
        try {
            let dataBuffer = fs.readFileSync(this.pdfPath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PdfTextExtractor;


// const fs = require('fs');
// const pdf = require('pdf-parse');

// class PdfTextExtractor {
//     constructor(pdfPath){
//         this.pdfPath = pdfPath
//     }

//     async extractText(){
//         try {
//             // const pdfFilePath = './comprovantes/Fatura2.pdf';
//             // const pdfFilePath = './comprovantes/suelytohm_boleto_deposito_05_01_2024_14.05.02.pdf';
//             let dataBuffer = fs.readFileSync(pdfPath);
             
//             pdf(dataBuffer).then(function(data) {
//                 console.log(data.text);
//                 return data.text
//             });            
//         } catch (error) {
//             return error
//         }
//     }
// }
// module.exports = PdfTextExtractor