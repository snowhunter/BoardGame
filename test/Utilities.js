
const TILE_TYPES = 8;

function makeTemplate(side, type, image){

    /**
     * this function creates a hypothetical canvas, with the clipped tile image
     * drawn onto it and returns it. This canvas is to be drawn on the map.
     *
     */

    //creating the canvas, setting up its dimensions and getting the context
    let canvas = document.createElement("canvas");
    canvas.width = 2 * TILE_TYPES * side;
    canvas.height = 2 * side;
    let context = canvas.getContext('2d');

    let incrX = Math.sqrt(3)*side/2.0;
    let incrY = side/2.0;
    let startX = {
        "SEA" : 0,
        "SHORELINE" : 60,
        "PLAINS" : 120,
        "FOREST_LIGHT" : 180,
        "FOREST_HEAVY" : 240,
        "MOUNTAINS" : 300,
        "SWAMP" : 360,
        "MARSH" : 420
    }[type];

    //context.save();
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

    context.drawImage(image, 0, 0);

    //returning the canvas, ready to be drawn onto the main map
    return canvas;
}

function setupCanvas() {
    let map = document.getElementById("map").getContext('2d');
    let stage = document.getElementById("stage").getContext('2d');

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

    for(let row of hexmap.contents){
        for(let tile of row){
            tile.show(contexts.mapContext);
        }
    }
}

function trackClickTarget(event) {
    let clickLocation = new Vector(event.clientX, event.clientY);
    let temp = [], min = Infinity, dst;
    let c = 45, current = null;

    for (let row of hexmap.contents) {
        for (let tile of row) {
            if(clickLocation.distanceFrom(tile.middlePoint) < c){
                temp.push(tile);
            }
        }
    }

    for(var tile of temp){
        dst = clickLocation.distanceFrom(tile.middlePoint);
        if(dst < min){
            current = tile;
            min = dst;
        }
    }

    console.log(current.type);
}