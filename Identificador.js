class Identificador {

    gerarLetrasAleatorias() {
        const alfabeto = 'BHKLORSTWXYZ';
        let letrasAleatorias = '';
    
        // Função para obter um índice aleatório único
        function obterIndiceAleatorio(exclusoes) {
            let indice = Math.floor(Math.random() * alfabeto.length);
            // Garantindo que o índice não está na lista de exclusões
            while (exclusoes.includes(alfabeto[indice])) {
                indice = Math.floor(Math.random() * alfabeto.length);
            }
            return indice;
        }
    
        // Gerar quatro letras aleatórias
        for (let i = 0; i < 6; i++) {
            // Excluindo as letras já escolhidas
            const exclusoes = letrasAleatorias.split('');
            const indice = obterIndiceAleatorio(exclusoes);
            letrasAleatorias += alfabeto[indice];
        }
    
        return letrasAleatorias;
    }
}

module.exports = Identificador;

