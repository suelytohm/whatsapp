const Payload = require('./payloadPix');

let total = "R$ 15,00"
total = total.replace("R", "")
total = total.replace("$", "")
total = total.replace(" ", "")
total = total.replace(",", ".")
total = parseFloat(total).toFixed(2)

const payloadInstance = new Payload('ROSENILDO SUELYTOHM DE OL', "617ea695-815b-4593-94b8-a924a560443b", Math.abs(total).toString(), 'SAO PAULO', 'deposito');
console.log(payloadInstance.gerarPayload());