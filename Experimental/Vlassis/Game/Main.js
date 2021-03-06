//setting up the 2 canvas elements
var contexts = setupCanvas();

//defining the widgets
var hexmap, panel, units = [], images = [new Image(), new Image()];
let imagesLoaded = 0, imageCount = images.length;

for(let i=0; i<imageCount; i++){
    images[i].onload = function(){
        imagesLoaded++;
        if(imagesLoaded === imageCount){
            allLoaded();
        }
    }
}


images[0].src = "./Graphics/spritesheet.png";
images[1].src = "./Graphics/TileIcons.png";


const size = getProperSize(), rowspan = 45, colspan = 29;
var mode = 1;

function allLoaded(){

    contexts.mapContext.fillStyle = "#FF6B33";
    contexts.mapContext.fillRect(0, 0, window.innerWidth, window.innerHeight);


    hexmap = new HexMap(rowspan, colspan);
    hexmap.generateIsland();

    console.log(images[0], images[1]);
    panel = new actionPanel(rowspan, size);
    panel.show(contexts.mapContext);

    window.addEventListener("click", trackClickTarget);
    window.addEventListener("keypress", keypressHandler);

    displayMap(hexmap);

    gameLoop();


}
