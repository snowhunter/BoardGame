//setting up the 2 canvas elements
var contexts = setupCanvas();

//defining the widgets
var spriteSheet = new Image;
var hexmap = new HexMap(22, 14);
hexmap.generateIsland();

spriteSheet.onload = function () {
    displayMap(hexmap);
}

spriteSheet.src = "spritesheet.png";