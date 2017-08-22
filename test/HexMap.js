
// Class hex map. The actual map of the game - used to render, generate and store the island.

const EXPANSION_DEVIATION = 0.1;
const GENERATOR_LAND_DEVIATION = 0.01;
const GENERATOR_MEAN_EXCLUSION_PERCENTAGE = 0.7;
const GENERATOR_MEAN_MOUNTAIN_EXCLUSION_PERCENTAGE = 0.75;
const GENERATOR_MEAN_LAND_PERCENTAGE = 0.45;
const FOREST_EXPANSION_DEVIATION = 0.4;
const HEAVY_FOREST_LIMIT = 7;
const FOREST_PAIR_LIMIT = 20;
const MOUNTAINS_EXPANSION_DEVIATION = 0.08;
const NUMBER_OF_SWAMPS = 2;
const SWAMP_EXPANSION_EXCLUSION_MEAN = 0.85;

const HEX_SIDE = 30;

function HexMap (width, height) {
    this.width = width;
    this.height = height;

    this.contents = [];
    for (let i = 0; i < this.width; i++) {
        this.contents[i] = [];
        for (let j = 0; j < this.height; j++)
            this.contents[i].push(new Tile(i, j, HEX_SIDE, spriteSheet, "SEA"));
    }
}

HexMap.prototype.tileAt = function (vector) {
    return this.contents[vector.x][vector.y];
};

// returns an array of vectors containing the coordinates of every hex in the map
// useful if, for example, we need to use search functions for the entire map
HexMap.prototype.getFullMapVectors = function () {
    let vectors = [];
    for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++)
            vectors.push(new Vector(i, j));
    }
    return vectors;
};



// returns true if the vector is a valid hex on the map
HexMap.prototype.isValidVector = function (vector) {
    return ( (vector.x >= 0) && (vector.x <= this.width - 1) && (vector.y >= 0) && (vector.y <= this.height - 1) );
};

// returns true if the vector is on the edge of the map
HexMap.prototype.isEdge = function (vector) {
    if (this.isValidVector(vector))
        return ((vector.x === 0) || (vector.y === 0) || (vector.x === this.width - 1) || (vector.y === this.height - 1));
    return false;
};

// returns an array with the hexes that have distance N from the hex the vector points to
HexMap.prototype.getNeighborsDistanceN = function (vector, n) {
    let neighbors = [vector];
    if (n === 0) return neighbors;
    for (let direction of cube_directions) {
        let cube = vector.toCube();
        cube.addCube(direction);
        let neighbor = cube.toVector();
        if (this.isValidVector(neighbor))
            neighbors.push(neighbor);
    }
    for (let i = 1; i < n; i++)
        neighbors = this.expand(neighbors);
    if (neighbors.length > 0)
        return neighbors;
};

// given an array of hexes, it finds all their adjacent hexes and returns an array with them
HexMap.prototype.expand = function (vectors) {
    let expansion = vectors;
    for (let v of vectors) {
        expansion = expansion.concat(this.getNeighborsDistanceN(v, 1));
    }
    return uniqBy(expansion, JSON.stringify);
};

// given an array of vector points, finds the number of hexes that are of a given type
HexMap.prototype.findNumberOfHexesType = function (vectors, type) {
    let count = 0;
    for (let v of vectors)
        if (this.tileAt(v).type === type) count++;
    return count;
};

// NOTICE - these two functions could probably be one, but they are this way for performance

// given an array of vector points, returns an array of hexes of a given type
HexMap.prototype.findHexesOfType = function (vectors, type) {
    let hexesVectors = [];
    for (let v of vectors)
        if (this.tileAt(v) === type) hexesVectors.push(v);
    return hexesVectors;
};

HexMap.prototype.expandWithPercentage = function (vectors, percentage) {
    let expansion = vectors;
    for (let v of vectors) {
        expansion = expansion.concat(this.getNeighborsDistanceN(v, 1));
        let nOfHexesToKeep = Math.abs(Math.round(randGaussian(percentage, EXPANSION_DEVIATION)) * expansion.length);
        shuffle(expansion);
        for (let j = 0; j < expansion.length - nOfHexesToKeep; j++)
            expansion.pop();
    }
    return uniqBy(expansion, JSON.stringify);
};

HexMap.prototype.setTile = function (tile, type) {
    this.contents[tile.x][tile.y].setType(type);
};

HexMap.prototype.generateIsland = function () {

    // helper variable declaration and setting
    let map_land_percentage = 0;
    while (map_land_percentage <= 0.0 || map_land_percentage >= 1.0)
        map_land_percentage = randGaussian(GENERATOR_MEAN_LAND_PERCENTAGE, GENERATOR_LAND_DEVIATION);
    let slope = Math.random() * 100 - 50;

    let land_tiles = [new Vector(Math.round(this.width / 2), Math.round(this.height / 2))];
    do {
        let rand = Math.abs(randGaussian(GENERATOR_MEAN_EXCLUSION_PERCENTAGE, EXPANSION_DEVIATION));
        land_tiles = this.expandWithPercentage(land_tiles, rand);
        for (let t of land_tiles)
            if (!this.isEdge(t))
                this.setTile(t, "PLAINS");
            else
                land_tiles.splice(land_tiles.indexOf(t), 1);
    } while (land_tiles.length / (this.width * this.height) < map_land_percentage);

    for (let v of land_tiles)
        if (this.findNumberOfHexesType((this.getNeighborsDistanceN(v, 1)), "SEA"))
            this.setTile(v, "SHORELINE");


    let n_of_forest_pairs = Math.ceil(Math.random() * FOREST_PAIR_LIMIT);
    for (let i = 0; i < n_of_forest_pairs; i++) {
        let forest = new Vector(0, 0);
        while (!(this.tileAt(forest).type === "PLAINS")) {
            let a = Math.abs(Math.round(Math.random() * (this.width - 1)));
            let b = Math.abs(Math.round(Math.random() * (this.height - 1)));
            forest.x = a; forest.y = b;
        }
        this.setTile(forest,"FOREST_HEAVY");
        let new_forest = [forest];
        let rand = Math.abs(randGaussian(GENERATOR_MEAN_EXCLUSION_PERCENTAGE, FOREST_EXPANSION_DEVIATION));
        let size = Math.ceil(Math.random() * 3);
        for (let i = 0; i < size; i++)
            new_forest = this.expandWithPercentage(new_forest, rand);
        for (let v of new_forest)
            if ((this.tileAt(v).type !== "SEA") && this.tileAt(v).type !== "SHORELINE")
                this.setTile(v, "FOREST_LIGHT");
        for (let v of new_forest)
            if (this.findNumberOfHexesType(this.getNeighborsDistanceN(v, 1), "FOREST_LIGHT")
                + this.findNumberOfHexesType(this.getNeighborsDistanceN(v, 1), "FOREST_HEAVY") >= HEAVY_FOREST_LIMIT)
                this.setTile(v, "FOREST_HEAVY");

    }

    let map_diagonal = Math.sqrt(this.width*this.width + this.height*this.height);

    let mountains = [];
    for (let i = -Math.round(map_diagonal); i < Math.round(map_diagonal); i++) {
        let v = new Vector(Math.round(i + this.width / 2), -Math.round((Math.atan(slope) * i) - this.height / 2));
        console.log(v.toString());
        if (this.isValidVector(v)) {
            mountains.push(v);
        }
    }
    let rand = Math.abs(randGaussian(GENERATOR_MEAN_MOUNTAIN_EXCLUSION_PERCENTAGE, MOUNTAINS_EXPANSION_DEVIATION));
    mountains = this.expandWithPercentage(mountains, rand);
    for (v of mountains)
        if ((this.tileAt(v).type !== "SEA" && this.tileAt(v).type !== "SHORELINE"))
            this.setTile(v, "MOUNTAINS");

    for (let i = 0; i < NUMBER_OF_SWAMPS; i++) {
        let swamp_seed = new Vector(0, 0);
        while (!(this.tileAt(swamp_seed).type === "SHORELINE")) {
            let a = Math.abs(Math.round(Math.random() * (this.width - 1)));
            let b = Math.abs(Math.round(Math.random() * (this.height - 1)));
            swamp_seed.x = a; swamp_seed.y = b;
        }

        let swamp = [swamp_seed];
        for (let j = 0; j < 2; j++)
            swamp = this.expandWithPercentage(swamp, SWAMP_EXPANSION_EXCLUSION_MEAN);

        for (let v of swamp) {
            if (this.tileAt(v).type !== "SEA")
                if (this.tileAt(v).type === "SHORELINE")
                    this.setTile(v, "MARSH");
                else
                    this.setTile(v, "SWAMP");
        }
    }


};