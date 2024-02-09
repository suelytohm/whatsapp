const express = require('express');
const { Client, MessageMedia } = require('whatsapp-web.js');
const bodyParser = require('body-parser');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const io = require('socket.io-client');

const app = express();
const port = 3005;

app.use(bodyParser.json());

const client = new Client();

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
    console.log('Scan the QR Code to log in.');
});

client.on('authenticated', (session) => {
    console.log('Authenticated');
});

app.post('/comprovante/', (req, res) => {
    const { numeroDestinatario, user, nomeComprovante } = req.body;
    const caminhoArquivo = `comprovantes/${nomeComprovante}`;
    const numero = numeroDestinatario + "@c.us";

    const message = "Olá " + user + ", aqui está o seu comprovante! \n\n" + urlDownload + nomeComprovante

    const media = MessageMedia.fromFilePath(caminhoArquivo);

    client.sendMessage(numero, media, { caption: message })
        .then(() => {
            console.log('Arquivo enviado com sucesso!');
            res.status(200).json({ mensagem: 'Arquivo enviado com sucesso!' });
        })
        .catch((error) => {
            console.error('Erro ao enviar arquivo:', error);
            res.status(500).json({ erro: 'Erro ao enviar arquivo.' });
        });
});


app.get('/comprovante/:numeroDestinatario/:user/:nomeComprovante', (req, res) => {
    const numeroDestinatario = req.params.numeroDestinatario;
    const user = req.params.user;
    const nomeComprovante = req.params.nomeComprovante;
    const caminhoArquivo = `C:\\Users\\suely\\Desktop\\python\\celcoin\\comprovantes\\${nomeComprovante}`;


    console.log(numeroDestinatario)
    console.log(user)
    console.log(caminhoArquivo)
    // enviarComprovante(numeroDestinatario, user, caminhoArquivo);


    const message = "Olá " + user + ", aqui está o seu comprovante! \n\n" + dataAtual();

    console.log(message)

    
    const media = MessageMedia.fromFilePath(caminhoArquivo);

    client.sendMessage(`${numeroDestinatario}@c.us`, media, { caption: message })
        .then(() => {
            console.log('Arquivo enviado com sucesso!');
            res.status(200).json({ mensagem: 'Arquivo enviado com sucesso!' });
        })
        .catch((error) => {
            console.error('Erro ao enviar arquivo:', error);
            res.status(500).json({ erro: 'Erro ao enviar arquivo.' });
        });
        
});



function enviarComprovante(numeroDestinatario, user, nomeComprovante){

    const caminhoArquivo = `C:\\Users\\suely\\Desktop\\python\\celcoin\\comprovantes\\${nomeComprovante}`;

    const message = "Olá " + user + ", aqui está o seu comprovante! \n\n" + dataAtual();
    const media = MessageMedia.fromFilePath(caminhoArquivo);

    client.sendMessage(`${numeroDestinatario}@c.us`, media, { caption: message })
    .then(() => {
        console.log('Arquivo enviado com sucesso!');
        return true
        // res.status(200).json({ mensagem: 'Arquivo enviado com sucesso!' });
    })
    .catch((error) => {
        console.error('Erro ao enviar arquivo:', error);
        return error
        // res.status(500).json({ erro: 'Erro ao enviar arquivo.' });
    });

}

function dataAtual(){
    const data = new Date();
    let dia = String(data.getDate()).padStart(2, '0');
    let mes = String(data.getMonth() + 1).padStart(2, '0');
    let ano = data.getFullYear();

    let hora = String(data.getHours()).padStart(2, '0');
    let minutos = String(data.getMinutes()).padStart(2, '0');

    return hora + ":" + minutos + " - " + dia + "/" + mes + "/" + ano;
}


// Substitua 'http://localhost:3000' pela URL do seu servidor Socket.IO
const socket = io('https://test-boletos.onrender.com');

// Evento de conexão
socket.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');

    // Enviar dados para o servidor
    socket.emit('clientData', { message: 'Olá, servidor!' });
});

// Evento para lidar com dados recebidos do servidor
socket.on('enviar comprovante', (data) => {
    enviarComprovante(data.telefone, data.usuario, data.nomecomprovante)
    console.log('Dados recebidos do servidor:', data);

    // Faça alguma ação com os dados recebidos aqui
});

// Evento de desconexão
socket.on('disconnect', () => {
    console.log('Desconectado do servidor Socket.IO');
});


app.listen(port, () => {
    console.log(`Servidor Express iniciado na porta ${port}`);
    client.initialize();
});
