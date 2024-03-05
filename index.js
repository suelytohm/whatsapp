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
const PdfTextExtractor = require('./PdfTextExtractor');
const Categorias = require('./Categorias');


// AGENDAR PAGAMENTO DE BOLETOS


const axios = require('axios').default;
const wservice = "https://test-boletos.onrender.com";

let objeto = {}

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'celcoin'
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

function dataAtual(){
    const data = new Date();
    let dia = String(data.getDate()).padStart(2, '0');
    let mes = String(data.getMonth() + 1).padStart(2, '0');
    let ano = data.getFullYear();

    let hora = String(data.getHours()).padStart(2, '0');
    let minutos = String(data.getMinutes()).padStart(2, '0');

    return "Mensagem enviada " + dia + "/" + mes + "/" + ano + " às " + hora + ":" + minutos;
}

function formatarValor(numero){
    if(numero == null){
        return 0
    }
    return numero.toFixed(2).replace(".", ","); // Substitui o ponto pela vírgula
}

function verificarNumero(telefone){

    if(telefone != null){
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
}

function tratarTipo(str){
    let tipo = str

    switch (tipo) {
      case "deposito":
        str = "Depósito"
        break;
      case "cartao":
        str = "Cartão"
        break;      
      default:
        break;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }



async function enviarComprovante(numeroDestinatario, user, nomeComprovante, datapagamento, valor, tipoPagamento){
    let caminhoArquivo = "";
    if(process.env.SO == 'windows'){
        caminhoArquivo = `C:\\Users\\suely\\Desktop\\python\\celcoin\\comprovantes\\${nomeComprovante}`;
    } else {
        caminhoArquivo = `/home/suelytohm/Desktop/scripts/comprovantes/${nomeComprovante}`;
    }

    const mensagem = `Olá ${capitalize(user)}, aqui está o seu comprovante! \n\n${tratarTipo(tipoPagamento)}\nData do pagamento: ${datapagamento}\nValor: R$ ${valor} \n\n${dataAtual()}`
    const media = MessageMedia.fromFilePath(caminhoArquivo);

    client.sendMessage(verificarNumero(numeroDestinatario), media, { caption: mensagem }) // ----------------------------- VERIFICAR VALIDAÇÃO DO NÚMERO
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


async function receberPix(telefone, valor, tipoRecebimento){
    let a = new Identificador()
    let idPagamento = a.gerarLetrasAleatorias();
    let restante = ''


    if((tipoRecebimento == 'boleto') || (tipoRecebimento == 'teste boleto')){
        restante = ' o restante'
    }

    await client.sendMessage(verificarNumero(telefone), `Copie o código abaixo e deposite${restante} via pix:`);
    const payloadInstance = new Payload('ROSENILDO SUELYTOHM DE OL', "617ea695-815b-4593-94b8-a924a560443b", Math.abs(valor).toString(), 'SAO PAULO', idPagamento);
    await client.sendMessage(verificarNumero(telefone), payloadInstance.gerarPayload());        
    await client.sendMessage(verificarNumero(telefone), `⚠ Envie o comprovante da transferência após a realização do pagamento`);
    
    objeto["passo"] = 2;
    objeto["valorPixRecebido"] = Math.abs(valor);
    objeto["idPagamento"] = idPagamento;

}


function removerAcentosECaracteresEspeciais(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f|\u00b4|\u0060|\u005e|\u007e]/g, "");
}




client.on('message', async (message) => {
    let entrada = message.body.toLowerCase();
    entrada = removerAcentosECaracteresEspeciais(message.body.toLowerCase());
    const valoresPermitidos = ['Olá', 'ola', 'olá', 'OLÁ', 'Bom dia', 'bom dia', 'BOM DIA'];
    // const valoresPermitidosLowerCase = valoresPermitidos.map(valor => valor.toLowerCase());
    const valoresPermitidosNormalizados = valoresPermitidos.map(valor => removerAcentosECaracteresEspeciais(valor.toLowerCase()));

    if (valoresPermitidosNormalizados.includes(entrada)) {
        const obj = await consultaSaldo(message.from);
        let user = "";
        if(obj){
            user = ` ${obj.nome.charAt(0).toUpperCase() + obj.nome.slice(1)}`
        }
        const saudacao = [`Tudo bem${user}? Como posso ser útil para você hoje?`, `Olá${user}! Como posso te ajudar?`, `Olá${user}, como posso te auxiliar?`]
        const indiceSorteado = Math.floor(Math.random() * saudacao.length);
        await client.sendMessage(message.from, saudacao[indiceSorteado]);
    } else {
        // await client.sendMessage(message.from, "Olá! Vi que você não tem nenhum registro no nosso sistema.\nO cadastro é super rápido, informe o seu nome para começarmos");

        // await client.sendMessage(message.from, "Ótimo, agora informe o seu e-mail");

        // await client.sendMessage(message.from, "✔ Tudo certo, o seu cadastro foi realizado! Agora já podemos realizar pagamentos de boletos via pix.");
    }
})


client.on('message', async (message) => {
    if ((message.body === 'saldo') || (message.body === 'Saldo')) {
        const obj = await consultaSaldo(message.from);
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

        receberPix(message.from, Math.abs(total), 'deposito')
    }

    else if((objeto.tipo == 'deposito') || (objeto.tipo == 'boleto') || (objeto.tipo == 'teste boleto') && (objeto.passo == 2)){
        if(message.hasMedia){
            await client.sendMessage(message.from, `Aguarde um instante enquanto verificamos as informações...`);

            const media = await message.downloadMedia();
            let ms = Date.now()
            const fileName = `${message.from}-${ms}.${media.mimetype.split('/')[1]}`;
            const filePath = path.join(__dirname, 'comprovantes/pix/original/', fileName);
            fs.writeFileSync(filePath, media.data, 'base64');

            if (media.mimetype === 'application/pdf') {
                const pdf = new PdfTextExtractor(filePath);
                pdf.extractText()
                .then(async (extractedText) => {
                    if (extractedText && extractedText.includes(objeto.idPagamento)) {
                        // console.log("A imagem contém o identificador correto: " + objeto.idPagamento);
                        const obj = await consultaSaldo(message.from);
                        let saldoAtual = obj.saldo + objeto.valorPixRecebido;
                        let idUser = obj.id;
        
                        axios.put(`https://test-boletos.onrender.com/atualizarSaldo/${idUser}`, { saldoatualizado: saldoAtual }).then( async () => {
                            await client.sendMessage(message.from, `✔ Tudo certo! Seu saldo é R$ ${parseFloat(saldoAtual).toFixed(2)}`);

                            if((objeto.tipo == 'boleto') || (objeto.tipo == 'teste boleto')){
                                objeto['passo'] = 3
                                await client.sendMessage(message.from, 'Informe o tipo de boleto: \n\n1 - Cartão\n2 - Celpe\n3 - Compesa\n4 - Depósito\n5 - Financiamento\n6 - Internet/Celular\n7 - Outro')
    
                            } else {
                                objeto = {}
                            }
                        })
                    } else {
                        console.log("A string não contém o identificador correto: " + objeto.idPagamento);
                        await client.sendMessage(message.from, `❌ Desculpe, mas ocorreu um erro. Verifique o comprovante e tente novamente!`);
                    }
                })
                .catch(error => {
                    console.error(error);
                });
            }
    
            else if (message.hasMedia && message.type === 'image') {
                const obj = await consultaSaldo(message.from);
    
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
                        
                            console.log(objeto.idPagamento)
                            if (extractedText && extractedText.includes(objeto.idPagamento)) {
                                console.log("A imagem contém o identificador correto: " + objeto.idPagamento);
    
                                let saldoAtual = obj.saldo + objeto.valorPixRecebido;
    
                                let idUser = obj.id;
    
                                axios.put(`https://test-boletos.onrender.com/atualizarSaldo/${idUser}`, { saldoatualizado: saldoAtual }).then( async () => {
                                    await client.sendMessage(message.from, `✔ Tudo certo! Seu saldo é R$ ${parseFloat(saldoAtual).toFixed(2)}`);

                                    if((objeto.tipo == 'boleto') || (objeto.tipo == 'teste boleto')){
                                        objeto['passo'] = 3
                                        await client.sendMessage(message.from, 'Informe o tipo de boleto: \n\n1 - Cartão\n2 - Celpe\n3 - Compesa\n4 - Depósito\n5 - Financiamento\n6 - Internet/Celular\n7 - Outro')
    
                                    } else {
                                        objeto = {}
                                    }
                                })
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
    }
});



client.on('message', async(message) => {
    if((message.body === 'Pagar boleto') || (message.body === 'pagar boleto') || (message.body === 'Boleto') || (message.body === 'boleto') || (message.body === 'PAGAR BOLETO')) {
    // if(message.body === 'Test boleto'){
        await client.sendMessage(message.from, `Informe o valor a ser pago`);
        objeto = {
            tipo: 'teste boleto',
            numero: message.from,
            passo: 1
        }
    }

    else if((objeto.tipo === 'teste boleto') && (objeto.numero === message.from) && (objeto.passo === 1)){
        const obj = await consultaSaldo(message.from);
        let total = message.body // parseFloat

        total = total.replace("R", "")
        total = total.replace("$", "")
        total = total.replace(" ", "")
        total = total.replace(",", ".")
        total = parseFloat(total).toFixed(2)

        let restante = obj.saldo - total
        restante = Math.abs(restante)

        objeto["totalBoleto"] = total;
        objeto["restante"] = restante;
        objeto["passo"] = 2;

        console.log(objeto)

        if(total > obj.saldo){
            // PASSO 2
            receberPix(message.from, restante, 'teste boleto')
        } else {
            objeto["passo"] = 3;
            objeto["restante"] = 0;

            await client.sendMessage(message.from, 'Informe o tipo de boleto: \n\n1 - Cartão\n2 - Celpe\n3 - Compesa\n4 - Depósito\n5 - Financiamento\n6 - Internet/Celular\n7 - Outro')
        }
    }

    else if((objeto.tipo === 'boleto') || (objeto.tipo === 'teste boleto') && (objeto.numero === message.from) && (objeto.passo === 3)){
        const categoria = new Categorias(message.body);
        
        if(categoria.reconhecerEscolha() == null){
            await client.sendMessage(message.from, '❌ Informe corretamente o tipo do boleto')
            
        } else {
            objeto['passo'] = 4;
            objeto['tipoBoleto'] = categoria.reconhecerEscolha();
            await client.sendMessage(message.from, 'Informe os números do boleto')
        }
    }

    else if((objeto.tipo === 'boleto') || (objeto.tipo === 'teste boleto') && (objeto.numero === message.from) && (objeto.passo === 4)){
        await client.sendMessage(message.from, 'Aguarde um instante, estamos validando as informações')

        const linhaDigitadaBoleto = message.body;
        
        if(validarNumeroBoleto(linhaDigitadaBoleto)){
            const obj = await consultaSaldo(message.from);

            const boleto = {
                usuario: obj.nome,
                codigoBoleto: linhaDigitadaBoleto,
                tipo: objeto.tipoBoleto,
                valor: objeto.totalBoleto,
                telefone: obj.telefone
            }

            const idUser = obj.id;

            if(obj.saldo >= objeto.totalBoleto){
                axios.post("https://test-boletos.onrender.com/boleto", boleto).then(async (response) => {
                    if (response.status === 200) {
                        console.log('Requisição bem-sucedida! Status code:', response.status);
                        socket.emit('novo boleto', boleto);
                        await client.sendMessage(message.from, '✔ Tudo certo! O pagamento do seu boleto será realizado em breve!')
                        
                        console.log(objeto)
                        console.log(boleto)
                        console.log(obj)

                        const saldoAtual = obj.saldo - boleto.valor

                        axios.put(`https://test-boletos.onrender.com/atualizarSaldo/${idUser}`, { saldoatualizado: saldoAtual }).then( async () => {
                            console.log("Saldo atualizado")
                        })
                        objeto = {}
                    } else {
                        console.log('Erro: ', response);
                    }
                })
            } else {
                await client.sendMessage(message.from, '❌ Verifique seu saldo e tente novamente!')
                objeto = {}
            }


            console.log(objeto)
            console.log(boleto)
            console.log(obj)

        } else {
            await client.sendMessage(message.from, '❌ Verifique a numeração do boleto e tente novamente!')

        }
    }
})

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
    const response = await receberPix(data.telefone, data.valor, 'deposito')
    console.log('Dados recebidos do servidor:', data);
    console.log(response);
});

// Evento de desconexão
socket.on('disconnect', () => {
    console.log('Desconectado do servidor Socket.IO');
});
