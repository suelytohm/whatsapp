const Payload = require('./payloadPix');
const Identificador = require('./Identificador');

let total = "R$ 1,00"
total = total.replace("R", "")
total = total.replace("$", "")
total = total.replace(" ", "")
total = total.replace(",", ".")
total = parseFloat(total).toFixed(2)

let a = new Identificador()
let idPagamento = a.gerarLetrasAleatorias();

console.log(idPagamento)

const payloadInstance = new Payload('ROSENILDO SUELYTOHM DE OL', "617ea695-815b-4593-94b8-a924a560443b", Math.abs(total).toString(), 'SAO PAULO', idPagamento);
console.log(payloadInstance.gerarPayload());