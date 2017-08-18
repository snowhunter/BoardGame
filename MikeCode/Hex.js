// Class Hex, for use on the map

const HEX_SIDE = 30;
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

function Hex (type, row, col) {
    Vector.call(this, row, col);
    this.type = type;
}

Hex.prototype.getVector = function () {
    return new Vector(this.x, this.y);
};

// helping function - returns the X coordinate of the hex
Hex.prototype.getPixelX = function () {
    return Math.round(this.x * Math.sqrt(3) * HEX_SIDE);
};

// helping function - returns the Y coordinate of the hex
Hex.prototype.getPixelY = function () {
    return Math.round(HEX_SIDE * 2 * this.y);
};

// returns a vector with the starting coordinates we will use to draw the hex
Hex.prototype.getStartingPoint = function () {
    return new Vector(this.getPixelX(), this.getPixelY());
};

// returns the middle point of the hex in pixels
Hex.prototype.getMiddlePoint = function () {
    return [this.getPixelX() + Math.sqrt(3) * HEX_SIDE / 2, this.getPixelY() + HEX_SIDE];
};

// returns the offset of the number of pixels to get to the hex image.
Hex.prototype.getGraphicsOffset = function () {
    return TYPES[this.type];
};

// setter for the type of the hex - used during map generation
Hex.prototype.setType = function (type) {
    this.type = type;
};