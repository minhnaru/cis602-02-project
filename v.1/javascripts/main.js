window.onload = function() {

    // when user clicks the about button, show the text
    $("#about").on("click", function(){
        $("#about").hide();
        $("#about-inset").css('visibility', 'visible');
        $("#about-text").css('visibility', 'visible');
    });
    
    // when user clicks on about inset, show just the about button
    $("#about-inset").on("click", function(){
        $("#about-inset").css('visibility', 'hidden');
        $("#about-text").css('visibility', 'hidden');
        $("#about").show();
    });

    // var mapboxAccessToken = {token};
    var map = L.map('map').setView([37.8, -96], 4);

    L.tileLayer('https://a.tiles.mapbox.com/v4/mapbox.dark/{z}/{x}/{y}.png?access_token={token}', {
        attribution: 'Mapbox',
        subdomains: ['a','b','c','d'],
        token: 'pk.eyJ1IjoibmFydW1pbmgiLCJhIjoiY2oxY3dvanlrMDAwdTJ3bzE5bnl4Mmk1ZyJ9.694Vl0Mc9dqbPrkL0svBhQ'
    }).addTo(map);

    // L.geoJson(uss).addTo(map);


}

function createVis(errors, data)
{
    if (errors) throw errors;
}

d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/minhnaru/project/master/Natality_1.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/minhnaru/project/master/Natality_2.csv")
    .await(createVis);




