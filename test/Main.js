//setting up the 2 canvas elements
var contexts = setupCanvas();

//defining the widgets
var spriteSheet = new Image, hexmap;




spriteSheet.onload = function () {
    hexmap = new HexMap(22, 14);
    hexmap.generateIsland();

    window.addEventListener("click", trackClickTarget);

    displayMap(hexmap);
};

spriteSheet.src = "spritesheet.png";