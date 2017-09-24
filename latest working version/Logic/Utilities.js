/**
 * Important!!!
 * Whatever new features you add, remember they will not display unless they are drawn on EVERY frame
 * The gameLoop function itself needs to be tweaked in order to display new stuff.
 */


const TILE_TYPES = 8;
function keypressHandler(event) {
    if(event.keyCode == 32){
        spawnTestUnit();
    }
    /*else if(event.keyCode == 83){
        if(mode == 2){
            mode = 1;
        }
    }*/
    else if(event.keyCode == 83){

    }
}
//returns the proper size for the tile, depending on the screen's resolution
function getProperSize() {
    let size = Math.round(10*window.innerHeight/44)/10;
    const sqrt3 = Math.sqrt(3);

    while(window.innerWidth - size*sqrt3*45<183.8){
        size -= 0.1;
    }

    return size;
}
//creates a canvas property upon which the tile is drawn. The canvas context is then drawn onto the main map
function makeTemplate(side, type, image){

    /**
     * this function creates a hypothetical canvas, with the clipped tile image
     * drawn onto it and returns it. This canvas is to be drawn on the map.
     *
     */

    //creating the canvas, setting up its dimensions and getting the context
    let canvas = document.createElement("canvas");
    canvas.width = 2 * TILE_TYPES * 60;
    canvas.height = 2 * side;
    let context = canvas.getContext('2d');

    let incrX = Math.sqrt(3)*side/2;
    let incrY = side/2;
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
//returns the offset on the spritesheet
function getPortraitOffset(type) {
    return {
        "SEA" : 0,
        "SHORELINE" : 220,
        "PLAINS" : 440,
        "FOREST_LIGHT" : 660,
        "FOREST_HEAVY" : 880,
        "MOUNTAINS" : 1100,
        "SWAMP" : 1320,
        "MARSH" : 1540
    }[type];
}
//obsolete. delete it.
function makePortraitTemplate(type, image) {

    let canvas = document.createElement("canvas"), context = canvas.getContext('2d'), offset = getPortraitOffset(type);
    canvas.width = 220*8;
    canvas.height = 200;

    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset+220, 0);
    context.lineTo(offset+220, 200);
    context.lineTo(offset, 200);
    context.closePath();
    context.clip();

    context.drawImage(image, 0, 0);

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
//If the click was on the board, locates the tile and calls appropriate methods. If the click was on the panel checks for button presses
function trackClickTarget(event) {
    let clickX = event.clientX, clickY = event.clientY;

    if(clickX< rowspan*size*Math.sqrt(3)){
        clickedOnBoard(event);
    }
    else{
        panel.checkButtonPress(clickX, clickY);

    }

}
//fills target hexagon with a low-opacity yellowish color
function highlightFill(t, context) {

    let tile = hexmap.getTile(t);

    let startX = tile.startingPoint.x, incrY = tile.side/2, incrX = tile.side*Math.sqrt(3)/2;
    let startY = tile.startingPoint.y + incrY ;

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

    if(panel.selectedNeighbours){
        panel.selectNeighbours(panel.selectedNeighbours);
    }

    panel.show(contexts.stageContext);

    if(panel.selectedTile){
        highlightBorder(panel.selectedTile, contexts.stageContext);
    }

    if(panel.selectedNeighbours){
        for(let t of panel.selectedNeighbours){
            highlightFill(t.getVector(), contexts.stageContext);
        }
    }

    for(let unit of units){
        unit.show(contexts.stageContext);
    }

    requestAnimationFrame(gameLoop);
}
//spawns units to test if stuff works
function spawnTestUnit() {
    let unit = new Unit("soldier", panel.selectedTile)
    units.push(unit);
    panel.selectTile(panel.selectedTile);
    let neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile.getVector(), panel.selectedUnit.movementRange);
    let tiles = [];
    neighbours.forEach(function (n) {
        tiles.push(hexmap.getTile(n));
    });
    panel.selectNeighbours(tiles);
}
//given a vector and a range, finds every possible neighbour in that range
function clickedOnBoard(event){
    let clickLocation = new Vector(event.clientX, event.clientY);
    let temp = [], min = Infinity, dst;
    let c = 45, current = null;
    let k = null;

    for(let row of hexmap.contents){
        for(let tile of row){
            k = clickLocation.distanceFrom(tile.middlePoint);
            if(k<c){
                temp.push(tile);
            }
        }
    }


    for(let tile of temp){
        let dst = clickLocation.distanceFrom(tile.middlePoint);
        if(dst<min){
            current = tile;
            min = dst;
        }
    }


    //naturally the user starts from here, his click events correspond to highlighting the clicked tile etc.
    if(mode === 1){
        panel.selectTile(current, contexts.stageContext);
        //we've found the clicked tile and now we call the appropriate methods
        console.log(panel.selectedUnit.movementRange);
        let neighbours = getNeighboursDistanceN(hexmap, current.getVector(), panel.selectedUnit.movementRange);

        let tiles = vectorsToTiles(neighbours);

        for(let n of neighbours){
            highlightFill(n, contexts.stageContext);
        }


        highlightBorder(current.getVector(), contexts.stageContext);

        panel.selectNeighbours(tiles);
    }//this is the "move" mode. The user has pressed the move button and the next clicked tile is the destination
    else if(mode === 2){
        let neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile.getVector(), panel.selectedUnit.movementRange);
        if(vectorIn(neighbours, current.getVector())){
            //The unit is moved, the new tile is selected, the new neighbours are found, saved and highlighted.
            panel.selectedUnit.move(current);
            panel.selectTile(current);
            neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile.getVector(),panel.selectedUnit.movementRange);
            panel.selectNeighbours(vectorsToTiles(neighbours));
            mode = 1;
        }

    }

}
//takes an array of vectors and a vector, and checks if the array contains the vector
function vectorIn(vectors, vector){
    for(let v of vectors){
        if(v.toFloat() == vector.toFloat()){
            return true;
        }
    }
    return false;
}
//takes an array of vectors and returns the corresponding array of tiles
function vectorsToTiles(vectors){
    let tiles = [];
    vectors.forEach(function (v) {
        tiles.push(hexmap.getTile(v));
    });
    return tiles;
}