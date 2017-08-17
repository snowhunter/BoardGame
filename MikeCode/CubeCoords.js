
function CubeCoords (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

CubeCoords.prototype.getX = function () { return this.x; }
CubeCoords.prototype.getY = function () { return this.y; }
CubeCoords.prototype.getZ = function () { return this.z; }

var cube_directions = [
    new CubeCoords(+1, -1,  0), new CubeCoords(+1,  0, -1), new CubeCoords( 0, +1, -1),
    new CubeCoords(-1, +1,  0), new CubeCoords(-1,  0, +1), new CubeCoords( 0, -1, +1)
]

CubeCoords.prototype.add = function (cube1) {
    this.x += cube1.getX();
    this.y += cube1.getY();
    this.z += cube1.getZ();
}

function axesToCube(x1, y1) {
    var x = x1 - ((y1 - (y1 & 1)) / 2);
    var z = y1;
    var y = - x - z;
    return new CubeCoords(x, y, z);
}

CubeCoords.prototype.cubeToAxes = function () {
    return [this.x + ((this.z - (this.z & 1)) / 2), this.z];
}