const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client();

client.on('qr', (qrCode) => {
    // Exiba o QR Code e aguarde a autenticação do usuário
    console.log('Scan the QR Code to log in:', qrCode);
});

client.on('authenticated', (session) => {
    console.log(session);
});

client.on('ready', () => {
    console.log('Client is ready!');

    // Substitua o número abaixo pelo número do destinatário
    const numeroDestinatario = '558791087013@c.us';

    // Substitua o caminho abaixo pelo caminho correto do arquivo 1.pdf
    const caminhoArquivo = 'comprovantes/1.pdf';

    // Crie um objeto MediaMessage a partir do arquivo PDF
    const media = MessageMedia.fromFilePath(caminhoArquivo);

    // Envie o arquivo para o destinatário
    client.sendMessage(numeroDestinatario, media, { caption: 'Envio de arquivo PDF' })
        .then(() => {
            console.log('Arquivo enviado com sucesso!');
            // client.destroy();
        })
        .catch((error) => {
            console.error('Erro ao enviar arquivo:', error);
            // client.destroy();
        });
});

client.initialize();
