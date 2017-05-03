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
    var avgBirth = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            Births: Math.round((_.sumBy(v, "Births") / 3) * 1) / 1
        })).value();

    // calculate total female population
    var avgFemale = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            Female: Math.round((_.sumBy(v, "Female Population") / 3) * 1) / 1
        })).value();

    // calculate average birth rate
    var avgBirthRate = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            BirthR: Math.round((_.sumBy(v, "Birth Rate") / 3) * 100) / 100
        })).value();

    // calculate average median income
    var avgIncome = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            Income: Math.round((_.sumBy(v, "Median Income") / 3) * 1) / 1
        })).value();

    // calculate female tobacco use
    var femaleTobacco = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            Tobacco: Math.round((_.sumBy(v, "Female Tobacco Use") / 3) * 10) / 10
        })).value();

    // calculate fertility rate
    var avgFertilityRate = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            FertilityR: Math.round((_.sumBy(v, "Fertility Rate") / 3) * 100) / 100
        })).value();

    // calculate average infant death rate
    var avgDeathRate = _(dataNatality)
        .groupBy("State")
        .map((v, k) => ({
            State: k,
            DeathR: Math.round((_.sumBy(v, "Infant Death Rate") / 3) * 100) / 100
        })).value();

    // combine total data
    _.each(ussData.features, function(d) {
        d.properties.avg_birth = {};
        d.properties.avg_female = {};
        d.properties.avg_birthrate = {};
        d.properties.avg_income = {};
        d.properties.avg_tobacco = {};
        d.properties.avg_fertilityrate = {};
        d.properties.avg_deathrate = {};
        var state = d.properties.name;
        _.each(avgBirth, function(n) {
            if (n.State == state) {
                d.properties.avg_birth = n["Births"];
            }
        });
        _.each(avgFemale, function(n) {
            if (n.State == state) {
                d.properties.avg_female = n["Female"];
            }
        });
        _.each(avgBirthRate, function(n) {
            if (n.State == state) {
                d.properties.avg_birthrate = n["BirthR"];
            }
        });
        _.each(avgIncome, function(n) {
            if (n.State == state) {
                d.properties.avg_income = n["Income"];
            }
        });
        _.each(femaleTobacco, function(n) {
            if (n.State == state) {
                d.properties.avg_tobacco = n["Tobacco"];
            }
        });
        _.each(avgDeathRate, function(n) {
            if (n.State == state) {
                d.properties.avg_deathrate = n["DeathR"];
            }
        });
        _.each(avgFertilityRate, function(n) {
            if (n.State == state) {
                d.properties.avg_fertilityrate = n["FertilityR"];
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
                    "Year": n["Year"],
                    "Births": n["Births"],
                    "Total Population": n["Total Population"],
                    "Birth Rate": n["Birth Rate"],
                    "Female Population": n["Female Population"],
                    "Fertility Rate": n["Fertility Rate"],
                    "Median Income": n["Median Income"],
                    "Female Tobacco Use": n["Female Tobacco Use"],
                    "Infant Death Rate": n["Infant Death Rate"]
                };
                d.properties.natalities.push(tmp);
            }
        });
    });
}

function getColor(d, v1, v2, v3, v4, v5, v6, v7) {
    return d >= v7 ? '#800026' :
           d >= v6 ? '#BD0026' :
           d >= v5 ? '#E31A1C' :
           d >= v4 ? '#FC4E2A' :
           d >= v3 ? '#FD8D3C' :
           d >= v2 ? '#FEB24C' :
           d >= v1 ? '#FED976' :
                     '#FFEDA0';
}

// generate legends
function getLegend(legendTitle, propAttr, zeroCount, range, multiLegend, normNum, shortNum) {
    // calculate grade array for population growth legend
    var grade = _.sortBy(ussData.features, function(d) { return d.properties[propAttr]; });
    var v = [];
    grade.map(function(d,i) { 
        if(i%6==1 && i !=7 && i != 31)
            v.push(d.properties[propAttr]);
        if(i == 0)
            v.push(0);
    });
    var grades = [];
    v.map(function(d) { grades.push(Math.round( d / Math.pow(10,zeroCount))*range) });
    // console.log(grades);
    // console.log(v);
    
    var labels1 = [],
    labels2 = [],
    from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels1.push(
        '<span style="background:' + getColor(from*multiLegend, grades[1]*multiLegend, grades[2]*multiLegend, grades[3]*multiLegend, grades[4]*multiLegend, grades[5]*multiLegend, grades[6]*multiLegend, grades[7]*multiLegend) + '"></span>');
        labels2.push(
        '<label>' + (from/normNum) + shortNum + ((to/normNum) ? '&ndash;' + (to/normNum) + shortNum : '+') + '</label>');
    }
    return '<div id="legend"><strong>' + legendTitle + '</strong><nav class="legend clearfix">' + labels1.join('') + labels2.join('') + '</nav></div>';
}

// function to create Population Growth & Women Population choropleth map
function generateMap(dataNatality, elementID, divId) {

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

    var incomeLayer = L.geoJson(ussData, {
        style: getStyle_income,
        onEachFeature: onEachFeature_income
    });

    var tobaccoLayer = L.geoJson(ussData, {
        style: getStyle_tobacco,
        onEachFeature: onEachFeature_tobacco
    });

    // // init default map layer
    map.addLayer(growthLayer);

    // change map layer on layer-selector
    $('#layer-selector').change(function(event) {
        event.preventDefault();
        if ($(this).val() == "pop_growth") {
            map.setView([40, -96], 4);
            map.addLayer(growthLayer);
            map.removeLayer(womenLayer);
            map.removeLayer(incomeLayer);
            map.removeLayer(tobaccoLayer);
            map.legendControl.addLegend(getLegendHTML_birth());
            map.legendControl.removeLegend(getLegendHTML_female());
            map.legendControl.removeLegend(getLegendHTML_income());
            map.legendControl.removeLegend(getLegendHTML_tobacco());
            updateScatter("#d3-elements", "avg_birth", "Number of Birth");
        } else if ($(this).val() == "female_pop") {
            map.setView([40, -96], 4);
            map.addLayer(womenLayer);
            map.removeLayer(growthLayer);
            map.removeLayer(incomeLayer);
            map.removeLayer(tobaccoLayer);
            map.legendControl.addLegend(getLegendHTML_female());
            map.legendControl.removeLegend(getLegendHTML_birth());
            map.legendControl.removeLegend(getLegendHTML_income());
            map.legendControl.removeLegend(getLegendHTML_tobacco());
            updateScatter("#d3-elements", "avg_female", "Female Population");
        } else if ($(this).val() == "median_income") {
            map.setView([40, -96], 4);
            map.addLayer(incomeLayer);
            map.removeLayer(growthLayer);
            map.removeLayer(womenLayer);
            map.removeLayer(tobaccoLayer);
            map.legendControl.addLegend(getLegendHTML_income());
            map.legendControl.removeLegend(getLegendHTML_birth());
            map.legendControl.removeLegend(getLegendHTML_female());
            map.legendControl.removeLegend(getLegendHTML_tobacco());
            updateScatter("#d3-elements", "avg_income", "Median Income ($)");
        } else if ($(this).val() == "female_tobacco") {
            map.setView([40, -96], 4);
            map.addLayer(tobaccoLayer);
            map.removeLayer(growthLayer);
            map.removeLayer(womenLayer);
            map.removeLayer(incomeLayer);
            map.legendControl.addLegend(getLegendHTML_tobacco());
            map.legendControl.removeLegend(getLegendHTML_birth());
            map.legendControl.removeLegend(getLegendHTML_female());
            map.legendControl.removeLegend(getLegendHTML_income());
            updateScatter("#d3-elements", "avg_tobacco", "Female Tobacco Use (%)");
        }
    });

    // change scatter map on data-layer
    $('#data-selector').change(function(event) {
        event.preventDefault();
        if ($(this).val() == "birth_rate") {
            updateScatter2("#d3-elements", "avg_birthrate", "Birth Rate per 1000 Population")
        } else if ($(this).val() == "fertility_rate") {
            updateScatter2("#d3-elements", "avg_fertilityrate", "Fertility Rate per 1000 Population")
        } else if ($(this).val() == "death_rate") {
            updateScatter2("#d3-elements", "avg_deathrate", "Death Rate per 1000 Population")
        }
    });

    function getStyle_birth(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor(d.properties.avg_birth, 10000, 20000, 40000, 60000, 90000, 130000, 400000)
        };
    }

    function getStyle_female(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor(d.properties.avg_female, 100000, 300000, 600000, 900000, 1400000, 2100000, 5600000)
        };
    }

    function getStyle_income(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor(d.properties.avg_income, 42000, 49000, 52000, 54000, 62000, 66000, 73000)
        };
    }

    function getStyle_tobacco(d) {
        return {
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor(d.properties.avg_tobacco, 9, 14.5, 15.4, 16.1, 18.8, 20.4, 25.1)
        };
    }

    // var latlng = L.latLng(40, -96);
    // popup_female.setLatLng(e.latlng);

    // function getStyle_income(d) {
    //     _.map(ussData, function(collection) {
    //         /* Add a LatLng object to each item in the dataset */
    //         collection.objects.forEach(function(d) {
    //             d.LatLng = new L.LatLng(d.circle.coordinates[0],
    //                                     d.circle.coordinates[1])
    //         })
    //     });
    //     // latlng.setLatLng(d.latlng);
    //     // var LatLng = new latlng.setLatLng(40, -96);
    //     return L.circleMarker(d.LatLng, {
    //         weight: 10,
    //         color: 'red',
    //         fillOpacity: 0.7,
    //         fillColor: 'red'
    //         // fillColor: getColor_income(d.properties.avg_income)
    //     });
    // }

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

    function onEachFeature_income(feature, layer) {
        layer.on({
            mousemove: mousemove_income,
            mouseout: mouseout_income,
            click: zoomToFeature
        });
    }

    function onEachFeature_tobacco(feature, layer) {
        layer.on({
            mousemove: mousemove_tobacco,
            mouseout: mouseout_tobacco,
            click: zoomToFeature
        });
    }

    var closeTooltip;
    var popup_birth = new L.Popup({ autoPan: false });
    var popup_female = new L.Popup({ autoPan: false });
    var popup_income = new L.Popup({ autoPan: false });
    var popup_tobacco = new L.Popup({ autoPan: false });

    function mousemove_birth(e) {
        var layer = e.target;

        // decimal number format
        var dec = layer.feature.properties.avg_birth;
        var value = dec.toLocaleString('en-US', {
            minimumFractionDigits: 0
        });

        popup_birth.setLatLng(e.latlng);
        popup_birth.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        'Number of Births: ' + value);

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
        var dec = layer.feature.properties.avg_female;
        var value = dec.toLocaleString('en-US', {
            minimumFractionDigits: 0
        });

        popup_female.setLatLng(e.latlng);
        popup_female.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        'Female Population: ' + value);

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

    function mousemove_income(e) {
        var layer = e.target;

        // decimal number format
        var dec = layer.feature.properties.avg_income;
        var value = dec.toLocaleString('en-US', {
            minimumFractionDigits: 0
        });

        popup_income.setLatLng(e.latlng);
        popup_income.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        'Median Income: ' + '$' + value);

        if (!popup_income._map) popup_income.openOn(map);
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

    function mousemove_tobacco(e) {
        var layer = e.target;

        // decimal number format
        var dec = layer.feature.properties.avg_tobacco;
        var value = dec.toLocaleString('en-US', {
            minimumFractionDigits: 0
        });

        popup_tobacco.setLatLng(e.latlng);
        popup_tobacco.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        'Female Tobacco Use: ' + value + '%');

        if (!popup_tobacco._map) popup_tobacco.openOn(map);
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

    function mouseout_income(e) {
        incomeLayer.resetStyle(e.target);
        closeTooltip = window.setTimeout(function() {
            map.closePopup();
        }, 100);
    }

    function mouseout_tobacco(e) {
        tobaccoLayer.resetStyle(e.target);
        closeTooltip = window.setTimeout(function() {
            map.closePopup();
        }, 100);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());

        var layer = e.target;
        var selectedTitle = layer.feature.properties.name;
        updateLine(divId, dataNatality, selectedTitle);
    }

    // init population growth legend
    map.legendControl.addLegend(getLegendHTML_birth());

    function getLegendHTML_birth() {
        var Legends = getLegend("Population Growth", "avg_birth", 4, 10, 1000, 1, "k");
        return Legends;
    }

    function getLegendHTML_female() {
        var Legends = getLegend("Female Population", "avg_female", 5, 1, 100000, 10, "m");
        return Legends;
    }

    function getLegendHTML_income() {
        var Legends = getLegend("Median Income ($)", "avg_income", 3, 1, 1000, 1, "k");
        return Legends;
    }

    function getLegendHTML_tobacco() {
        var Legends = getLegend("Female Tobacco Use (%)", "avg_tobacco", -1, 1, 1, 10, "");
        return Legends;
    }

}

// global variable for scatter map
var scaMargin = {top: 10, bottom: 10, left: 55, right: 30},
    scaW = 300 - scaMargin.left - scaMargin.right,
    scaH = 190 - scaMargin.top - scaMargin.bottom,
    scaX = d3.scaleLinear().range([0, scaW]),
    scaY = d3.scaleLinear().range([scaH, 0]);

function generateScatter(divId) {

    console.log(ussData);
    // console.log(ussData.eatures[0].properties.natalities[0]["Birth Rate"]);

    // // init variable
    // var scaMargin = {top: 10, bottom: 10, left: 55, right: 30},
    //     scaW = 300 - scaMargin.left - scaMargin.right,
    //     scaH = 190 - scaMargin.top - scaMargin.bottom,
    //     scaX = d3.scaleLinear().range([0, scaW]),
    //     scaY = d3.scaleLinear().range([scaH, 0]),
    //     data = ussData.features;
    var data = ussData.features;

    scaX.domain([d3.min(data, function(d) { return d.properties.avg_birth; }) / 1.05,
                 d3.max(data, function(d) { return d.properties.avg_birth; }) * 1.05]);
    scaY.domain([d3.min(data, function(d) { return d.properties.avg_birthrate; }) / 1.2,
                 d3.max(data, function(d) { return d.properties.avg_birthrate; }) * 1.05]);

    // create svg
    var scaSvg = d3.select(divId)
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 220")
        .classed("svg-content-responsive", true)
        .attr("class", "svg-container")
        .append("g")
        .attr("transform", "translate(" + scaMargin.left + "," + scaMargin.top + ")")

    // make scatter plot
    scaSvg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d){ return scaX(d.properties.avg_birth); })
        .attr("cy", function(d){ return scaY(d.properties.avg_birthrate); })
        .attr("r", 4)
        .attr("fill", "#1DFF84")
        .attr("opacity", 0.5)

    // create axis
    var scaXAxis = d3.axisBottom(scaX).ticks(5);
    var scaYAxis = d3.axisLeft(scaY).ticks(5);

    scaSvg.append("g")
        .attr("transform", "translate(0," + scaH +")")
        .attr("class", "xA")
        .call(scaXAxis)

    scaSvg.append("g")
        .attr("class", "yA")
        .call(scaYAxis)

    scaSvg.append("text")
        .attr("class", "textX")
        .attr("x", scaW / 3.5)
        .attr("y", scaH + 35)
        .attr("font-size", "10px")
        .attr("font-family", "HelveticaNeue-Light, Helvetica, sans-serif")
        .attr("fill", "white")
        .text("Population Growth")

    scaSvg.append("text")
        .attr("class", "textY")
        .attr("transform", "translate(-30," + (scaH/2) + ") rotate(-90)")
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-family", "HelveticaNeue-Light, Helvetica, sans-serif")
        .attr("fill", "white")
        .text("Birth Rate per 1000 Population")

}

function updateScatter(divId, value, text) {
    var data = ussData.features;

    var scaSvg = d3.select(divId);
    //update x Axis
    scaX.domain([d3.min(data, function(d) { return d.properties[value]; }) / 1.05,
                 d3.max(data, function(d) { return d.properties[value]; }) * 1.05]);
    //update circle
    scaSvg.selectAll("circle")
        .data(data)
        .transition()
        .duration(1500)
        .attr("cx", function(d){ return scaX(d.properties[value]); })

    //update x Axis variable
    var scaXAxis = d3.axisBottom(scaX).ticks(5);

    scaSvg.select(".xA")
        .transition()
        .duration(1500)
        .call(scaXAxis)

    scaSvg.select(".textX")
        .transition()
        .duration(1500)
        .text(text)
}

function updateScatter2(divId, value, text) {
    var data = ussData.features;

    var scaSvg = d3. select(divId);
    //update y Axis
    scaY.domain([d3.min(data, function(d) { return d.properties[value]; }) / 1.2,
                 d3.max(data, function(d) { return d.properties[value]; }) * 1.05]);
    //update circle
    scaSvg.selectAll("circle")
        .data(data)
        .transition()
        .duration(1500)
        .attr("cy", function(d){ return scaY(d.properties[value]); })

    //update x Axis variable
    var scaYAxis = d3.axisLeft(scaY).ticks(5);

    scaSvg.select(".yA")
        .transition()
        .duration(1500)
        .call(scaYAxis)

    scaSvg.select(".textY")
        .transition()
        .duration(1500)
        .text(text)

}

// global variable for line chart
var lineMargin = {top: 10, bottom: 10, left: 55, right: 30},
    lineW = 300 - lineMargin.left - lineMargin.right,
    lineH = 190 - lineMargin.top - lineMargin.bottom,
    lineX = d3.scaleBand().rangeRound([0, lineW], .1).padding(5),
    lineY = d3.scaleLinear().range([lineH, 0]);

function generateLine(divId, data, selectCode) {

    var dataset = data.filter(
        function(d) { return (d.State == "Alabama"); }
    );

    var lineSvg = d3.select(divId).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 220")
        .attr("class", "svg-container-2")
        .append("g")
        .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

    lineX.domain(dataset.map(function(d) { return d["Year"]; }));
    lineY.domain([ d3.min(dataset, function(d) { return +d["Birth Rate"]; }) / 1.05, d3.max(dataset, function(d) { return +d["Birth Rate"]; }) * 1.05 ]);

    var line = d3.line()
        .x(function(d) { return lineX(d["Year"]); })
        .y(function(d) { return lineY(d["Birth Rate"]); });

    lineSvg.append("path")
        .datum(dataset)
        .attr("class", "drawLine")
        .attr("fill", "none")   
        .attr("stroke", "#1DFF84")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.7)
        .attr("d", line)

    var lineXAxis = d3.axisBottom(lineX);
    var lineYAxis = d3.axisLeft(lineY).ticks(5);

    lineSvg.append("g")
        .attr("transform", "translate(0," + lineH +")")
        .attr("class", "xL")
        .call(lineXAxis)

    lineSvg.append("g")
        .attr("class", "yL")
        .call(lineYAxis)

    lineSvg.append("g")
        .attr("transform", "translate(-30," + (lineH/2) + ") rotate(-90)")
        .append("text")
        .attr("y", -5)
        .style("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-family", "HelveticaNeue-Light, Helvetica, sans-serif")
        .attr("fill", "white")
        .text("Birth Rate per 1000 Population")

    lineSvg.append("text")
        .attr("x", lineW/2.5)
        .attr("y", lineH + 35)
        .attr("font-size", "10px")
        .attr("font-family", "HelveticaNeue-Light, Helvetica, sans-serif")
        .attr("fill", "white")
        .text("Year")

}

function updateLine(divId, dataNatality, state) {
    var dataset = dataNatality.filter(
        function(d) { return (d.State == state); }
    );

    var lineSvg = d3.select(divId);

    lineY.domain([ d3.min(dataset, function(d) { return +d["Birth Rate"]; }) / 1.05, d3.max(dataset, function(d) { return +d["Birth Rate"]; }) * 1.05 ]);

    var line = d3.line()
        .x(function(d) { return lineX(d["Year"]); })
        .y(function(d) { return lineY(d["Birth Rate"]); });

    lineSvg.select(".drawLine")
        .datum(dataset)
        .transition()
        .duration(1000)
            .attr("d", line)

    var lineYAxis = d3.axisLeft(lineY).ticks(5);

    lineSvg.select(".yL")
        .transition()
        .duration(1000)
        .call(lineYAxis)

}

function createVis(errors, dataNatality, elementID)
{
    if (errors) throw errors;

    about();
    processData(dataNatality);
    generateMap(dataNatality, "map", "#d3-elements");
    generateScatter("#d3-elements");
    generateLine("#d3-elements", dataNatality, "Alabama");

}

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/minhnaru/cis602-02-project/master/data/natality_1.json")
    .await(createVis);