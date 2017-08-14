//getting the context of the
var mapContext = document.getElementById("canvas").getContext('2d');
//setting the canvas size equal to the screen's size
mapContext.canvas.height = window.innerHeight;
mapContext.canvas.width = window.innerWidth;

//defining some necessary global variables
var img = new Image;
var tiles, current = null;

//building temporary canvas
var canvas = createCanvas();
var context = canvas.getContext('2d');

//creating the action panel
var panel = new actionPanel();

//finds and selects the tile clicked by the user
var trackClickTarget = function (event) {
    var mouseX = event.clientX, mouseY = event.clientY;
    var temp = [], min = Infinity, dst;
    var c = 45;

    for(var tile of tiles){
        if(dist(tile.middlePoint[0], tile.middlePoint[1], mouseX, mouseY)<c){
            temp.push(tile);
        }
    }


    for(tile of temp){
        var dst = dist(tile.middlePoint[0], tile.middlePoint[1], mouseX, mouseY);
        if(dst<min){
            current = tile;
            min = dst;
        }
    }

    panel.selectTile(current, context);

    /*
     //Draws a tiny red rectangle on the tile to highlight it. Delete this once the function is complete.
     context.beginPath();
     context.fillStyle = "#FF0000";
     context.rect(current.middlePoint[0], current.middlePoint[1], 5, 5);
     context.fill();
     */

};

var units = [];

window.addEventListener("click", trackClickTarget);

window.addEventListener("keypress", function () {
    units.push(new unit("soldier", current));
})


function gameLoop() {
    context.clearRect(0, 0, 800, 600);

    if(current){
        highlight(current, context);
    }

    panel.show(context);
    mapContext.drawImage(canvas, 0, 0);

    requestAnimationFrame(gameLoop);
}

img.onload = function () {
    tiles = map();
    for(var i=0; i<tiles.length; i++){
        tiles[i].show(mapContext);
    }

    gameLoop();

}

img.src = "spritesheet.png";