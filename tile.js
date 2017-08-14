var Template = function (side, type) {

    this.squareSide = 2*side;
    this.incrX = Math.sqrt(3)*side/2;
    this.incrY = side/2
    this.canvas = document.createElement("canvas");
    this.canvas.height = this.squareSide;
    this.canvas.width = this.squareSide*3;

    //contains the starting positions of each type inside the .png sprite sheet
    this.types = {
        "forest-light": 0,
        "forest-heavy": 60,
        "mountain": 120
    };

    //the startY position should always be 0
    this.startX = this.types[type];

    //drawing the hexagon inside a "hypothetical" canvas (meaning it's not on the DOM)
    var ctx = this.canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(this.startX, this.incrY);
    ctx.lineTo(this.incrX + this.startX, 0);
    ctx.lineTo(2*this.incrX + this.startX, this.incrY);
    ctx.lineTo(2*this.incrX + this.startX, this.incrY+side);
    ctx.lineTo(this.incrX + this.startX, 2*side);
    ctx.lineTo(this.startX, this.incrY+side);
    ctx.closePath();
    ctx.clip();
    ctx.stroke();
    //saving the context as a class property
    this.context = ctx;

}


var Tile = function (startX, startY, l, img, type) {

    //tile type (forest, mountain etc)
    this.type = type;
    //object containing the displacement needed to draw the hexagon correctly
    this.types = {
        "forest-light": 0,
        "forest-heavy": 60,
        "mountain": 120
    };
    //the displacement value
    this.sx = this.types[this.type];

    //assuming a square region that exactly fits the hexagon, squareSide is ...its side
    this.squareSide = 2*l;
    //contains the sprite sheet
    this.image = img;
    var template = new Template(l, this.type);
    template.context.drawImage(this.image, 0, 0);
    this.selected = null;

    this.canvas = template.canvas;

    this.side = l; //length of the hexagon's size

    this.incrX = Math.sqrt(3)*this.side/2;
    this.incrY = this.side/2;
    this.unit = null;
    this.startingPoint = [startX, startY + this.incrY];

    //necessary for locating the tile that was clicked by the user
    this.middlePoint = [startX + this.incrX, startY + this.side/2];

    //draws the hexagonal tile
    this.show = function (context) {
        context.drawImage(this.canvas, startX - this.sx, startY);
    }
    
}