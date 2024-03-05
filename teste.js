function verificarCodigoBoleto(sequencia) {
    var regex = /^[0-9 .\-]+$/;
    var maxCaracteres = 55;
    var maxEspacos = 4;
    var maxNumeros = 47;

    // Verifica o tamanho da sequência
    if (sequencia.length > maxCaracteres) {
        console.log("A sequência excede o limite de 55 caracteres.");
        return;
    }

    // Conta a quantidade de espaços na sequência
    var numEspacos = (sequencia.match(/ /g) || []).length;

    // Conta a quantidade de números na sequência
    var numNumeros = (sequencia.match(/[0-9]/g) || []).length;

    // Verifica se a sequência contém apenas números, pontos, hífens e espaços em branco
    if (!regex.test(sequencia)) {
        console.log("A sequência contém caracteres inválidos.");
        return;
    }

    // Verifica a quantidade de espaços
    if (numEspacos > maxEspacos) {
        console.log("A sequência contém mais de 4 espaços.");
        return;
    }

    // Verifica a quantidade de números
    if (numNumeros > maxNumeros) {
        console.log("A sequência contém mais de 47 números.");
        return;
    }

    // Se passar por todas as verificações, a sequência é válida
    console.log("A sequência é válida.");
}

// Exemplo de uso
// var codigoBoleto = "26090.38126 41636.368254 64100.000005 9 95370000129163"; // Altere para a sequência desejada
var codigoBoleto = "26090311547463456139899100000001796390000002103"; // Altere para a sequência desejada
verificarCodigoBoleto(codigoBoleto);
/*



// Função para verificar se uma sequência corresponde ao padrão de código de boleto
function verificarCodigoBoleto(sequencia) {
    // Expressão regular para corresponder ao padrão de código de boleto
    // var regex = /^[0-9]+$/; // Esta expressão regular considera apenas números
    var regex = /^[0-9 .\-]+$/;
    // var regex = /^(?=(?:[^A-Za-z]*[A-Za-z]){0})(?=(?:\D*\d){47})(?=(?:[^ ]* ){4}).{1,55}$/;


    // Testa se a sequência corresponde ao padrão
    if (regex.test(sequencia)) {
        console.log("É um código de boleto válido.");
    } else {
        console.log("Não é um código de boleto válido.");
    }
}

// Exemplo de uso
var codigoBoleto = "26090.38126 41636.368254 64100.000005 9 95370000129163"; // Altere para a sequência desejada
verificarCodigoBoleto(codigoBoleto);


/*const { Client } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client();

client.on('message', async (message) => {
    // Verifica se a mensagem recebida é de um chat individual
    if (message.from.includes('@c.us')) {
        const sender = message.from.replace('@c.us', ''); // Extrai o número de telefone do remetente
        const filename = `${sender}.txt`; // Cria um nome de arquivo baseado no número do remetente

        try {
            // Verifica se o arquivo já existe
            if (fs.existsSync(filename)) {
                // Se existir, adiciona a nova mensagem ao arquivo
                fs.appendFileSync(filename, `${message.body}\n`);
            } else {
                // Se não existir, cria um novo arquivo e salva a mensagem nele
                fs.writeFileSync(filename, `${message.body}\n`);
            }
            console.log(`Mensagem de ${sender} salva com sucesso.`);
        } catch (err) {
            console.error(`Erro ao salvar a mensagem de ${sender}:`, err);
        }
    }
});

client.initialize();

*/