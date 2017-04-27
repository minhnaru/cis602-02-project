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

    // // display a map
    // mapboxgl.accessToken = 'pk.eyJ1IjoibmFydW1pbmgiLCJhIjoiY2oxY3dvanlrMDAwdTJ3bzE5bnl4Mmk1ZyJ9.694Vl0Mc9dqbPrkL0svBhQ';
    // var worldmap = new mapboxgl.Map({
    //     container: 'map', // container id
    //     style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
    //     center: [-97, 38], // starting position
    //     zoom: 3.2 // starting zoom
    // });

    // display a map
    L.mapbox.accessToken = 'pk.eyJ1IjoibmFydW1pbmgiLCJhIjoiY2oxY3dvanlrMDAwdTJ3bzE5bnl4Mmk1ZyJ9.694Vl0Mc9dqbPrkL0svBhQ';
    var map = L.mapbox.map('map', 'mapbox.dark')
        .setView([40, -96], 4);

    // calculate total birth
    var totalBirth = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            Births: _.sumBy(v, "Births")
        })).value();

    // calculate total female population
    var totalFemale = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            Female: _.sumBy(v, "Female Population")
        })).value();

    // combine total data
    _.each(ussData.features, function(d) {
        d.properties.total_birth = {};
        d.properties.total_female = {};
        var state = d.properties.name;
        _.each(totalBirth, function(n) {
            if (n.State == state) {
                d.properties.total_birth = n["Births"];
            }
        });
        _.each(totalFemale, function(n) {
            if (n.State == state) {
                d.properties.total_female = n["Female"];
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

    var statesLayer = L.geoJson(ussData, {
        style: getStyle,
        onEachFeature: onEachFeature
    });

    map.addLayer(statesLayer);

    function getStyle(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor(d.properties.total_birth)
        };
    }

    function getStyle1(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor(d.properties.total_female)
        };
    }

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

    function onEachFeature(feature, layer) {
        layer.on({
            mousemove: mousemove,
            mouseout: mouseout,
            click: zoomToFeature
        });
    }

    var closeTooltip;
    var popup = new L.Popup({ autoPan: false });

    function mousemove(e) {
        var layer = e.target;

        // decimal number format
        var dec = layer.feature.properties.total_birth;
        var value = dec.toLocaleString('en-US', {
            minimumFractionDigits: 0
        });

        popup.setLatLng(e.latlng);
        popup.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        'Births: ' + value);

        if (!popup._map) popup.openOn(map);
        window.clearTimeout(closeTooltip);

        // highlight feature
        layer.setStyle({
            weight: 3,
            opacity: 0.3,
            fillOpacity: 0.9
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
        }
    }

    function mouseout(e) {
        statesLayer.resetStyle(e.target);
        closeTooltip = window.setTimeout(function() {
            map.closePopup();
        }, 100);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    map.legendControl.addLegend(document.getElementById('legend').innerHTML);

    // map.legendControl.addLegend(getLegendHTML());

    // function getLegendHTML() {
    //     var grades = [0, 100, 200, 300, 500, 1000, 2500, 4000],
    //     labels = [],
    //     from, to;

    //     for (var i = 0; i < grades.length; i++) {
    //         from = grades[i];
    //         to = grades[i + 1];

    //         labels.push(
    //         '<li><span class="swatch" style="background:' + getColor((from*1000) + 1) + '"></span> ' +
    //         from + "k" + (to ? '&ndash;' + to + "k" : '+')) + '</li>';
    //     }

    //     return '<span>Population Density</span><ul>' + labels.join('') + '</ul>';
    // }

}

function updateMap() {

}

function createVis(errors, dataNatality, elementID)
{
    if (errors) throw errors;

    about();
    generateMap(dataNatality, "map");

}

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/minhnaru/cis602-02-project/master/data/natality.json")
    .await(createVis);