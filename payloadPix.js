class Payload {
    constructor(
      nome,
      chavepix,
      valor,
      cidade,
      txtId,
      diretorio = ''
    ) {
      this.nome = nome;
      this.chavepix = chavepix;
      this.valor = parseFloat(valor.replace(',', '.')).toFixed(2);
      this.cidade = cidade;
      this.txtId = txtId;
      this.diretorioQrCode = diretorio;
  
      this.nome_tam = this.nome.length.toString().padStart(2, '0');
      this.chavepix_tam = this.chavepix.length.toString().padStart(2, '0');
      this.valor_tam = this.valor.length.toString().padStart(2, '0');
      this.cidade_tam = this.cidade.length.toString().padStart(2, '0');
      this.txtId_tam = this.txtId.length.toString().padStart(2, '0');
  
      this.merchantAccount_tam = `0014BR.GOV.BCB.PIX01${this.chavepix_tam}${this.chavepix}`;
      this.transactionAmount_tam = `${this.valor_tam}${this.valor}`;
  
      this.addDataField_tam = `05${this.txtId_tam}${this.txtId}`;
  
      this.nome_tam = this.nome_tam.toString().padStart(2, '0');
      this.cidade_tam = this.cidade_tam.toString().padStart(2, '0');
  
      this.payloadFormat = '000201';
      this.merchantAccount = `26${this.merchantAccount_tam.length.toString().padStart(2, '0')}${this.merchantAccount_tam}`;
      this.merchantCategCode = '52040000';
      this.transactionCurrency = '5303986';
      this.transactionAmount = `54${this.transactionAmount_tam}`;
      this.countryCode = '5802BR';
      this.merchantName = `59${this.nome_tam}${this.nome}`;
      this.merchantCity = `60${this.cidade_tam}${this.cidade}`;
      this.addDataField = `62${this.addDataField_tam.length.toString().padStart(2, '0')}${this.addDataField_tam}`;
      this.crc16 = '6304';
    }
  
    gerarPayload() {
      this.payload = `${this.payloadFormat}${this.merchantAccount}${this.merchantCategCode}${this.transactionCurrency}${this.transactionAmount}${this.countryCode}${this.merchantName}${this.merchantCity}${this.addDataField}${this.crc16}`;
      return this.gerarCrc16(this.payload);
      
    }
  
    gerarCrc16(payload) {
      const crc16 = (str) => {
        let crc = 0xFFFF;
        for (let i = 0; i < str.length; i++) {
          crc ^= str.charCodeAt(i) << 8;
          for (let j = 0; j < 8; j++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
          }
        }
        return crc & 0xFFFF;
      };
  
      this.crc16Code = crc16(payload).toString(16).toUpperCase().padStart(4, '0');
      this.payload_completa = `${payload}${this.crc16Code}`;
      return this.gerarQrCode(this.payload_completa);
    }
  
    gerarQrCode(payload) {
      return payload;
    }
  }

  
  module.exports = Payload;
  
  // Exemplo de uso no React
//   const payloadInstance = new Payload('ROSENILDO SUELYTOHM DE OL', "617ea695-815b-4593-94b8-a924a560443b", "50", 'SAO PAULO', 'deposito');
//   console.log(payloadInstance.gerarPayload());
  