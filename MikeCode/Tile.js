/**
 * Created by Mike on 14/8/2017.
 */

const TYPES = {
    "SEA" : 0,
    "SHORELINE" : 60,
    "PLAINS" : 120,
    "FOREST_LIGHT" : 180,
    "FOREST_HEAVY" : 240,
    "MOUNTAINS" : 300,
    "SWAMP" : 360,
    "MARSH" : 420
};


function Tile (type, X, Y, side_length, map_width, map_height) {

        this.type = type;
        this.row = X;
        this.col = Y;
        this.side_length = side_length;

        var centeredX = this.col - map_width / 2;
        var centeredY = - this.row + map_height / 2;
        this.cubeCoords = axesToCube(this.col, this.row);
}


Tile.prototype.getCubeCoords = function () {
    return this.cubeCoords;
}

Tile.prototype.getPixelX = function () {
    return Math.round(this.col * Math.sqrt(3) * this.side_length);
};

Tile.prototype.getPixelY = function () {
    return Math.round(this.side_length * 2) * this.row;
};

Tile.prototype.getStartingPoint = function () {
    return [this.getPixelX(), this.getPixelY()];
};

Tile.prototype.getMiddlePoint = function () {
    return [this.getPixelX() + Math.sqrt(3) * this.side_length / 2, this.getPixelY() + this.side_length];
};

Tile.prototype.getGraphicsOffset = function () {
    return TYPES[this.type];
};

Tile.prototype.getGridLocation = function () {
    return [this.col, this.row];
};

Tile.prototype.setType = function (type) {
    this.type = type;
};

Tile.prototype.getType = function () {
    return this.type;
};
