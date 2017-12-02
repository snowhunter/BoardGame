/**
 * Important!!!
 * Whatever new features you add, remember they will not display unless they are drawn on EVERY frame
 * The gameLoop function itself needs to be tweaked in order to display new stuff.
 */


const TILE_TYPES = 8;
function keypressHandler(event) {
    if(event.keyCode == 32){
        spawnTestUnit("Sniper");
    }
    else if(event.keyCode == 115){
        spawnTestUnit("Scout");
    }
    else if(event.keyCode == 104){
        spawnTestUnit("Heavy");
    }
    else if(event.keyCode == 97){
        spawnTestUnit("Assault");
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
//returns the offset on the spritesheet, used in Tile creation
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
//fetches the 3 canvas elements, sets their dimensions and returns their contexts
function setupCanvas() {
    let map = document.getElementById("map").getContext('2d');
    let stage = document.getElementById("stage").getContext('2d');
    let animation_canvas = document.getElementById("animation").getContext('2d');

    map.canvas.width = window.innerWidth;
    map.canvas.height = window.innerHeight;

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    animation_canvas.canvas.width = window.innerWidth;
    animation_canvas.canvas.height = window.innerHeight;

    return {
        mapContext: map,
        stageContext: stage,
        animationContext: animation_canvas
    };
}
//given a generated island, it displays it
function displayMap(hexmap, context) {

    for(let row of hexmap.contents){
        for(let tile of row){
            tile.show(context);
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
function highlightFill(t, context, intention) {

    let tile = hexmap.getTile(t);

    let startX = tile.startingPoint.x, incrY = tile.side/2, incrX = tile.side*Math.sqrt(3)/2;
    let startY = tile.startingPoint.y + incrY ;

    context.fillStyle = {
        "select": "rgba(255, 243, 17, 0.5)",
        "attackRange": "rgba(255, 0, 40, 0.5)",
        "attackTarget": "rgba(224, 115, 245, 0.5)"
    }[intention];


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

    let instructions = {
        1: function () {
            if(panel.selectedNeighbours){
                for(let neighbour of panel.selectedNeighbours){
                    highlightFill(neighbour.getVector(), contexts.stageContext, "select");
                }
            }
        },
        2: function () {
            if(panel.selectedNeighbours){
                for(let neighbour of panel.selectedNeighbours){
                    highlightFill(neighbour.getVector(), contexts.stageContext, "select");
                }
            }
        },
        3: function () {
            if(panel.selectedNeighbours){
                for(let neighbour of panel.selectedNeighbours){
                    if(neighbour.unit && neighbour.unit !== panel.selectedUnit){
                        highlightFill(neighbour.getVector(), contexts.stageContext, "attackTarget");
                    }
                    else{
                        highlightFill(neighbour.getVector(), contexts.stageContext, "attackRange");
                    }
                }
            }
        }
    };

    instructions[mode]();

    /*
    if(panel.selectedNeighbours){
        for(let t of panel.selectedNeighbours){
            highlightFill(t.getVector(), contexts.stageContext, intention);
        }
    }*/

    for(let i=units.length-1; i>=0; i--){
        if(units[i].hp >0){
            units[i].show(contexts.stageContext);
        }
        else{
            //removing all references to the unit, it's then garbage collected, completely removed from the game.
            units[i].position.unit = null;
            units.splice(i,1);
        }
    }

    requestAnimationFrame(gameLoop);
}
//spawns units to test if stuff works
function spawnTestUnit(type) {
    let unit = new {
        "Heavy": Heavy,
        "Assault": Assault,
        "Scout": Scout,
        "Sniper": Sniper
    }[type](panel.selectedTile);
    units.push(unit);
    panel.selectTile(panel.selectedTile);
    let neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile.getVector(), panel.selectedUnit.movementRange);
    panel.selectNeighbours(vectorsToTiles(neighbours));
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

    let modes = {
        1: mode1,
        2: mode2,
        3: mode3
    };

    modes[mode](current);
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

//Default mode. Selecting a tile highlights the adjacent tiles depending on the movement range of the unit (if any) on the tile.
//todo: change this to vision instead of movement range when vision is introduced
function mode1(selected_tile) {
    panel.selectTile(selected_tile, contexts.stageContext);
    let neighbours = getNeighboursDistanceN(hexmap, selected_tile.getVector(), panel.selectedUnit.movementRange);

    for(let n of neighbours){
        highlightFill(n, contexts.stageContext, "select");
    }

    console.log(neighbours);

    highlightBorder(selected_tile.getVector(), contexts.stageContext);
    panel.selectNeighbours(vectorsToTiles(neighbours));
}
//mode 2 is used when the user has clicked the move button. The next click, if it's on a valid tile, moves the unit to the target tile
//while in this mode, highlighted tiles should depend on the movement range of the unit, if any.
function mode2(selected_tile) {
    let neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile.getVector(), panel.selectedUnit.movementRange);
    if(vectorIn(neighbours, selected_tile.getVector())){
        //The unit is moved, the new tile is selected, the new neighbours are found, saved and highlighted,
        //the unit's reference on the tile object is set back to null
        panel.selectedTile.unit = null;
        panel.selectedUnit.move(selected_tile);
        panel.selectTile(selected_tile);
        neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile.getVector(),panel.selectedUnit.movementRange);
        panel.selectNeighbours(vectorsToTiles(neighbours));
        mode = 1;
    }
}
//mode 3 is used when the user has clicked the attack button. This should highlight the adjacent tiles with a red color, except
//for possible targets within that range (the attack range). The next click is only valid if it's on one of the valid targets.
function mode3(selected_tile) {
    let neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile.getVector(), panel.selectedUnit.attackRange);
    if(vectorIn(neighbours, selected_tile.getVector())){
        if((selected_tile !== panel.selectedTile) && selected_tile.unit){
            selected_tile.unit.hp -= panel.selectedUnit.attack;
            mode = 1;
            neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile, panel.selectedUnit.movementRange);
            console.log(neighbours);
            panel.selectNeighbours(vectorsToTiles(neighbours));
        }
    }
    else{
        mode = 1;
        panel.selectTile(selected_tile);
        neighbours = getNeighboursDistanceN(hexmap, panel.selectedTile, panel.selectedUnit.movementRange);
        panel.selectNeighbours(vectorsToTiles(neighbours));
    }
}
