//setting up the 2 canvas elements
var contexts = setupCanvas();

//defining the widgets
var spriteSheet = new Image, hexmap, panel, units = [];

const size = 30, rowspan = 22, colspan = 14;


spriteSheet.onload = function () {

    contexts.mapContext.fillStyle = "#FF6B33";
    contexts.mapContext.fillRect(0, 0, window.innerWidth, window.innerHeight);

    hexmap = new HexMap(rowspan, colspan);
    hexmap.generateIsland();

    panel = new actionPanel(rowspan, size);
    panel.show(contexts.mapContext);

    window.addEventListener("click", trackClickTarget);
    window.addEventListener("keypress", spawnTestUnit);

    displayMap(hexmap);

    gameLoop();
};

spriteSheet.src = "spritesheet.png";