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
    this.x += vector1.x;
    this.y += vector1.y;
    return this;
};

// vector scalar multiplication
Vector.prototype.scale = function (scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
};

// vector subtraction
Vector.prototype.subtractVector = function (vector1) {
    this.addVector(vector1.scale(-1));
    return this;
};

// calculates the magnitude of the vector
Vector.prototype.magnitude = function () {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
};

// calculates the distance from one vector to another
Vector.prototype.distanceFrom = function (vector1) {
    return Math.sqrt(Math.pow(this.x - vector1.x, 2) + Math.pow(this.y - vector1.y, 2));
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
    return "Vector object, x: " + this.x + ", y: " + this.y;
};

Vector.prototype.toFloat = function () {
    return parseFloat(" " + this.x + "." + this.y);
};

// for use in case we ever need to sort an array of vectors
function compareVectors (vector1, vector2) {
    if (vector1.magnitude() < vector2.magnitude()) return -1;
    if (vector1.magnitude() > vector2.magnitude()) return 1;
    return 0;
}

function add (vector1, vector2) {
    return new Vector(vector1.x + vector2.x, vector1.y + vector2.y);
}

function sub (vector1, vector2) {
    return new Vector(vector1.x - vector2.x, vector1.y - vector2.y);
}

function scale (vector1, s) {
    return new Vector(vector1.x * s, vector1.y * s);
}

function magnitude (vector1) {
    return Math.sqrt((vector1.x * vector1.x) + (vector1.y * vector1.y));
}

function findMax_X (vectors) {
    let max = vectors[0].x;
    for (let v of vectors)
        if (v.x > max)
            max = v.x;
    return max;
}

function findMax_Y (vectors) {
    let max = vectors[0].y;
    for (let v of vectors)
        if (v.y > max)
            max = v.y;
    return max;
}

