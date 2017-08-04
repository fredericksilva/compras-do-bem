function getLocation() {
  var geocoder;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
  }

  initialize()

  function successFunction(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    codeLatLng(lat, lng)
  }

  function errorFunction() {
    console.log("Não pudemos obter sua localização para mostrar os serviços personalizados de sua área.");
  }

  function initialize() {
    geocoder = new google.maps.Geocoder();
  }

  function codeLatLng(lat, lng) {

    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({
        'latLng': latlng
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        //- console.log(results)
        if (results[1]) {
          //find country name
          for (var i = 0; i < results[0].address_components.length; i++) {
            for (var b = 0; b < results[0].address_components[i].types.length; b++) {

              //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
              if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                //this is the object you are looking for
                city = results[0].address_components[i];
                break;
              }
            }
          }
          //city data
          $('#cid_destino').attr('data-valor', city.long_name + ' - ' + city.short_name);
          $('#cid_destino').attr('data-id', city.long_name + ' - ' + city.short_name);
          $('#cid_destino a').text('data-id', city.long_name + ' - ' + city.short_name);
          dropClick($('#cid_destino'));
        } else {
          $('#cid_destino').attr('data-valor', city.long_name + ' - ' + city.short_name);
          $('#cid_destino').attr('data-id', city.long_name + ' - ' + city.short_name);
          localStorage.cidade = city.long_name
          localStorage.cid = city.short_name
          dropClick($('#cid_destino'));
          console.log("Nenhum serviço encontrado");
        }
      } else {
        console.log("Não pudemos obter sua localização devido à: " + status);
      }
    });
  }

}

function dropClick(esse) {
  if (esse.data('valor') === 'Minha Localização') {
    getLocation()
  } else {
    var valor =esse.data('valor');
    var id =esse.data('id');
    var destino =esse.data('destino');

    //troca o valor do campo na busca
    $("."+destino).text(valor);
    var  enviando = "."+destino+"_Enviar";
    //alert(enviando);
    $(enviando).val(id);

    $("."+destino).val(id);
  }
}

$(document).ready(function() {

  // Alert box close
  $(document).on('click', '#alert-close', function() {
    $('#alert').fadeOut('slow', function() {

    })
  })

  $(".dropForm li").on('click', function(){
    dropClick($(this));

  });

});