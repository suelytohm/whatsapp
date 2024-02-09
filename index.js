require('dotenv').config()
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const io = require('socket.io-client');

const axios = require('axios').default;
const wservice = "https://test-boletos.onrender.com";

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'celcoin2'
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

    client.sendMessage(`55${numeroDestinatario}@c.us`, media, { caption: mensagem })
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


client.on('message', async (message) => {
    const obj = await consultaSaldo(message.from);

    if ((message.body === 'saldo') || (message.body === 'Saldo')) {
        if (obj && message.from === verificarNumero(obj.telefone)) {
            await message.reply(`Seu saldo é: R$ ${formatarValor(obj.saldo)}`);
        } else {
            console.log('Erro ao obter dados do banco de dados');
        }
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

    // Faça alguma ação com os dados recebidos aqui
});

// Evento de desconexão
socket.on('disconnect', () => {
    console.log('Desconectado do servidor Socket.IO');
});

