
const TILE_TYPES = 8;

//creates a canvas property upon which the tile is drawn. The canvas context is then drawn onto the main map
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
//fetches the 2 canvas elements, sets their dimensions and returns their contexts
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
//given a generated island, it displays it
function displayMap(hexmap) {

    for(let row of hexmap.contents){
        for(let tile of row){
            tile.show(contexts.mapContext);
        }
    }
}
//called on a click event, and strokes the clicked hexagon with a blueish color
function highlightBorder(t, context){

    var tile = hexmap.getTile(t);
    //console.log(context.canvas.width, context.canvas.height);

    var startX = tile.startingPoint.x, incrY = tile.side/2, incrX = tile.side*Math.sqrt(3)/2;
    var startY = tile.startingPoint.y + incrY ;

    context.strokeStyle = "#1122BB";
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(incrX + startX, startY - incrY);
    context.lineTo(2*incrX + startX, startY);
    context.lineTo(2*incrX + startX, startY + tile.side);
    context.lineTo(incrX + startX, startY + tile.side + incrY);
    context.lineTo(startX, startY + tile.side);
    context.closePath();
    context.stroke();

}
//locates the hexagon that was clicked and calls the appropriate methods on that hexagon
function trackClickTarget(event) {
    var clickLocation = new Vector(event.clientX, event.clientY);
    var temp = [], min = Infinity, dst;
    var c = 45, current = null;
    var k = null;


    for(var row of hexmap.contents){
        for(var tile of row){
            k = clickLocation.distanceFrom(tile.middlePoint);
            if(k<c){
                temp.push(tile);
            }
        }
    }


    for(tile of temp){
        dst = clickLocation.distanceFrom(tile.middlePoint);
        if(dst<min){
            current = tile;
            min = dst;
        }
    }


    console.log(current.getVector());
    var neighbours =getNeighbours(current.getVector());
    var tiles = [];


    for(var n of neighbours){
        tiles.push(hexmap.getTile(n));
        highlightFill(n, contexts.stageContext);
    }



    highlightBorder(current.getVector(), contexts.stageContext);
    //showAvailablePaths(current, 1, hexmap);
    //highlightFill(current, contexts.stageContext);
    panel.selectTile(current, contexts.stageContext);
    panel.selectNeighbours(tiles);

}
//given a tile and a range, highlights the adjacent tiles within that range
function showAvailablePaths(tile, range, hexmap) {

    var neighbours = getNeighborsDistanceN(hexmap, tile.getVector(), range), current;
    contexts.mapContext.fillStyle = "#FF0000";

    for(var neighbour of neighbours){
        current = hexmap.contents[neighbour.x][neighbour.y];
        contexts.mapContext.fillRect(current.middlePoint.x, current.middlePoint.y, 20, 20);

        //console.log(current.getVector());
    }
    
}
//fills target hexagon with a low-opacity yellowish color
function highlightFill(t, context) {

    var tile = hexmap.getTile(t);

    var startX = tile.startingPoint.x, incrY = tile.side/2, incrX = tile.side*Math.sqrt(3)/2;
    var startY = tile.startingPoint.y + incrY ;

    context.fillStyle = "rgba(255, 243, 17, 0.5)";


    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(incrX + startX, startY - incrY);
    context.lineTo(2*incrX + startX, startY);
    context.lineTo(2*incrX + startX, startY + tile.side);
    context.lineTo(incrX + startX, startY + tile.side + incrY);
    context.lineTo(startX, startY + tile.side);
    context.closePath();
    context.fill();

}
//main loop, performs changes upon the stage and displays them. Does not alter mapContext
function gameLoop() {

    // Each new frame, clears the temporary canvas completely and draws anew
    contexts.stageContext.clearRect(0, 0, contexts.stageContext.canvas.width, contexts.stageContext.canvas.height);

    //select the already selected tile each frame, to make sure it displays the data properly
    if(panel.selectedTile){
        panel.selectTile(panel.selectedTile);
    }

    if(panel.neighbours){
        panel.selectNeighbours(panel.neighbours);
    }

    panel.show(contexts.stageContext);

    if(panel.selectedTile){
        highlightBorder(panel.selectedTile, contexts.stageContext);
    }

    if(panel.selectedNeighbours){
        for(var t of panel.selectedNeighbours){
            highlightFill(t, contexts.stageContext);
        }
    }

    for(var unit of units){
        unit.show(contexts.stageContext);
    }

    requestAnimationFrame(gameLoop);
}
//spawns units to test if stuff works
function spawnTestUnit() {
    console.log("hi");
    units.push(new Unit("soldier", panel.selectedTile));
}

function getNeighbours (vector) {
    let x = vector.x, y = vector.y;
    let neighbours = [new Vector(x - 1, y), new Vector(x + 1, y)];
    if (vector.y & 1) {
        neighbours.push(new Vector(x, y - 1), new Vector(x + 1, y - 1), new Vector(x, y + 1), new Vector(x + 1, y + 1));
    } else {
        neighbours.push(new Vector(x - 1, y - 1), new Vector(x, y - 1), new Vector(x - 1, y + 1), new Vector(x, y + 1));
    }

    //looping through the array backwards to prevent errors from splicing while iterating
    for (var i=neighbours.length-1; i>=0; i--) {
        if (!isValidVector(hexmap, neighbours[i])){
            neighbours.splice(i, 1);
        }
    }

    return neighbours;
}