// Class vector. Represents both a 2D point (for use in arrays and calculations) and a Vector for use in vector fields.

function Vector (x, y) {
    this.x = x;
    this.y = y;
}

// 2d vector to cube coordinates, for hexes
Vector.prototype.toCube = function () {
    let x = this.y - (this.x - (this.x & 1)) / 2;
    let z = this.x;
    let y = - x - z;
    return new Cube(x, y, z);
};

// vector addition
Vector.prototype.addVector = function (vector1) {
    return new Vector(this.x + vector1.x, this.y + vector1.y);
};

// vector scalar multiplication
Vector.prototype.scale = function (scalar) {
    let newx = this.x * scalar;
    let newy = this.y * scalar;
    return new Vector (newx, newy);
};

// vector subtraction
Vector.prototype.subtractVector = function (vector1) {
    return this.addVector(vector1.scale(-1));
};

// calculates the magnitude of the vector
Vector.prototype.magnitude = function () {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
};

// calculates the distance from one vector to another
Vector.prototype.distanceFrom = function (vector1) {
    d = this.subtractVector(vector1);
    return d.magnitude();
};

// finds and returns a unit vector parallel to the original vector
Vector.prototype.unitVector = function () {
    let result = new Vector(this.x, this.y);
    return result.scale(1.0 / result.magnitude());
};

// calculates the dot product of two vectors.
Vector.prototype.dotProduct = function (vector1) {
    return (this.x * vector1.x) + (this.y * vector1.y);
};

Vector.prototype.toString = function () {
    return "x: " + this.x + ", y: " + this.y;
};

Vector.prototype.flip = function () {
    return new Vector(this.y, this.x);
};

// for use in case we ever need to sort an array of vectors
function compareVectors (vector1, vector2) {
    if (vector1.magnitude() < vector2.magnitude()) return -1;
    if (vector1.magnitude() > vector2.magnitude()) return 1;
    return 0;
}
