// Class Cube, for use in Hex Cube coordinates

function Cube (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

// the coordinates of adjacent hexes (distance 1 from start)

// REMINDER:
//              Cube(+1, -1, 0) -------- π
//              Cube(-1, +1, 0) -------- 0
//              Cube(+1, 0, -1) -------- π/3
//              Cube(-1, 0, +1) -------- 4π/3
//              Cube(0, +1, -1) -------- 2π/3
//              Cube(0, -1, +1) -------- 5π/3
//
// They will be needed for the island generation algorithm ^^^^^^

var cube_directions = [
    new Cube(+1, -1,  0), new Cube(+1,  0, -1), new Cube( 0, +1, -1),
    new Cube(-1, +1,  0), new Cube(+2,  0, -1), new Cube( 0, -1, +1)
];

// Calculates the distance between the centers of two cubes - may be useful sometime
Cube.prototype.distanceFrom = function (cube) {
    var dx = cube.x - this.x;
    var dy = cube.y - this.y;
    var dz = cube.z - this.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
};

// Adds hexes by parts - used when finding adjacent hexes
/*
Cube.prototype.addCube = function (cube) {
    this.x += cube.x;
    this.y += cube.y;
    this.z += cube.z;
}; */

Cube.prototype.addCube = function (cube) {
    return new Cube(this.x + cube.x, this.y + cube.y, this.z + cube.z);
};

// turns cube coordinates back to a 2d vector
Cube.prototype.toVector = function () {
    let y = this.x + Math.floor(this.z / 2);
    let x = this.z;
    return new Vector(x, y);
};