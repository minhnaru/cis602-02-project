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

    var growthLayer = L.geoJson(ussData, {
        style: getStyle_birth,
        onEachFeature: onEachFeature_birth
    });

    var womenLayer = L.geoJson(ussData, {
        style: getStyle_female,
        onEachFeature: onEachFeature_female
    });

    // // init default map layer
    map.addLayer(growthLayer);

    // change map layer on change
    $('#layer-selector').change(function(event) {
        event.preventDefault();
        if ($(this).val() == "pop_growth") {
            map.setView([40, -96], 4);
            map.addLayer(growthLayer);
            map.removeLayer(womenLayer);
            map.legendControl.addLegend(getLegendHTML_birth());
            map.legendControl.removeLegend(getLegendHTML_female());
        } else if ($(this).val() == "women_pop") {
            map.setView([40, -96], 4);
            map.addLayer(womenLayer);
            map.removeLayer(growthLayer);
            map.legendControl.removeLegend(getLegendHTML_birth());
            map.legendControl.addLegend(getLegendHTML_female());
        }
    });

    function getStyle_birth(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor_birth(d.properties.total_birth)
        };
    }

    function getStyle_female(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor_female(d.properties.total_female)
        };
    }

    function getColor_birth(d) {
        return d >= 3600000 ? '#800026' :
               d >= 1200000 ? '#BD0026' :
               d >= 800000  ? '#E31A1C' :
               d >= 500000  ? '#FC4E2A' :
               d >= 400000  ? '#FD8D3C' :
               d >= 200000  ? '#FEB24C' :
               d >= 100000  ? '#FED976' :
                              '#FFEDA0';
    }

    function getColor_female(d) {
        return d >= 49000000 ? '#800026' :
               d >= 19000000 ? '#BD0026' :
               d >= 12000000 ? '#E31A1C' :
               d >= 8000000  ? '#FC4E2A' :
               d >= 5000000  ? '#FD8D3C' :
               d >= 3000000  ? '#FEB24C' :
               d >= 1000000  ? '#FED976' :
                         '#FFEDA0';
    }

    var color = d3.scaleSequential(d3.interpolateYlOrRd);

    function onEachFeature_birth(feature, layer) {
        layer.on({
            mousemove: mousemove_birth,
            mouseout: mouseout_birth,
            click: zoomToFeature
        });
    }

    function onEachFeature_female(feature, layer) {
        layer.on({
            mousemove: mousemove_female,
            mouseout: mouseout_female,
            click: zoomToFeature
        });
    }

    var closeTooltip;
    var popup_birth = new L.Popup({ autoPan: false });
    var popup_female = new L.Popup({ autoPan: false });

    function mousemove_birth(e) {
        var layer = e.target;

        // decimal number format
        var dec = layer.feature.properties.total_birth;
        var value = dec.toLocaleString('en-US', {
            minimumFractionDigits: 0
        });

        popup_birth.setLatLng(e.latlng);
        popup_birth.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        'Births: ' + value);

        if (!popup_birth._map) popup_birth.openOn(map);
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

    function mousemove_female(e) {
        var layer = e.target;

        // decimal number format
        var dec = layer.feature.properties.total_female;
        var value = dec.toLocaleString('en-US', {
            minimumFractionDigits: 0
        });

        popup_female.setLatLng(e.latlng);
        popup_female.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        'Female: ' + value);

        if (!popup_female._map) popup_female.openOn(map);
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

    function mouseout_birth(e) {
        growthLayer.resetStyle(e.target);
        closeTooltip = window.setTimeout(function() {
            map.closePopup();
        }, 100);
    }

    function mouseout_female(e) {
        womenLayer.resetStyle(e.target);
        closeTooltip = window.setTimeout(function() {
            map.closePopup();
        }, 100);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    // init population growth legend
    map.legendControl.addLegend(getLegendHTML_birth());

    function getLegendHTML_birth() {
        // calculate grade array for population growth legend
        var grade = _.sortBy(ussData.features, function(d) { return d.properties.total_birth; });
        var v = [];
        grade.map(function(d,i) { 
            if(i%6==1 && i !=7 && i != 31)
                v.push(d.properties["total_birth"]);
            if(i == 0)
                v.push(0);
        });
        var grades = [];
        v.map(function(d) { grades.push(Math.round( d / Math.pow(10,5))*100) }); // 5 is zeroCount

        var labels1 = [],
        labels2 = [],
        from, to;

        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels1.push(
            '<span style="background:' + getColor_birth(from*1000) + '"></span>');
            labels2.push(
            '<label>' + from + "k" + (to ? '&ndash;' + to + "k" : '+') + '</label>');
        }

        return '<div id="legend"><strong>Population Growth</strong><nav class="legend clearfix">' + labels1.join('') + labels2.join('') + '</nav></div>';
    }

    function getLegendHTML_female() {
        // calculate grade array for female population legend
        var grade = _.sortBy(ussData.features, function(d) { return d.properties.total_female; });
        var v = [];
        grade.map(function(d,i) { 
            if(i%6==1 && i !=7 && i != 31)
                v.push(d.properties["total_female"]);
            if(i == 0)
                v.push(0);
        });
        var grades = [];
        v.map(function(d) { grades.push(Math.round( d / Math.pow(10,6))) }); // 6 is zeroCount
        
        var labels1 = [],
        labels2 = [],
        from, to;

        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels1.push(
            '<span style="background:' + getColor_female(from*1000000) + '"></span>');
            labels2.push(
            '<label>' + from + "m" + (to ? ' &ndash; ' + to + "m" : '+') + '</label>');
        }

        return '<div id="legend"><strong>Female Population</strong><nav class="legend clearfix">' + labels1.join('') + labels2.join('') + '</nav></div>';
    }

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