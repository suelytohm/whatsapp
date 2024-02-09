function verificaNumero(numero){
    let final = ""

    if(numero.length == 17){
        let meio = numero.substring(4, numero.length -5)
        final = numero.substring(2, 4) + 9 + meio;
    }
    else if (numero.length == 18) {
        final = numero.substring(2, numero.length - 5)
    }

    console.log(final)
}

verificaNumero("558791087013@c.us")