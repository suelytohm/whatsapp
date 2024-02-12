require('dotenv').config()
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const io = require('socket.io-client');
const path = require('path');

const Payload = require('./payloadPix');
const Identificador = require('./Identificador');
const ImageResizer = require('./ImageResizer');
const ImageTextExtractor = require('./ImageTextExtractor');


const axios = require('axios').default;
const wservice = "https://test-boletos.onrender.com";


let objeto = {}

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'celcoin3'
    })
});
 

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
    console.log('Scan the QR Code to log in.');
});

client.on('authenticated', (session) => {
    console.log('Authenticated');
});

async function sleep(miliseconds) {
    return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function dataAtual(){
    const data = new Date();
    let dia = String(data.getDate()).padStart(2, '0');
    let mes = String(data.getMonth() + 1).padStart(2, '0');
    let ano = data.getFullYear();

    let hora = String(data.getHours()).padStart(2, '0');
    let minutos = String(data.getMinutes()).padStart(2, '0');

    return "Mensagem enviada " + dia + "/" + mes + "/" + ano + " as " + hora + ":" + minutos + "hrs";
}

async function enviarComprovante(numeroDestinatario, user, nomeComprovante, datapagamento, valor, tipoPagamento){
    let caminhoArquivo = "";
    if(process.env.SO == 'windows'){
        caminhoArquivo = `C:\\Users\\suely\\Desktop\\python\\celcoin\\comprovantes\\${nomeComprovante}`;
    } else {
        caminhoArquivo = `/home/suelytohm/Desktop/scripts/comprovantes/${nomeComprovante}`;
    }

    const mensagem = `Olá ${capitalize(user)}, aqui está o seu comprovante! \n\n${tipoPagamento}\nData do pagamento: ${datapagamento}\nValor: R$ ${valor} \n\n${dataAtual()}`
    const media = MessageMedia.fromFilePath(caminhoArquivo);

    client.sendMessage(`55${numeroDestinatario}@c.us`, media, { caption: mensagem }) // ----------------------------- VERIFICAR VALIDAÇÃO DO NÚMERO
    .then(() => {
        sleep(5000);
        console.log('Arquivo enviado com sucesso!');
        return true
    })
    .catch((error) => {
        console.error('Erro ao enviar arquivo:', error);
        return error
    });
}


async function consultaSaldo(numero){
    try {
        const response = await axios.get(wservice + '/user/telefone/' + numero);
        return response.data[0];
    } catch (error) {
        console.log(error);
        return null; // ou lança uma exceção, dependendo do comportamento desejado
    }
}


function formatarValor(numero){
    return numero.toFixed(2).replace(".", ","); // Substitui o ponto pela vírgula
}


function verificarNumero(telefone){

    if(telefone.includes("@")){
        return telefone
    }

    let numero = "";

    if(telefone.length == 11){
        let numeroFim = telefone.substring(3, telefone.length)
        let numeroInicio = telefone.substring(0, 2)
        numero = `${numeroInicio}${numeroFim}`;
    } else {
        numero = telefone
    }
    return `55${numero}@c.us`
}

async function receberPix(telefone, valor){
    let a = new Identificador()
    let idPagamento = a.gerarLetrasAleatorias();

    await client.sendMessage(verificarNumero(telefone), `Copie o código abaixo e deposite via pix:`);
    const payloadInstance = new Payload('ROSENILDO SUELYTOHM DE OL', "617ea695-815b-4593-94b8-a924a560443b", Math.abs(valor).toString(), 'SAO PAULO', idPagamento);
    await client.sendMessage(verificarNumero(telefone), payloadInstance.gerarPayload());        
    // await client.sendMessage(message.from, `Você confirma que o depósito foi realizado?`);
    await client.sendMessage(verificarNumero(telefone), `⚠ Envie o comprovante da transferência após a realização do pagamento`);

    objeto = {
        tipo: 'deposito',
        numero: verificarNumero(telefone),
        passo: 2,
        valor: Math.abs(valor),
        idPagamento: idPagamento
    }
}


client.on('message', async (message) => {
    const obj = await consultaSaldo(message.from);

    if ((message.body === 'saldo') || (message.body === 'Saldo')) {
        if (obj && message.from === verificarNumero(obj.telefone)) {
            await message.reply(`Seu saldo é: R$ ${formatarValor(obj.saldo)}`);
        } else {
            console.log('Erro ao obter dados do banco de dados');
        }
        objeto = {}
    }
});


client.on('message', async (message) => {
    if(message.body == 'Sair'){
        await message.reply(`Atendimento finalizado!`);
        objeto = {}
    }
})


client.on('message', async (message) => {
    if(message.body === 'Depositar') {
        await message.reply(`Qual o valor que você deseja depositar?`);
        
        objeto = {
            tipo: 'deposito',
            numero: message.from,
            passo: 1,
        }
    }
    
    else if((objeto.tipo == 'deposito') && (objeto.passo == 1)){
        let total = message.body // parseFloat
        total = total.replace("R", "")
        total = total.replace("$", "")
        total = total.replace(" ", "")
        total = total.replace(",", ".")
        total = parseFloat(total).toFixed(2)


        receberPix(message.from, Math.abs(total))

        // let a = new Identificador()
        // let idPagamento = a.gerarLetrasAleatorias();

        // await client.sendMessage(message.from, `Copie o código abaixo e deposite via pix:`);
        // const payloadInstance = new Payload('ROSENILDO SUELYTOHM DE OL', "617ea695-815b-4593-94b8-a924a560443b", Math.abs(total).toString(), 'SAO PAULO', idPagamento);
        // await client.sendMessage(message.from, payloadInstance.gerarPayload());        
        // // await client.sendMessage(message.from, `Você confirma que o depósito foi realizado?`);
        // await client.sendMessage(message.from, `⚠ Envie o comprovante da transferência após a realização do pagamento`);

        // objeto = {
        //     tipo: 'deposito',
        //     numero: message.from,
        //     passo: 2,
        //     valor: Math.abs(total),
        //     idPagamento: idPagamento
        // }
    }

    else if((objeto.tipo == 'deposito') && (objeto.passo == 2)){
        if (message.hasMedia && message.type === 'image') {
            const obj = await consultaSaldo(message.from);
            await client.sendMessage(message.from, `Aguarde um instante enquanto verificamos as informações...`);

            try {
                (async () => {
                    const media = await message.downloadMedia();
                    let ms = Date.now()
                    const fileName = `${message.from}-${ms}.${media.mimetype.split('/')[1]}`;
                    const filePath = path.join(__dirname, 'comprovantes/pix/original/', fileName);
                    fs.writeFileSync(filePath, media.data, 'base64');
                    console.log(`Imagem salva como: ${filePath}`);
                    
                    //let ar = Aumentar Resolução(filePath)
                    const imagePath = filePath;
                    const outputPath = path.join(__dirname, 'comprovantes/pix/redimensionado/', fileName);
                    const resizer = new ImageResizer(imagePath);
                    let convertida = await resizer.resizeAndSave(outputPath);
            
                    // console.log("Valor convertida: " + convertida)    
                    console.log("Imagem convertida: " + convertida)
            
                    let caminhoArquivo = "";
            
                    // Exemplo de instanciação e uso da classe
                    if(process.env.SO == 'windows'){
                        caminhoArquivo = `C:\\Users\\suely\\Desktop\\nodejs\\whatsapp-web\\comprovantes\\pix\\redimensionado\\${fileName}`;
                        
                    } else {
                        caminhoArquivo = `/home/suelytohm/Desktop/scripts/comprovantes/${fileName}`; // ----------------------- ALTERAR DEPOIS ----------------
                    }
        
                
                    setTimeout(async () => {
                        
                        const extractor = new ImageTextExtractor(caminhoArquivo);
                        const extractedText = await extractor.extractText();
                    
                        if (extractedText && extractedText.includes(objeto.idPagamento)) {
                            console.log("A imagem contém o identificador correto: " + objeto.idPagamento);
            
                            const obj = await consultaSaldo(message.from);
                            let saldoAtual = obj.saldo + objeto.valor;
    
                            let idUser = obj.id;
    
                            axios.put(`https://test-boletos.onrender.com/atualizarSaldo/${idUser}`, { saldoatualizado: saldoAtual }).then( async () => {
                                await client.sendMessage(message.from, `✔ Tudo certo! Seu saldo é R$ ${parseFloat(saldoAtual).toFixed(2)}`);
                            })
    
                            objeto = {}
    
                        } else {
                            console.log("A string não contém o identificador correto: " + objeto.idPagamento);
                            await client.sendMessage(message.from, `❌ Desculpe, mas ocorreu um erro. Verifique o comprovante e tente novamente!`);

                        }
                    }, 4000);
    
                })();
            } catch (error) {
                console.error('Erro ao salvar a imagem:', error);
            }
        }
    }
});

/*
client.on('message', async (message) => {
    if (message.hasMedia && message.type === 'image' && objeto == {}) {
        try {
            (async () => {
                const media = await message.downloadMedia();
                const fileName = `${message.from}-${message.timestamp}.${media.mimetype.split('/')[1]}`;
                const filePath = path.join(__dirname, 'comprovantes/pix/original/', fileName);
                fs.writeFileSync(filePath, media.data, 'base64');
                console.log(`Imagem salva como: ${filePath}`);
                
                //let ar = Aumentar Resolução(filePath)
                const imagePath = filePath;
                const outputPath = path.join(__dirname, 'comprovantes/pix/redimensionado/', fileName);
                const resizer = new ImageResizer(imagePath);
                let convertida = await resizer.resizeAndSave(outputPath);
        
                // console.log("Valor convertida: " + convertida)    
                console.log("Imagem convertida: " + convertida)
        
                let caminhoArquivo = "";
        
                // Exemplo de instanciação e uso da classe
                if(process.env.SO == 'windows'){
                    caminhoArquivo = `C:\\Users\\suely\\Desktop\\nodejs\\whatsapp-web\\comprovantes\\pix\\redimensionado\\${fileName}`;
                    
                } else {
                    caminhoArquivo = `/home/suelytohm/Desktop/scripts/comprovantes/${fileName}`; // ----------------------- ALTERAR DEPOIS ----------------
                }
    
            
                setTimeout(async () => {
                    
                    const extractor = new ImageTextExtractor(caminhoArquivo);
                    const extractedText = await extractor.extractText();
                
                    if (extractedText && extractedText.includes("KZYBSH")) {
                        console.log("A imagem contém o identificador correto: " + "KZYBSH");
        
                        const obj = await consultaSaldo(message.from);
                        let saldoAtual = obj.saldo + objeto.valor;

                        let idUser = obj.id;

                        axios.put(`https://test-boletos.onrender.com/atualizarSaldo/${idUser}`, { saldoatualizado: saldoAtual }).then( async () => {
                            await client.sendMessage(message.from, `Seu saldo é R$ ${parseFloat(saldoAtual).toFixed(2)}`);
                        })

                        objeto = {}

                    } else {
                        console.log("A string não contém o identificador correto: " + "KZYBSH");
                    }
                }, 3000);

            })();
        } catch (error) {
            console.error('Erro ao salvar a imagem:', error);
        }
    }
})
*/


client.on('message', async (message) => {
    if((objeto.tipo === "boleto") && (message.body === 'Pagar boleto') || (message.body === 'pagar boleto') || (message.body === 'Boleto') || (message.body === 'boleto') || (message.body === 'PAGAR BOLETO')) {
        objeto = {
            tipo: 'boleto',
            numero: message.from,
            passo: 1,
        }
        await client.sendMessage(message.from, `Informe o valor a ser pago`);
    }

    else if((objeto.tipo === "boleto") &&(message.from == objeto.numero) && (objeto.passo == 1)){

        const obj = await consultaSaldo(message.from);
        let total = message.body // parseFloat

        total = total.replace("R", "")
        total = total.replace("$", "")
        total = total.replace(" ", "")
        total = total.replace(",", ".")
        total = parseFloat(total).toFixed(2)

        let restante = obj.saldo - total

        if(obj.saldo - total < 0){
            // restante = Math.abs(restante)
        }

        objeto = {
            tipo: 'boleto',
            numero: message.from,
            passo: 2,
            totalBoleto: total,
            restante: restante
        }

        if(restante < 0){
            await client.sendMessage(message.from, `Seu saldo é: R$ ${formatarValor(obj.saldo)}, Copie o código abaixo e deposite o restante via pix:`);

            const payloadInstance = new Payload('ROSENILDO SUELYTOHM DE OL', "617ea695-815b-4593-94b8-a924a560443b", Math.abs(restante).toString(), 'SAO PAULO', 'deposito');

            await client.sendMessage(message.from, payloadInstance.gerarPayload());
            await client.sendMessage(message.from, `Você confirma que o depósito foi realizado?`);

        } else {
            objeto = {
                tipo: 'boleto',
                numero: message.from,
                passo: 2,
            }
            // await client.sendMessage(message.from, `Deseja prosseguir com o pagamento?`);
            await client.sendMessage(message.from, `Seu saldo agora é: R$ ${formatarValor(obj.saldo)}, Deseja realizar o pagamento agora?`);
        }
    }

    else if((objeto.tipo === "boleto") &&(message.from == objeto.numero) && (objeto.passo == 2)){
        const obj = await consultaSaldo(message.from);
        // await client.sendMessage(message.from, `Seu saldo é: R$ ${formatarValor(obj.saldo)}, Deseja realizar o pagamento agora?`);
    }
    
    // Continuar com pagamento
    else if((objeto.tipo === "boleto") &&(message.from == objeto.numero) && (objeto.passo == 4)){
        await client.sendMessage(message.from, 'Deseja prosseguir com o pagamento?')
    }

    // Tipo
    else if((objeto.tipo === "boleto") &&(message.from == objeto.numero) && (objeto.passo == 5)){
        await client.sendMessage(message.from, 'Informe o tipo de boleto: \n\n1 - Cartão\n2 - Celpe\n3 - Compesa\n4 - Depósito\n5 - Financiamento\n6 - Internet/Celular\n7 - Outro')
    }
    
    // Números
    else if((objeto.tipo === "boleto") &&(message.from == objeto.numero) && (objeto.passo == 6)){
        await client.sendMessage(message.from, 'Informe os números do boleto')
    }

    // Envio
    else if((objeto.tipo === "boleto") &&(message.from == objeto.numero) && (objeto.passo == 7)){
        await client.sendMessage(message.from, 'Tudo certo! Aguarde que estamos realizando o pagamento, em breve o seu comprovante estará disponível!')
    }

});


client.on('message', async (msg) => {
    if (msg.body === '!send-media') {

        const produto = {
            nome: "Jogo de Taças de Vidro 330ml 6 Peças Haus",
            preco: "R$ 67,80 no Pix",
            link: "https://www.magazinevoce.com.br/magazineazuk3/jogo-de-tacas-de-vidro-330ml-6-pecas-haus-bico-de-jaca-empire/p/142270300/ud/taag/",
            img: "https://a-static.mlcdn.com.br/800x560/jogo-de-tacas-de-vidro-330ml-6-pecas-haus-bico-de-jaca-empire/magazineluiza/142270300/6794c56b24cb273f4637ccf2a1cad818.jpg"
        }
        
        const media = await MessageMedia.fromUrl(`${produto.img}`);
        await client.sendMessage(msg.from, media, { caption: `\n\n${produto.nome}\n\n🔥 POR APENAS ${produto.preco}!! 😱\n\n⬇️ Corra e compre agora!!! ⬇️\n\n${produto.link} \n\n⚠️ Sujeito a variação de preço e disponibilidade no site!️\n\n📲 Link do grupo\nhttps://lnk.bio/OfertasEPomocoes`});
    }
});
 


client.initialize();

const socket = io('https://test-boletos.onrender.com');

// Evento de conexão
socket.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');

    // Enviar dados para o servidor
    socket.emit('clientData', { message: 'Olá, servidor!' });
});

// Evento para lidar com dados recebidos do servidor
socket.on('enviar comprovante', async (data) => {
    const response = await enviarComprovante(data.telefone, data.usuario, data.nomecomprovante, data.datapagamento, data.valor, data.tipoPagamento)
    console.log('Dados recebidos do servidor:', data);
    console.log(response);
});

socket.on('depositar', async (data) => {
    const response = await receberPix(data.telefone, data.valor)
    console.log('Dados recebidos do servidor:', data);
    console.log(response);
});

// Evento de desconexão
socket.on('disconnect', () => {
    console.log('Desconectado do servidor Socket.IO');
});

