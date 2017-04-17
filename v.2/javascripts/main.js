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

    // // draw US map
    // var myStyle_us = {
    //     "color": "#ffffff",
    //     "fillColor": "#ffffff",
    //     "weight": 1,
    //     "opacity": 0.65,
    //     "fillOpacity": 0
    // };

    // L.geoJSON(ussData, {
    //     style: myStyle_us
    // }).addTo(map);

    var color = d3.scaleSequential(d3.interpolateReds);

    // var dataNatality = data;

    // var myLayer_1 = L.geoJSON().addTo(map);
    // myLayer_1.addData(dataNatality);

    // // Original GEOJSON style
    // var myStyle = {
    //     "color": "#ffffff",
    //     "fillColor": "#ffffff",
    //     "weight": 1,
    //     "opacity": 0.65,
    //     "fillOpacity": 0
    // };

    // combine data
    _.each(ussData.features, function(d) {
        d.properties.natalities = [];
        var state = d.properties.name;
        _.each(dataNatality, function(n) {
            if (n.State == state) {
                var tmp = {
                    "Year": n["Year"],
                    "Diabetes": n["Diabetes"],
                    "Tobacco Use": n["Tobacco Use"],
                    "Age of Mother": n["Age of Mother"],
                    "Births": n["Births"]
                };
                d.properties.natalities.push(tmp);
            }
        });
    });

    // _.each(ussData.features, function(d) {
    //     d.properties.total = [];
    //     var
    // });

    var ussd = ussData.features;
    var ussf = _.map(ussd, function(d) { return d.properties.natalities; });
    console.log(ussf);

    // // combine data
    // _.each(ussData.features, function(d) {
    //     d.properties.natalities = [];
    //     d.properties.total = [];
    //     var state = d.properties.name;
    //     _.each(dataNatality, function(n) {
    //         if (n.State == state) {
    //             var tmp = {
    //                 "Year": n["Year"],
    //                 "Diabetes": n["Diabetes"],
    //                 "Tobacco Use": n["Tobacco Use"],
    //                 "Age of Mother": n["Age of Mother"],
    //                 "Births": n["Births"]
    //             };
    //             d.properties.natalities.push(tmp);
    //             var sum = {
    //                 "Total": _.sumBy(ussData.features, function(s) { return s.properties.natalities.Births})
    //             };
    //             console.log(n.Births);
    //         }
    //     });
    // });

    // _.each(ussData.features, function(d) {
    //     d.properties.total = [];
    //     _.each(ussData.features, function(n) {
    //         var sum = _.sumBy(ussData.features, function(s) { return s.properties.natalities.Births});
    //         var tmp = {
    //             "Total": sum
    //         };
    //         d.properties.natalities.push(tmp);
    //     });
    // });

    console.log(ussData);



    // function getColor(d) {
    //     return d > 1000 ? '#800026' :
    //            d > 500  ? '#BD0026' :
    //            d > 200  ? '#E31A1C' :
    //            d > 100  ? '#FC4E2A' :
    //            d > 50   ? '#FD8D3C' :
    //            d > 20   ? '#FEB24C' :
    //            d > 10   ? '#FED976' :
    //                       '#FFEDA0';
    // }

    function getColor(d) {
        return d > 90 ? '#800026' :
               d > 80  ? '#BD0026' :
               d > 70  ? '#E31A1C' :
               d > 50  ? '#FC4E2A' :
               d > 40   ? '#FD8D3C' :
               d > 30   ? '#FEB24C' :
               d > 20   ? '#FED976' :
                          '#FFEDA0';
    }

    // var ussMap = ussData.features;
    // var ahihi = _.map(ussMap, function(d) { return d.properties.name; })
    // console.log(ahihi);

    function myStyle(feature) {
        return {
            fillColor: getColor(feature.properties.density),
            // fillColor: getColor(testi[feature.properties.name]),
            // fillColor: _.map(ussMap, function(d){return (testi[feature.properties.name] == undefined) ? "#fff" : getColor(testi[feature.properties.name]);}),
            weight: 1,
            opacity: 0.65,
            color: 'white',
            fillOpacity: 0.7
        };
    }

    L.geoJSON(ussData, {
        style: myStyle
    }).addTo(map);



    // // Function Highlight feature on mouseover
    // function highlightFeature(e) {
    //     var layer = e.target;

    //     layer.setStyle({
    //         weight: 4,
    //         color: '#666',
    //         dashArray: '',
    //         fillOpacity: 0.7
    //     });

    //     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    //         layer.bringToFront();
    //     }
    // }

    // var geojson;

    // // Function on mouseout - reset layer style to its default
    // function resetHighlight(e) {
    //     geojson.resetStyle(e.target);
    // }

    // // Click and zoom to state
    // function zoomToFeature(e) {
    //     map.fitBounds(e.target.getBounds());
    // }

    // // Add the listeners on state layers
    // function onEachFeature(feature, layer) {
    //     layer.on({
    //         mouseover: highlightFeature,
    //         mouseout: resetHighlight,
    //         click: zoomToFeature
    //     });
    // }

    // geojson = L.geoJson(statesData, {
    //     style: myStyle,
    //     onEachFeature: onEachFeature
    // }).addTo(map);

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




