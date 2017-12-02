var Unit = function (type, tile, attack, hp, moveRange, attackRange, color) {

    this.type = type;
    this.position = tile;
    this.position.unit = this;
    this.coordinates = tile.middlePoint;

    //basic properties of a unit
    this.attack = attack;
    this.hp = Math.floor(Math.random()*300);
    this.tile = null;
    this.movementRange = moveRange;
    this.attackRange = attackRange;
    this.maxhp = hp;
    this.color = color;
    
    
    this.show = function (context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.coordinates.x, this.coordinates.y, 5, 0, 2*Math.PI);
        context.fill();

    };

    this.move = function (destination) {
        this.position = destination;
        this.coordinates = this.position.middlePoint;
        this.position.unit = this;
    };
};

var Assault = function (tile) {

    Unit.call(this, "Assault", tile, 100, 200, 2, 2, "#FF00FF");

};

var Scout = function (tile) {

    Unit.call(this, "Scout", tile, 20, 300, 4, 2, "#00FF00");

};

var  Heavy = function (tile) {

    Unit.call(this, "Heavy", tile, 70, 450, 2, 2, "#000000");

};

var Sniper = function (tile) {

    Unit.call(this, "Sniper", tile, 80, 250, 2, 4, "#0000FF");

};

