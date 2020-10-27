const
    GEO_API = 'http://api.sypexgeo.net/',
    CITIES_API = 'https://glavpunkt.ru/api/get_rf_cities',
    SHIPPING_API = 'https://glavpunkt.ru/api-1.1/get_tarif?serv=курьерская доставка&cityFrom=SPB&weight=0.1&price=200&paymentType=prepaid&cityTo=';

let gp_city, city, cities = [], ship;


function getXmlRequest(url, callback){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.onreadystatechange = function(){
        if(xhr.status == 200 && xhr.readyState == 4){
            callback.call(xhr.responseText);
        }
        if(xhr.status !=200){
            console.log('error');
            //дописать
        }
    }
    xhr.send();
}

function sleep(){
    let i = 0;
    while(i < 1000000){
        i++;
    }
    return;
}

function loadCityList() {
    if(cities.length == 0){
        getXmlRequest(CITIES_API, function() {
            cities = $.parseJSON(this);
        })
    }
}
function calcPriceShip() {
    if(gp_city){
        getXmlRequest(SHIPPING_API + gp_city.code, function(){
            ship = $.parseJSON(this);
            saveShipPrice();
        })
    }
}
function saveShipPrice() {
    document.getElementsByClassName('order-form-shipprice')[0].innerText = ship ? 'Доставим за ' + ship.tarif + 'руб по сроку в ' + ship.period + ' дней': 'куда вести, шеф?';
}


jQuery(($) => {
    $('#city_name').on('click', function(e) {
        e.preventDefault();
        $.fancybox.open({
            src   : '#choose_city',
            type  : 'inline',
        });
        loadCityList();
    });
    $('[name=city_choose]').on('keyup', function() {
        let search = $(this).val(),
        result = '<ul>',
        counter = 0;
       // console.log(search);
        for(let i = 0; i < cities.length; i++){
            if(cities[i].name.toLowerCase().indexOf(search.toLowerCase()) >= 0)
            result += '<li>' + cities[i].name + '(' + cities[i].area + ')' + '</li>';
            counter++;
        }
    
        result += '</ul>';
        if(!counter){
            result = 'Ничего не найдено'
        }
        $('#search_result').html(result);

        $('body').on('click', '#search_result li', function() {
            for(let i = 0; i < cities.length; i++){
                if (cities[i].name == $(this).html().split('(')[0]) {
                    gp_city = cities[i];
                    break;
                }
            }
            $('#city_name').html(gp_city.name);
            calcPriceShip();
            $.fancybox.close();
        })
    } );


    $('.ajax-loader').show();
    $.ajax({
        url:GEO_API,
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function(result){
            sleep();
            console.log(result);
            loadCityList();
            let i = 0;
            for(; i < cities.length; i++){
                if (cities[i].name.toLowerCase() == result.city.name_ru.toLowerCase()) {
                    gp_city = cities[i];
                    break;
                }
            }
            console.log(i)
            console.log(cities.length)
            console.log(gp_city)
            if (gp_city) {
                $('#city_name').html(gp_city.name);
                calcPriceShip();
            }
            else {
                $('#city_name').html('Не определен город');
            }
            $('.ajax-loader').hide();
        },
        error: function(result){
            $('.ajax-loader').hide();
        }
    })
})  