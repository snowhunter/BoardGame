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
    console.log("fuck");
    for (var i = 0; this.height > i; ++i) {
        this.content[i] = [];
        for (var j = 0; (!(i % 2)) ? (j < this.width) : (j < (this.width - 1)); ++j) {
            var a = new Tile("SEA", i, j, this.hex_size);
            this.content[i].push(a);
        }
    }
}

TileMap.prototype.tileAt = function (i, j) {
    return this.content[i][j];
};

TileMap.prototype.isEdge = function (i, j) {
    var horizontal_limit = (i % 2) ? this.width : this.width - 1;
    if ((i === 0) || (i === this.height) || (j === 0) || (j === horizontal_limit)) return true;
    return false;
};

TileMap.prototype.isValidPoint = function (point) {
    if (point[1] >= 0 && point[1] <= this.height) {
        var horizontal_limit = (point[1] % 2) ? this.width : this.width - 1;
        if (point[0] >= 0 && point[0] <= horizontal_limit) return true;
    }
    return false;
};

TileMap.prototype.squareDistanceFromTo = function (x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};

TileMap.prototype.squareDistanceFromTo = function (point1, point2) {
    return this.squareDistanceFromTo(point1[0], point1[1], point2[0], point2[1]);
};

TileMap.prototype.normalizeCoords = function (i, j) {
    return [- i + (this.height / 2), j + (this.width / 2)];
};

TileMap.prototype.normalizeCoords = function (point) {
  return this.normalizeCoords(point[0], point[1]);
};

TileMap.prototype.findNeighbors = function (point, n) {

    var tiles = [];
    var first = findAdjacentPointsHex(point);

    first.forEach(
        function (item) {
            //noinspection JSPotentiallyInvalidUsageOfThis
            tiles.push(this.tileAt(item[0], item[1]));
        }
    );

    for (var i = 1; i < n; ++i) {
        tiles.push(this.findNeighbors(tiles[i].getGridLocation(), n - 1));
    }

    tiles = tiles.filter(
        function (value, index, array) {
            return array.indexOf(value) == index;
        }
    );
    return tiles;

};

TileMap.prototype.lookForSameTypeNeighbors = function (point) {

    var tiles = this.findNeighbors(point, 1);
    var this_tile = this.tileAt(point[0], point[1]);
    var count = 0;

    tiles.forEach(
        function (item) {
            if (item.type === this_tile.type) {
                count++;
            }
        }
    );
    return count;
};

TileMap.prototype.shorelineStopCondition = function () {
    for (var i = 0; i < this.height; ++i) {
        for (var j = 0; (!(i % 2)) ? (j < this.width) : (j < (this.width - 1)); ++j) {
            if (this.tileAt(i, j).type === "SHORELINE") {
                if (this.lookForSameTypeNeighbors([i, j]) < 2)
                return true;
            }
        }
    }
};

TileMap.prototype.numberOfTilesWithType = function (type) {
    var count = 0;
    for (var i = 0; i < this.height; ++i) {
        for (var j = 0; (!(i % 2)) ? (j < this.width) : (j < (this.width - 1)); ++j)
            if (this.content[i][j].getType() === type) count++;
    }
    return count;
};

TileMap.prototype.generatePlayMap = function () {
    var mid_width = this.width / 2;
    var mid_height = this.height / 2;

    // Random number between higher_percentage and lower_percentage
    var percentage = Math.random() * (HIGHER_PERCENTAGE - LOWER_PERCENTAGE) + LOWER_PERCENTAGE;

    // Random number between -π/2 and π/2
    var symmetry_angle = (Math.random() - 0.5) * Math.PI;

    var selected_point;
    var starting_point = [Math.abs(Math.round(this.height * randGaussian(0.75, 0.25))),
        Math.abs(Math.round(this.width * randGaussian(0.125, 0.25)))];
    selected_point = starting_point;
    this.content[starting_point[0]][starting_point[1]].setType("SHORELINE");
    while (!this.shorelineStopCondition() || percentage < (((this.width * this.height) - this.numberOfTilesWithType("SEA")) / (this.width * this.height))) {

        var a = randGaussian(2.5, 0.25);
        var b = randGaussian(1, 0.1);

        selected_point = incrementPoint(selected_point, [-a * selected_point[1], b * selected_point[0]]);
        this.content[selected_point[0]][selected_point[1]].setType("SHORELINE");
    }
};

TileMap.prototype.print = function () {
    for (var i = 0; i < this.height; ++i) {
        for (var j = 0; (!(i % 2)) ? (j < this.width) : (j < (this.width - 1)); ++j) {
            document.write(this.content[i][j].getType());
            document.write(" ");
        }
        console.log("hi");
        document.write("<br>");
    }
};