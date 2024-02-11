
const fs = require('fs');
const pdf = require('pdf-parse');

const pdfFilePath = './comprovantes/Fatura2.pdf';
// const pdfFilePath = './comprovantes/suelytohm_boleto_deposito_05_01_2024_14.05.02.pdf';
let dataBuffer = fs.readFileSync(pdfFilePath);
 
pdf(dataBuffer).then(function(data) {
    console.log(data.text);
});


// 07790.00116 01001.305208 87751.199917 3 00000000000000
// 10498.37030 97009.115045 00009.352816 1 95640000024691