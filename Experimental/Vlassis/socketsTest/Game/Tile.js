var Tile = function (row, column, side, image, type) {

    Vector.call(this, row, column);

    this.unit = null;
    this.canvas = null;
    this.side = side;

    this.type = type;

    this.startingPoint = new Vector(this.x*Math.sqrt(3)*this.side + (this.y& 1) * this.side*Math.sqrt(3)/2, this.side*1.5*this.y);
    this.middlePoint = new Vector(this.startingPoint.x + Math.sqrt(3)*this.side/2, this.startingPoint.y + this.side/2);

    this.getOffset = function () {
        return {
            "SEA" : 0,
            "SHORELINE" : 60,
            "PLAINS" : 120,
            "FOREST_LIGHT" : 180,
            "FOREST_HEAVY" : 240,
            "MOUNTAINS" : 300,
            "SWAMP" : 360,
            "MARSH" : 420
        }[this.type];
    };

    this.getVector = function () {
        return new Vector(this.x, this.y);
    };

    this.show = function (context) {
        if(!this.canvas){
            this.canvas = makeTemplate(side, this.type, image);
        }
        context.drawImage(this.canvas, this.startingPoint.x - this.getOffset(), this.startingPoint.y);
    };

    this.getPixelX = function () {
        return this.x*Math.sqrt(3)*this.side + (this.y & 1) * this.side;
    };

    this.getPixelY = function () {
        return this.side/2 + this.side*2*this.y;
    };

    this.setType = function (type){
        this.type = type;
    };

    this.toString = function () {
        return "Tile object: {type: " + this.type + ", x: " + this.getVector().x + ", y: " + this.getVector().y + "}";
    }

};

