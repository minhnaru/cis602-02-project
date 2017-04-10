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


}

function createVis(errors, data)
{
    if (errors) throw errors;
}

d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/minhnaru/project/master/Natality_1.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/minhnaru/project/master/Natality_2.csv")
    .await(createVis);




