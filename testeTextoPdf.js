
const fs = require('fs');
const pdf = require('pdf-parse');

const pdfFilePath = './comprovantes/suelytohm_boleto_deposito_05_01_2024_14.05.02.pdf';
let dataBuffer = fs.readFileSync(pdfFilePath);
 
pdf(dataBuffer).then(function(data) {
    console.log(data.text);
});