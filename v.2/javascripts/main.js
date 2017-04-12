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

    var locationOptions = {
        center: [38, -96],
        zoom: 4.2,
        minZoom: 3
    };

    // Initial background map on #map div element
    var map = new L.map(elementID, locationOptions);

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={token}', {
        id: 'dark-v9',
        token: 'pk.eyJ1IjoibmFydW1pbmgiLCJhIjoiY2oxY3dvanlrMDAwdTJ3bzE5bnl4Mmk1ZyJ9.694Vl0Mc9dqbPrkL0svBhQ'
    }).addTo(map);

    var color = d3.scaleSequential(d3.interpolateReds);

    // Original GEOJSON style
    var myStyle = {
        "color": "#ffffff",
        "fillColor": "#ffffff",
        "weight": 1,
        "opacity": 1,
        "fillOpacity": 0
    };

    // Function Highlight feature on mouseover
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 4,
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
        style: myStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

}

function createVis(errors, data, elementID)
{
    if (errors) throw errors;

    about();
    generateMap(data, "map");

    console.log(data);

}

d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/minhnaru/project/master/Natality.csv")
    .await(createVis);




