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

function processData (dataNatality) {
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

    // calculate average birth rate
    var avgBirthRate = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            BirthR: Math.round((_.sumBy(v, "Birth Rate") / 9) * 100) / 100
        })).value();

    // combine total data
    _.each(ussData.features, function(d) {
        d.properties.total_birth = {};
        d.properties.total_female = {};
        d.properties.avg_birthrate = {};
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
        _.each(avgBirthRate, function(n) {
            if (n.State == state) {
                d.properties.avg_birthrate = n["BirthR"];
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
}

// function to create Population Growth & Women Population choropleth map
function generateMap(dataNatality, elementID) {

    // display a map
    L.mapbox.accessToken = 'pk.eyJ1IjoibmFydW1pbmgiLCJhIjoiY2oxY3dvanlrMDAwdTJ3bzE5bnl4Mmk1ZyJ9.694Vl0Mc9dqbPrkL0svBhQ';
    var map = L.mapbox.map('map', 'mapbox.dark')
        .setView([40, -96], 4);

    // define each layer
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

    // var colorBirth = d3.scaleSequential(d3.interpolateYlOrRd).domain([0,3600]);

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

function generateScatter(divId) {

    console.log(ussData);
    console.log(ussData.features[0].properties.natalities[0]["Birth Rate"]);



// ---------------------

    // // set the width, height, and margins of svg
    // var margin = {top: 35, right: 35, bottom: 35, left: 35},
    // w = 300 - margin.left - margin.right,
    // h = 225 - margin.top - margin.bottom;

    // // load the data
    // var dataset = ussData.features;

    // var xScale = d3.scale.linear()
    //             .domain([0, d3.max(dataset, function(d){
    //                 return d.properties.pop_density;
    //             })])
    //             .range([0, w]);

    // var yScale = d3.scale.linear()
    //             .domain([0, d3.max(dataset, function(d){
    //                 return d.properties.crash_area;
    //             })])
    //             .range([h, 0]);

    // // create the scatterplot svg
    // var svg = d3.select("#d3-elements")
    //     .append("div")
    //     .classed("svg-container", true)
    //     .append("svg")
    //     .attr("preserveAspectRatio", "xMinYMin meet")
    //     .attr("viewBox", "0 0 300 225")
    //     .classed("svg-content-responsive", true)
    //     .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // // make a scatterplot
    // svg.selectAll("circle")
    //     .data(dataset)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", function(d){
    //         return xScale(d.properties.pop_density);
    //     })
    //     .attr("cy", function(d){
    //         return yScale(d.properties.crash_area);
    //     })
    //     .attr("r", function(d){
    //         return 4;
    //     })
    //     .attr("fill", "#1DFF84")
    //     .attr("opacity", 0.5);

    // // create axes
    // var xAxis = d3.svg.axis()
    //             .scale(xScale)
    //             .orient("bottom")
    //             .ticks(5)
    //             .innerTickSize(1)
    //             .outerTickSize(0);

    // var yAxis = d3.svg.axis()
    //             .scale(yScale)
    //             .orient("right")
    //             .ticks(5)
    //             .innerTickSize(1)
    //             .outerTickSize(0);

    // // append the x axis to the svg
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + h + ")")
    //     .call(xAxis);

    // // append a label to the x axis
    // svg.append("text")
    //     .attr("id", "xlabel")
    //     .text("Population Density")
    //     .style("text-anchor", "middle")
    //     .attr("fill", "white")
    //     .attr("font-family", "HelveticaNeue-Light, Helvetica, sans-serif")
    //     .attr("font-size", "10px")
    //     .attr("x", w/2)
    //     .attr("y", h + margin.bottom - 5);

    // // append the y axis to the svg
    // svg.append("g")
    //     .attr("class", "y axis")
    //     .attr("transform", "translate(0,0)")
    //     .call(yAxis);

    // // append a label to the y axis
    // svg.append("text")
    //     .text("Crashes per Sq. Mi.")
    //     .style("text-anchor", "middle")
    //     .attr("fill", "white")
    //     .attr("font-family", "HelveticaNeue-Light, Helvetica, sans-serif")
    //     .attr("font-size", "10px")
    //     .attr("x", -80)
    //     .attr("y", -10)
    //     .attr("transform", "rotate(-90)");

    // // append a title
    // svg.append("text")
    //     .attr("id", "sctitle")
    //     .attr("x", (w / 2))             
    //     .attr("y", 0 - (margin.top / 2))
    //     .attr("text-anchor", "middle")  
    //     .attr("font-size", "12px")
    //     .attr("font-family", "HelveticaNeue-Light, Helvetica, sans-serif")
    //     .attr("fill", "white")
    //     .text("Relating Population Density and Crash Density");

// ------------------------

    // var scaW = 250,
    //     scaH = 200,
    //     scaMargin = {top: 10, bottom: 10, left: 55, right: 10},
    //     scaX = d3.scaleBand().rangeRound([0, scaW], .1).padding(5),
    //     scaY = d3.scaleLinear().range([scaH, 0]),
    //     data = ussData.features;

    // var scaSvg = d3.select(divId).append("svg")
    //     .attr("width", scaW+scaMargin.left+scaMargin.right)
    //     .attr("height", scaH+scaMargin.top+scaMargin.bottom)
    //     .append("g")
    //     .attr("class", "scaC")
    //     .attr("transform", "translate(" + scaMargin.left + "," + scaMargin.top + ")");

    // scaX.domain(data.map(function(d) { return d.properties.total_female; }));
    // scaY.domain([ d3.min(data, function(d) { return +d.properties.total_birth; }) , d3.max(data, function(d) { return +d.properties.total_birth; }) ]);

    // var scaXAxis = d3.axisBottom(scaX);

    // var scaYAxis = d3.axisLeft(scaY).tickFormat(d3.formatPrefix(".1", 1e3));

    // scaSvg.append("g")
    //     .attr("stroke", "white")
    //     .attr("transform", "translate(0," + scaH +")")
    //     .attr("class", "xA")
    //     .call(scaXAxis)

    // scaSvg.append("g")
    //     .attr("stroke", "white")
    //     .attr("class", "yA")
    //     .call(scaYAxis)

    // scaSvg.append("g")
    //     .attr("transform", "translate(-30," + (scaH/2) + ") rotate(-90)")
    //     .append("text")
    //     .attr("y", 0)
    //     .attr("font-size", 9)
    //     .style("color", "white")
    //     .style("text-anchor", "middle")
    //     .text("Total Employees")

    // scaSvg.append("text")
    //     .attr("x", scaW/2)
    //     .attr("y", scaH + 45)
    //     .text("Year")
    
}

function createVis(errors, dataNatality, elementID)
{
    if (errors) throw errors;

    about();
    processData(dataNatality);
    generateMap(dataNatality, "map");
    generateScatter("#d3-elements");

}

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/minhnaru/cis602-02-project/master/data/natality.json")
    .await(createVis);