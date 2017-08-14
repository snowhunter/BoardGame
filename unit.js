var unit = function (type, tile) {

    this.type = type;
    this.position = tile;
    this.position.unit = this;

    //basic properties of a unit
    this.attack = null;
    this.hp = null;
    this.tile = null;
    this.movementRange = 2;
    
    
    this.show = function (context) {
        context.beginPath();
        context.fillStyle = "#FF0000";
        context.drawCircle(this.tile.middlePoint[0], this.tile.middlePoint[1], 5);
        context.fill();

    }

    this.move = function (destination) {
        this.tile = destination;
        this.tile.unit = this;
    }
}


