var Unit = function (type, tile) {

    this.type = type;
    this.position = tile;
    this.position.unit = this;
    this.coordinates = tile.middlePoint;

    //basic properties of a unit
    this.attack = 50;
    this.hp = Math.floor(Math.random()*300);
    this.tile = null;
    this.movementRange = 2;
    this.maxhp = 300;
    
    
    this.show = function (context) {
        context.beginPath();
        context.fillStyle = "#FF0000";
        context.arc(this.coordinates.x, this.coordinates.y, 5, 0, 2*Math.PI);
        context.fill();

    }

    this.move = function (destination) {
        this.tile = destination;
        this.tile.unit = this;
    }
}


