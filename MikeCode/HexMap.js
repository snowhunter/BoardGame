// Class hex map. The actual map of the game - used to render, generate and store the island.

const EXPANSION_DEVIATION = 0.05;
const GENERATOR_LAND_DEVIATION = 0.01;
const GENERATOR_MEAN_EXCLUSION_PERCENTAGE = 0.7;
const GENERATOR_MEAN_LAND_PERCENTAGE = 0.45;

function HexMap (width, height) {
    this.width = width;
    this.height = height;

    this.contents = [];
    for (var i = 0; i < this.width; i++) {
        this.contents[i] = [];
        var height_limit = (i % 2) ? this.height - 1 : this.height;
        for (var j = 0; j < height_limit; j++)
            this.contents[i].push(new Hex("SEA", i, j));
    }
}

HexMap.prototype.tileAt = function (vector) {
    return this.contents[vector.x][vector.y];
};

// returns an array of vectors containing the coordinates of every hex in the map
// useful if, for example, we need to use search functions for the entire map
HexMap.prototype.getFullMapVectors = function () {
    var vectors = [];
    for (var i = 0; i < this.width; i++) {
        var height_limit = (i % 2) ? this.height -1 : this.height;
        for (var j = 0; j < height_limit; j++)
            vectors.push(new Vector(i, j));
    }
    return vectors;
};



// returns true if the vector is a valid hex on the map
HexMap.prototype.isValidVector = function (vector) {
    var height_limit = (vector.x % 2) ? this.height - 1 : this.height;
    return ( (vector.x >= 0) && (vector.x <= this.width - 1) && (vector.y >= 0) && (vector.y <= height_limit - 1) );
};

// returns true if the vector is on the edge of the map
HexMap.prototype.isEdge = function (vector) {
    var height_limit = (vector.x % 2) ? this.height - 1 : this.height;
    if (this.isValidVector(vector))
        return ((vector.x === 0) || (vector.y === 0) || (vector.x === this.width - 1) || (vector.y === height_limit - 1));
    return false;
};

// returns an array with the hexes that have distance N from the hex the vector points to
HexMap.prototype.getNeighborsDistanceN = function (vector, n) {
    var neighbors = [];
    for (var k = 0; k < cube_directions.length; k++) {
        var cube = vector.toCube();
        cube.addCube(cube_directions[k]);
        var neighbor = cube.toVector();
        if (this.isValidVector(neighbor))
            neighbors.push(neighbor);
    }
    for (var i = 1; i < n; i++)
        neighbors = this.expand(neighbors);
    if (neighbors.length > 0)
        return neighbors;
};

// given an array of hexes, it finds all their adjacent hexes and returns an array with them
HexMap.prototype.expand = function (vectors) {
    var expansion = vectors;
    for (var i = 0; i < vectors.length; i++) {
        expansion = expansion.concat(this.getNeighborsDistanceN(vectors[i], 1));
    }
    return uniqBy(expansion, JSON.stringify);
};

// given an array of vector points, finds the number of hexes that are of a given type
HexMap.prototype.findNumberOfHexesType = function (vectors, type) {
    var count = 0;
    for (var i = 0; i < vectors.length; i++)
        if (this.tileAt(vectors[i]).type === type) count++;
    return count;
};

// NOTICE - these two functions could probably be one, but they are this way for performance

// given an array of vector points, returns an array of hexes of a given type
HexMap.prototype.findHexesOfType = function (vectors, type) {
    var hexesVectors = [];
    for (var i = 0; i < vectors.length; i++)
        if (this.tileAt(vectors[i]) === type) hexesVectors.push(vectors[i]);
    return hexesVectors;
};

HexMap.prototype.expandWithPercentage = function (vectors, percentage) {
    var expansion = vectors;
    for (var i = 0; i < vectors.length; i++) {
        expansion = expansion.concat(this.getNeighborsDistanceN(vectors[i], 1));
        var nOfHexesToKeep = Math.abs(Math.round(randGaussian(percentage, EXPANSION_DEVIATION)) * expansion.length);
        shuffle(expansion);
        for (var j = 0; j < expansion.length - nOfHexesToKeep; j++)
            expansion.pop();
    }
    return uniqBy(expansion, JSON.stringify);
};

HexMap.prototype.generateIsland = function () {

    // helper variable declaration and setting
    var horizontal_middle = Math.floor(this.width / 2);
    var vertical_middle = Math.floor(this.height / 2);
    var map_land_percentage = 0;
    while (map_land_percentage <= 0.0 || map_land_percentage >= 1.0) map_land_percentage = randGaussian(GENERATOR_MEAN_LAND_PERCENTAGE, GENERATOR_LAND_DEVIATION);
    var symmetry_axis_angle = (Math.random() * Math.PI / 2)

    document.write("Generating landmass...<br>");
    var land_tiles = [new Vector(horizontal_middle, vertical_middle)];
    var mapNOfTiles = (this.width * this.height) - (this.height / 2);
    while (land_tiles.length / mapNOfTiles < map_land_percentage) {
        land_tiles = this.expandWithPercentage(land_tiles, randGaussian(GENERATOR_MEAN_EXCLUSION_PERCENTAGE, EXPANSION_DEVIATION));
        for (var k = 0; k < land_tiles.length; k++) {
            if (!this.isEdge(land_tiles[k]))
                (this.contents[land_tiles[k].x][land_tiles[k].y]).setType("PLAINS");
        }
    }
    document.write("Generating shores...<br>");
    for (var i = 0; i < this.width; i++) {
        var height_limit = (i % 2) ? this.height - 1 : this.height;
        for (var j = 0; j < height_limit; j++)
            if (this.findNumberOfHexesType((this.getNeighborsDistanceN((this.contents[i][j]).getVector(), 1)), "SEA") && this.contents[i][j].type !== "SEA")
                this.contents[i][j].setType("SHORELINE");
    }
};

HexMap.prototype.printMapOnDocument = function () {
    for (var i = 0; i < this.width; i++) {
        var height_limit = (i % 2) ? this.height - 1 : this.height;
        for (var j = 0; j < height_limit; j++) {
            document.write(this.contents[i][j].type, "&emsp;");
        }
        document.write("<br>");
    }
};

