class Categorias {
    constructor(categoria){
        this.categoria = categoria;
    }
    reconhecerEscolha() {
        // Mapeamento das opções para facilitar a comparação
        const opcoes = {
            '1': 'cartao',
            '2': 'celpe',
            '3': 'compesa',
            '4': 'deposito',
            '5': 'financiamento',
            '6': 'internet',
            '7': 'Outro'
        };
    
        // Remova acentos e converta para minúsculas para comparação insensível a maiúsculas/minúsculas
        const inputFormatado = this.categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
        // Verifique se o input corresponde a uma das opções
        for (const chave in opcoes) {
            const opcaoFormatada = opcoes[chave].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            if (inputFormatado === opcaoFormatada || inputFormatado === chave) {
                return opcoes[chave];
            }
        }
    
        // Se não corresponder a nenhuma opção, retorne null
        return null;
    }
}

module.exports = Categorias;
