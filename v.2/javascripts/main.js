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

function generateMap(dataNatality, elementID) {

    var locationOptions = {
        center: [38, -96],
        zoom: 4.2,
        minZoom: 3,
    };

    // Initial background map on #map div element
    var map = new L.map(elementID, locationOptions);

    var worldmap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={token}', {
        id: 'dark-v9',
        token: 'pk.eyJ1IjoibmFydW1pbmgiLCJhIjoiY2oxY3dvanlrMDAwdTJ3bzE5bnl4Mmk1ZyJ9.694Vl0Mc9dqbPrkL0svBhQ'
    });
    worldmap.addTo(map);
    map.addLayer(worldmap);

    // var myLayer_1 = L.geoJSON().addTo(map);
    // myLayer_1.addData(dataNatality);

    // // Original GEOJSON style

    // calculate total birth
    var totalBirth = _(dataNatality)
        .groupBy('State')
        .map((v, k) => ({
            State: k,
            Births: _.sumBy(v, 'Births')
        })).value();

    // var maxBirth = _.maxBy(totalBirth, 'Births');

    // combine total birth data
    _.each(ussData.features, function(d) {
        d.properties.total_birth = {};
        var state = d.properties.name;
        _.each(totalBirth, function(n) {
            if (n.State == state) {
                d.properties.total_birth = n["Births"];
            }
        });
    });

    // combine natality data
    _.each(ussData.features, function(d) {
        d.properties.natalities = [];
        var state = d.properties.name;
        _.each(dataNatality, function(n) {
            if (n.State == state) {
                var tmp = {
                    "Census Region": n["Census Region"],
                    "Year": n["Year"],
                    "Births": n["Births"],
                    "Total Population": n["Total Population"],
                    "Birth Rate": n["Birth Rate"],
                    "Female Population": n["Female Population"],
                    "Fertility Rate": n["Fertility Rate"]
                };
                d.properties.natalities.push(tmp);
            }
        });
    });

    console.log(ussData);

    function getColor(d) {
        return d > 4000000 ? '#800026' :
               d > 2500000 ? '#BD0026' :
               d > 1000000 ? '#E31A1C' :
               d > 500000  ? '#FC4E2A' :
               d > 300000  ? '#FD8D3C' :
               d > 200000  ? '#FEB24C' :
               d > 100000  ? '#FED976' :
                             '#FFEDA0';
    }

    // original GEOJSON style
    function myStyle(d) {
        return {
            fillColor: getColor(d.properties.total_birth),
            weight: 1,
            opacity: 0.65,
            color: 'white',
            fillOpacity: 0.7
        };
    }

    // Function Highlight feature on mouseover
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 4,
            color: '#666',
            opacity: 1,
            fillColor: '#4286f4',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    var featureLayer;

    // Function on mouseout - reset layer style to its default
    function resetHighlight(e) {
        featureLayer.resetStyle(e.target);
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

    function onEachFeature(feature, layer) {
        layer.on('mouseover', function(e) {
            highlightFeature(layer);
        });
        layer.on('mouseout', function(e) {
            resetHighlight(layer);
        });
    }

    featureLayer = L.geoJson(ussData, {
        style: myStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

}

function createVis(errors, dataNatality, elementID)
{
    if (errors) throw errors;

    about();
    generateMap(dataNatality, "map");

}

d3.queue()
    // .defer(d3.json, "https://raw.githubusercontent.com/minhnaru/cis602-02-project/master/data/natality.json")
    .defer(d3.json, "https://raw.githubusercontent.com/minhnaru/cis602-02-project/master/data/natality.json")
    .await(createVis);




