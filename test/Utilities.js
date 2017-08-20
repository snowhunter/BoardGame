function makeTemplate(side, type, img){

    /**
     * this function creates a hypothetical canvas, with the clipped tile image
     * drawn onto it and returns it. This canvas is to be drawn on the map.
     *
     */

        //creating the canvas, setting up its dimensions and getting the context
    var canvas = document.createElement("canvas");
    canvas.width = 2*8*side; //replace the 8 with the amount of total different tile types
    canvas.height = 2*side;
    var context = canvas.getContext('2d');

    var incrX = Math.sqrt(3)*side/2;
    var incrY = side/2;
    var startX = {
        "SEA" : 0,
        "SHORELINE" : 60,
        "PLAINS" : 120,
        "FOREST_LIGHT" : 180,
        "FOREST_HEAVY" : 240,
        "MOUNTAINS" : 300,
        "SWAMP" : 360,
        "MARSH" : 420
    }[type];

    //drawing the path
    context.beginPath();
    context.moveTo(startX, incrY);
    context.lineTo(startX + incrX, 0);
    context.lineTo(startX + 2*incrX, incrY);
    context.lineTo(startX + 2*incrX, incrY + side);
    context.lineTo(startX  + incrX, 2*side);
    context.lineTo(startX, incrY + side);
    context.closePath();
    context.clip();
    context.stroke();

    context.drawImage(img, 0, 0);

    //returning the canvas, ready to be drawn onto the main map
    return canvas;
}

function setupCanvas() {
    var map = document.getElementById("map").getContext('2d');
    var stage = document.getElementById("stage").getContext('2d');

    map.canvas.width = window.innerWidth;
    map.canvas.height = window.innerHeight;

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    return {
        mapContext: map,
        stageContext: stage
    };
}

function displayMap(hexmap) {
    for(var row of hexmap.contents){
        for(var tile of row){
            console.log(tile.startingPoint.x, tile.startingPoint.y);
            tile.show(contexts.mapContext);
        }
    }
}