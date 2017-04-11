function about() {
    // Show the text when clicking about button
    $("#about").on("click", function(){
        $("#about").hide();
        $("#about-inset").css('visibility', 'visible');
        $("#about-text").css('visibility', 'visible');
    });
    
    // Hide the text when clicking on about text
    $("#about-inset").on("click", function(){
        $("#about-inset").css('visibility', 'hidden');
        $("#about-text").css('visibility', 'hidden');
        $("#about").show();
    });
}

function generateMap(data, elementID) {

    // Initial background map on #map div element
    var map = L.map(elementID).setView([37.8, -96], 4);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}', {
        id: 'mapbox.dark',
        attribution: 'Mapbox',
        subdomains: ['a','b','c','d'],
        token: 'pk.eyJ1IjoibmFydW1pbmgiLCJhIjoiY2oxY3dvanlrMDAwdTJ3bzE5bnl4Mmk1ZyJ9.694Vl0Mc9dqbPrkL0svBhQ'
    }).addTo(map);

    var color = d3.scaleSequential(d3.interpolateReds);

    // Original GEOJSON style
    function style() {
        return {
            fillColor: 'white',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0
        };
    }

    // Function Highlight feature on mouseover
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    var geojson;

    // Function on mouseout - reset layer style to its default
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    // Click and zoom to state
    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    // Add the listeners on state layers
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

}

function createVis(errors, data, elementID)
{
    if (errors) throw errors;

    about();
    generateMap(data, "map");

}

d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/minhnaru/project/master/Natality_1.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/minhnaru/project/master/Natality_2.csv")
    .await(createVis);




