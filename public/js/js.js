$(document).ready(function() {
    //exibir mais categorias
    $(".vermais").click(function(){
        var pegar =$(this).data('destino');
        $( "."+pegar ).slideToggle(500);
    });

    //exibir mais cards
    $(".vermais2").click(function(){
        var pegar =$(this).data('destino');
        $( "."+pegar ).slideToggle(500);
        var palavra= ($('.palavraUsada').text());
        //alert(palavra);

        if(palavra=='keyboard_arrow_down  Mostrar'){
            $('.palavraUsada').html('<i class="material-icons ">keyboard_arrow_up</i>  Esconder');
        }else{
            $('.palavraUsada').html('<i class="material-icons ">keyboard_arrow_down</i>  Mostrar');
        }
    });
//formulario
    // ele pega os valor dos datas e coloca num input hidden, para enviar cok method get para a  busca

    $(".dropForm li").click(function(){
        var valor =$(this).data('valor');
        var id =$(this).data('id');
        var destino =$(this).data('destino');
        


        //troca o valor do campo na busca
        $("."+destino).text(valor);
        var  enviando = "."+destino+"_Enviar";
        //alert(enviando);
        $(enviando).val(id);

        //$("."+destino).val(id);


    });
//abrir comentario
    $("#escreverComentario").click(function(){
        $(".exibirComentario").fadeToggle(500);

    });
    //fechar menu
    $(".fechar").click(function(){

        $(".fundoNegro").fadeToggle(500);
        $(".menuSupenso").delay(800).animate({
            left: "-500",
        }, 500 );
    });
    $(".abreMenu").click(function(){

        $(".fundoNegro").fadeToggle(500);
        $(".menuSupenso").delay(800).animate({
            left: "0",
        }, 500 );
    });
});
$(document).ready(function() {
    $('select').material_select();
});
