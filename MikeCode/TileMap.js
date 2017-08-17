/**
 * Created by Mike on 14/8/2017.
 */

const GRAPHICS_DIRECTORY = "/graphics/tileset.png";

const HIGHER_PERCENTAGE = 0.8;
const LOWER_PERCENTAGE = 0.7;

function TileMap (width, height, hex_size) {

    this.width = width;
    this.height = height;
    this.hex_size = hex_size;

    this.content = [];
    for (var i = 0; i < this.height; i++) {
        this.content[i] = [];
        var horizontal_limit = (!(i % 2)) ? this.width : this.width - 1;
        for (var j = 0; j < horizontal_limit; j++) {
            var a = new Tile("SEA", j, i, this.hex_size, this.width, this.height);
            this.content[i].push(a);
        }
    }
};

TileMap.prototype.tileAt = function (i, j) {
    var tile =  this.content[j - 1][i - 1];
    return tile;
};

TileMap.prototype.isValidPoint = function (point) {
    var x = point[1];
    var y = point[0];
    var horizontal_limit = (y % 2) ? this.width - 1 : this.width;
    if ((y >= 0) && (y <= this.height) && (x >= 0) && (x <= horizontal_limit)) return true;
    return false;
}

TileMap.prototype.isEdge = function (i, j) {
    var horizontal_limit = (i % 2) ? this.width - 1 : this.width;
    if ((i === 0) || (i === this.height) || (j === 0) || (j === horizontal_limit)) return true;
    return false;
};

TileMap.prototype.normalizeCoords = function (i, j) {
    return [- i + (this.height / 2), j + (this.width / 2)];
};

TileMap.prototype.normalizeCoords = function (point) {
  return this.normalizeCoords(point[0], point[1]);
};

TileMap.prototype.findNeighbors = function (point) {

    var points = [];
    if (!this.isValidPoint(point)) { return null; }
    var tile = this.tileAt(point[1], point[0]);


    for (var k = 0; k < cube_directions.length; k++) {
        var cubes = tile.getCubeCoords();
        cubes.add(cube_directions[k]);
        if (this.isValidPoint(cubes.cubeToAxes())) {
            points.push(cubes.cubeToAxes());
        }
    }
    return points;
};

TileMap.prototype.numberOfTilesWithType = function (type) {
    var count = 0;
    for (var i = 0; i < this.height; ++i) {
        var horizontal_limit = (i % 2) ? this.width - 1 : this.width;
        for (var j = 0; j < horizontal_limit; ++j)
            if (this.content[i][j].getType() === type) count++;
    }
    return count;
};

/*
TileMap.prototype.generatePlayMap = function () {
    var mid_width = this.width / 2;
    var mid_height = this.height / 2;

    // Random number between higher_percentage and lower_percentage
    var percentage = Math.random() * (HIGHER_PERCENTAGE - LOWER_PERCENTAGE) + LOWER_PERCENTAGE;

    // Random number between -π/2 and π/2
    var symmetry_angle = (Math.random() - 0.5) * Math.PI;

    var selected_point;
    var starting_point = [Math.abs(Math.round(this.height * randGaussian(0.75, 0.1))),
                          Math.abs(Math.round(this.width * randGaussian(0.125, 0.1)))];
    selected_point = starting_point;
    this.content[starting_point[0]][starting_point[1]].setType("SHORELINE");
};
*/

TileMap.prototype.print = function () {
    for (var i = 0; i < this.height; i++) {
        var horizontal_limit = (!(i % 2)) ? this.width : this.width - 1;
        for (var j = 0; j < horizontal_limit; j++) {
            document.write(this.content[i][j].getType());
            document.write(" ");
        }
        document.write("<br>");
    }
};
