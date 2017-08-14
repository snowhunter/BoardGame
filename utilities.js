//given 2 points, returns their distance
var dist = function (x1, y1, x2, y2) {
    var d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
    return d;
}

// Returns a random number from a normal guassian distribution.
// It's one weird function but i've proven mathematically that it works.
function randGaussian (mean, deviation) {

    // The only purpose of these 3 lines is to get two (2) random numbers between 0 exclusive and 1 exclusive.
    // The loops might look bad but it's VERY unlikely we'll get more than 1 iteration.
    var x1 = 0, x2 = 0;
    while (x1 === 0) x1 = Math.random();
    while (x2 === 0) x2 = Math.random();

    // Polar mapping to a pseudo-gaussian distribution
    return deviation * Math.sqrt( - 2.0 * Math.log(x1)) * Math.cos(2.0 * Math.PI * x2) + mean;
}


//creates a temporary map for testing. Aligns the tiles, puts them in an array and returns the array
function map() {
    var tiles = []
    var startX = 0, startY = 0, endX = Math.sqrt(3)*30*20, endY = 2*30*10;
    var Ax = Math.sqrt(3)*30, Ay = 1.5*30, incrX = Math.sqrt(3)*15;
    var startXx = startX + Ax;
    var inside = false;
    for(var y = startY; y <= endY; y += Ay, inside = !inside){
        for(var x = inside ? incrX : startX; x <= endX; x+=Ax){
            if((y/Ay)%2 == 0){
                tiles.push(new Tile(x, y, 30, img, "forest-light"));
            }
            else if((y/Ay)%3 == 0){
                tiles.push(new Tile(x, y, 30, img, "forest-heavy"));
            }
            else{
                tiles.push(new Tile(x, y, 30, img, "mountain"));
            }
        }
    }
    return tiles;
}

//creates the canvas whose context we keep changing so as to draw on the map
function createCanvas() {

    var canvas = document.createElement("canvas");
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    return canvas;

}


//highlights target hexagon
highlight = function(tile, context){

    var startX = tile.startingPoint[0];
    var startY = tile.startingPoint[1];

    context.strokeStyle = "#1122BB";
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(tile.incrX + startX, startY - tile.incrY);
    context.lineTo(2*tile.incrX + startX, startY);
    context.lineTo(2*tile.incrX + startX, startY + tile.side);
    context.lineTo(tile.incrX + startX, startY + tile.side + tile.incrY);
    context.lineTo(startX, startY + tile.side);
    context.closePath();
    context.stroke();

}
