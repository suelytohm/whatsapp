function validarNumeroBoleto(boleto) {
    // Expressão regular para verificar se o boleto contém apenas números, pontos, espaços e traços
    var regex = /^[0-9 .-]+$/;
    
    // Verifica se o boleto corresponde à expressão regular
    if (regex.test(boleto)) {
        return true; // Boleto válido
    } else {
        return false; // Boleto inválido
    }
}

// Exemplo de uso
var numeroBoleto = "26090.38126 41636.368254 64100.000005 9 95370000129163a";
if (validarNumeroBoleto(numeroBoleto)) {
    console.log("Número de boleto válido!");
} else {
    console.log("Número de boleto inválido!");
}