function verificarNumero(telefone){
    let numero = "";

    if(telefone.includes("@")){
        return telefone
    }

    if(telefone.length == 11){
        let numeroFim = telefone.substring(3, telefone.length)
        let numeroInicio = telefone.substring(0, 2)
        numero = `${numeroInicio}${numeroFim}`;
    } else {
        numero = telefone
    }
    return `55${numero}@c.us`
}


console.log(verificarNumero("87991087013"))