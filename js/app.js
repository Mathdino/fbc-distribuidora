$(document).ready(function () {
    cardapio.eventos.init()
})

var cardapio = {}

var MEU_CARRINHO = []

var MEU_ENDERECO = null

var VALOR_CARRINHO = 0

var VALOR_ENTREGA = 0

var CELULAR_ESTABELECIMENTO = "5511951085239"



cardapio.eventos = {
    init: () => {
        cardapio.metodos.obterItensCardapio()
        cardapio.metodos.carregarBotaoReserva()
        cardapio.metodos.carregarBotaoLigar()
        cardapio.metodos.carregarBotaoWhatsapp()
    }
}

cardapio.metodos = {
    // Obtem a lista de itens do cardapio
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {
        var filtro = MENU[categoria]

        if (!vermais) {
            $("#itensCardapio").html('')
            $("#btnVerMais").removeClass('hidden')
        }



        $.each(filtro, (i, e) => {

            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)

            // Botão "Ver mais" foi clicado (12 itens)
            if (vermais && i >= 8 && i < 100) {
                $("#itensCardapio").append(temp)
            }

            // paginação inicial (8 itens)
            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }

        })

        //remove o active
        $(".container-menu a").removeClass('active')

        // seta o menu para ativo
        $('#menu-' + categoria).addClass('active')
    },

    // Clique no botão de "Ver mais"
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1]
        cardapio.metodos.obterItensCardapio(ativo, true)

        $("#btnVerMais").addClass('hidden')

    },

    // Diminuir a quantidade do item no cardapio
    diminuirQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text())

        if (qntdAtual > 0) {
            $('#qntd-' + id).text(qntdAtual - 1)
        }
    },

    // Aumentar a quantidade do item no cardapio
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($('#qntd-' + id).text())

        $('#qntd-' + id).text(qntdAtual + 1)
    },

    // Adicionar ao carrinho o item do cardapio
    adicionarAoCarrinho: (id) => {
        let qntdAtual = parseInt($('#qntd-' + id).text())

        if (qntdAtual > 0) {
            //obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1]

            //Obtem a lista de itens
            let filtro = MENU[categoria]

            // obtem o item
            let item = $.grep(filtro, (e, i) => { return e.id == id })

            if (item.length > 0) {

                //validar se já existe esse item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id })

                // Caso já exista o item no carrinho, só altera a quantidade
                if (existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id))
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual
                }
                // Caso ainda não exista o item no carrinho, adiciona ele
                else {
                    item[0].qntd = qntdAtual
                    MEU_CARRINHO.push(item[0])
                }

                cardapio.metodos.mensagem('Item adicionado ao carrinho', "green")
                $('#qntd-' + id).text(0)
                cardapio.metodos.atualizarBadgeTotal()
            }
        }
    },

    //Atualiza o badge de totais dos botões
    atualizarBadgeTotal: () => {

        var total = 0

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden')
            $(".container-total-carrinho").removeClass('hidden')

        } else {
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden')
        }

        $('.badge-total-carrinho').html(total)
    },

    // Abrir modal de carrinho
    abrirCarrinho: (abrir) => {
        if (abrir) {
            $("#modalCarrinho").removeClass('hidden')
            $('#btnAbrirCarrinho').addClass('hidden')
            cardapio.metodos.carregarCarrinho()
        } else {
            $("#modalCarrinho").addClass('hidden')
        }
    },

    //Altera os textos e exibe os botões das etapas
    carregarEtapa: (etapa) => {
        if (etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho:')
            $("#itensCarrinho").removeClass('hidden')
            $("#localEntrega").addClass('hidden')
            $("#resumoCarrinho").addClass('hidden')

            $(".etapa").removeClass('active')
            $(".etapa1").addClass('active')

            $("#btnEtapaPedido").removeClass('hidden')
            $("#btnEtapaEndereco").addClass('hidden')
            $("#btnEtapaEnviarResumo").addClass('hidden')
            $("#btnVoltar").addClass('hidden')
        }

        if (etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:')
            $("#itensCarrinho").addClass('hidden')
            $("#localEntrega").removeClass('hidden')
            $("#resumoCarrinho").addClass('hidden')

            $(".etapa").removeClass('active')
            $(".etapa1").addClass('active')
            $(".etapa2").addClass('active')

            $("#btnEtapaPedido").addClass('hidden')
            $("#btnEtapaEndereco").removeClass('hidden')
            $("#btnEtapaEnviarResumo").addClass('hidden')
            $("#btnVoltar").removeClass('hidden')
        }

        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:')
            $("#itensCarrinho").addClass('hidden')
            $("#localEntrega").addClass('hidden')
            $("#resumoCarrinho").removeClass('hidden')

            $(".etapa").removeClass('active')
            $(".etapa1").addClass('active')
            $(".etapa2").addClass('active')
            $(".etapa3").addClass('active')

            $("#btnEtapaPedido").addClass('hidden')
            $("#btnEtapaEndereco").addClass('hidden')
            $("#btnEtapaEnviarResumo").removeClass('hidden')
            $("#btnVoltar").removeClass('hidden')
        }

    },

    // Botão de voltar etapa
    voltarEtapa: () => {
        let etapa = $(".etapa.active").length
        cardapio.metodos.carregarEtapa(etapa - 1)
    },

    // Carrega a lista de itens do carrinho e a etapa
    carregarCarrinho: () => {
        cardapio.metodos.carregarEtapa(1)

        if (MEU_CARRINHO.length > 0) {
            $("#itensCarrinho").html('')

            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                    .replace(/\${id}/g, e.id)
                    .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp)

                // Ultimo Item
                if((i + 1) == MEU_CARRINHO.length) {
                    cardapio.metodos.carregarValores()
                }

            })


        } else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"> <i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>')
            cardapio.metodos.carregarValores()
        }
    },


    // Diminuir quantidade do item no carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text())

        if (qntdAtual > 1) {
            $('#qntd-carrinho-' + id).text(qntdAtual - 1)
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1)
        } else {
            cardapio.metodos.removerItemCarrinho(id)
        }
    },

    // Aumentar quantidade do item no carrinho
    aumentarQuantidadeCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text())
        $('#qntd-carrinho-' + id).text(qntdAtual + 1)
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1)
    },

    // Botão remover item do carrinho
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id })
        cardapio.metodos.carregarCarrinho()

        cardapio.metodos.atualizarBadgeTotal()

    },

    // Atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {
        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id))

        MEU_CARRINHO[objIndex].qntd = qntd

        // Atualiza o botão de carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal()

        // Atualiza os valores do subtotal, entrega e total
        cardapio.metodos.carregarValores()
    },

    // Carrega os valores de sub-total, entrega e total
    carregarValores: () => {

        VALOR_CARRINHO = 0

        $("#lblSubTotal").text('R$ 0,00')
        $("#lblValorTotal").text('R$ 0,00')

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd)

            if ((i + 1) == MEU_CARRINHO.length) {
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`)
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`)
            }
        })
    },

    // Carregar a etapa de Endereço
    carregarEndereco: () => {

        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return
        }

        cardapio.metodos.carregarEtapa(2)
    },

    //API ViaCEP
    buscarCEP: () => {

        // cria a variavel com o valor do CEP
        var cep = $('#txtCEP').val().trim().replace(/\D/g, '')

        //verifica se o cep possui valor informado
        if(cep != '') {
            
            //Expressão Regular para validar o CEP
            var validaCep = /^[0-9]{8}$/ 
            
            if(validaCep.test(cep)) {

                $.getJSON('https://viacep.com.br/ws/' + cep +"/json/?callback=?", function (dados) {

                    if(!("erro" in dados)) {

                        //Atualizar os campos com os valores retornados
                        $('#txtEndereco').val(dados.logradouro)
                        $('#txtBairro').val(dados.bairro)
                        $('#txtCidade').val(dados.localidade)
                        $('#ddlUF').val(dados.uf)
                        $('#txtNumero').focus()

                    } else {
                        cardapio.metodos.mensagem('CEP não encontrado, preencha as informações manualmente')
                        $('#txtEndereco').focus()
                    }

                })

            } else {
                cardapio.metodos.mensagem('Formato do CEP inválido')
                $('#txtCEP').focus()
            }

        } else {
            cardapio.metodos.mensagem('Informe o CEP, por favor.')
            $('#txtCEP').focus()
        }


    },

    // Validação antes de prosseguir para a etapa 3
    resumoPedido: () => {

        let cep = $('#txtCEP').val().trim()
        let endereco = $('#txtEndereco').val().trim()
        let bairro = $('#txtBairro').val().trim()
        let cidade = $('#txtCidade').val().trim()
        let uf = $('#ddlUF').val().trim()
        let numero = $('#txtNumero').val().trim()
        let complemento = $('#txtComplemento').val().trim()

        if(cep.length <= 0) {
            cardapio.metodos.mensagem('Informe o CEP, por favor.')
            $('#txtCEP').focus()
            return
        }

        if(endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o Endereço, por favor.')
            $('#txtEndereco').focus()
            return
        }

        if(bairro.length <= 0) {
            cardapio.metodos.mensagem('Informe o Bairro, por favor.')
            $('#txtBairro').focus()
            return
        }

        if(cidade.length <= 0) {
            cardapio.metodos.mensagem('Informe a Cidade, por favor.')
            $('#txtCidade').focus()
            return
        }

        if(uf == "-1") {
            cardapio.metodos.mensagem('Informe a UF, por favor.')
            $('#ddlUF').focus()
            return
        }

        if(numero.length <= 0) {
            cardapio.metodos.mensagem('Informe o Número, por favor.')
            $('#txtNumero').focus()
            return
        }

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento,
        }

        cardapio.metodos.carregarEtapa(3)
        cardapio.metodos.carregarResumo()
    },

    // Carrega a etapa Resumo do Pedido
    carregarResumo: () => {
        $('#listaItensResumo').html('')

        $.each(MEU_CARRINHO, (i,e) => {
            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                    .replace(/\${qntd}/g, e.qntd)

                $("#listaItensResumo").append(temp)
        })

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`)
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`)
 
        
        cardapio.metodos.finalizarPedido()
    },

    // Atualiza o link do botão do whatsapp
    finalizarPedido: () => {

        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {

            var texto = 'Olá! Gostaria de fazer um pedido:'
            texto += `\n*Itens do pedido:* \n\n\${itens}`
            texto += "\n*Endereço de entrega:*"
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`
            texto += `\n${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`


            var itens = ''

            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}x* ${e.name} .......  R$ ${e.price.toFixed(2).replace('.', ',')} \n`

                if((i + 1) == MEU_CARRINHO.length) {

                    texto = texto.replace(/\${itens}/g, itens)

                    //Converte a URL
                    let encode = encodeURI(texto)
                    let URL = `https://wa.me/${CELULAR_ESTABELECIMENTO}?text=${encode}`

                    $("#btnEtapaEnviarResumo").attr('href', URL)

                }
            })

            
        }

    },

    // Carrega o link do botão Reserva
    carregarBotaoReserva:() => {
        var texto = 'Olá! Gostaria de receber novas *promoções*.'

        let encode = encodeURI(texto)
        let URL = `https://wa.me/${CELULAR_ESTABELECIMENTO}?text=${encode}`

        $("#btnReserva").attr('href', URL)

    },

    // Carrega o botão de ligar
    carregarBotaoLigar: () => {
        $('#btnLigar').attr('href', `tel:${5511951085239}`)

    },

    // Carrega o botão do Whatsapp
    carregarBotaoWhatsapp: () => {
        var texto = 'Olá! Gostaria de fazer um *pedido*.'
        let encode = encodeURI(texto)
        let URL = `https://wa.me/${5511951085239}?text=${encode}`

        $('#btnWhatsapp').attr('href', URL)
        $('#btnWhatsappFooter').attr('href', URL)
        
    },
    

    // Abre o depoimento
    abrirDepoimento: (depoimento) => {
        $('#depoimento-1').addClass('hidden')
        $('#depoimento-2').addClass('hidden')
        $('#depoimento-3').addClass('hidden')

        $('#btnDepoimento-1').removeClass('active')
        $('#btnDepoimento-2').removeClass('active')
        $('#btnDepoimento-3').removeClass('active')

        $('#depoimento-' + depoimento).removeClass('hidden')
        $('#btnDepoimento-' + depoimento).addClass('active')
    },
    



    // Mensagens 
    mensagem: (texto, cor = 'red', tempo = 3500) => {
        let id = Math.floor(Date.now() * Math.random().toString())

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`

        $("#container-mensagens").append(msg)

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown')
            $("#msg-" + id).addClass('fadeOutUp')
            setTimeout(() => {
                $("#msg-" + id).remove()
            }, 800)
        }, tempo)
    }
}

cardapio.templates = {
    item: `
    <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
    <div class="card card-item" id="\${id}">
        <div class="img-produto">
            <img src="\${img}"
                alt="">
        </div>
        <p class="title-produto text-center mt-4">
            <strong>\${nome}</strong>
        </p>
        <p class="price-produto text-center">
            <strong>R$ \${preco}</strong>
        </p>
        <div class="add-carrinho">
            <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
            <span class="add-numero-itens" id="qntd-\${id}">0</span>
            <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
            <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
        </div>
    </div>
</div>
    `,

    itemCarrinho: `
    <div class="col-12 item-carrinho">
        <div class="img-produto">
            <img src="\${img}"
                alt="">
        </div>
        <div class="dados-produto">
            <p class="title-produto"><strong>\${nome}</strong></p>
            <p class="price-produto"><strong>R$ \${preco}</strong></p>
        </div>
        <div class="add-carrinho">
            <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
            <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
            <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
            <span class="btn btn-remove no-mobile"><i class="fa fa-times" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"></i></span>
        </div>
    </div>
    `,

    itemResumo: `
    <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
            <img src="\${img}">
        </div>

        <div class="dados-produto">
            <p class="title-produto-resumo">
                <strong>\${nome}</strong>
            </p>
            <p class="price-produto-resumo">
                <strong>R$ \${preco}</strong>
            </p>
        </div>

        <p class="quantidade-produto-resumo">x <strong>\${qntd}</strong></p>
    </div>
    `
}