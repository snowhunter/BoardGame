
// Class hex map. The actual map of the game - used to render, generate and store the island.




function HexMap (width, height) {
    this.width = width;
    this.height = height;

    this.contents = [];
    for (let i = 0; i < this.width; i++) {
        this.contents[i] = [];
        for (let j = 0; j < this.height; j++)
            this.contents[i].push(new Tile(i, j, size, images[0], "SEA"));
    }
}

HexMap.prototype.getTile = function (vector) {
    return this.contents[vector.x][vector.y];
};

HexMap.prototype.setTile = function (tile, type) {
    this.contents[tile.x][tile.y].setType(type);
};


function isValidVector(hexmap, vector) {
    return ( (vector.x >= 0) && (vector.x <= hexmap.width - 1) && (vector.y >= 0) && (vector.y <= hexmap.height - 1) );
}


function isEdge (hexmap, vector) {
    if (isValidVector(hexmap, vector))
        return ((vector.x === 0) || (vector.y === 0) || (vector.x === hexmap.width - 1) || (vector.y === hexmap.height - 1));
    return false;
}

function getNeighboursDistanceN (hexmap, vector, n) {

    if (n === 0) return [vector];

    let x = vector.x, y = vector.y;
    let neighbours = [vector, new Vector(x - 1, y), new Vector(x + 1, y)];
    if (y % 2) {
        neighbours.push(new Vector(x, y - 1), new Vector(x + 1, y - 1), new Vector(x, y + 1), new Vector(x + 1, y + 1));
    } else {
        neighbours.push(new Vector(x - 1, y - 1), new Vector(x, y - 1), new Vector(x - 1, y + 1), new Vector(x, y + 1));
    }

    for (let i = neighbours.length - 1; i >= 0; i--)
        if (!isValidVector(hexmap, neighbours[i]))
            neighbours.splice(i, 1);

    for (let i = 1; i < n; i++)
        neighbours = expand(hexmap, neighbours);
    return neighbours;

}


function findNumberOfHexesType (hexmap, vectors, type) {
    let count = 0;
    for (let v of vectors)
        if (hexmap.getTile(v).type === type) count++;
    return count;
}

function expand (hexmap, vectors, percentage=1, deviation=0) {
    let expansion = vectors.slice();
    for (let v of expansion)
        expansion = expansion.concat(getNeighboursDistanceN(hexmap, v, 1));
    let nOfHexesToKeep = Math.round(Math.abs(randGaussian(percentage, deviation)) * expansion.length);
    shuffle(expansion);
    for (let j = expansion.length - nOfHexesToKeep; j >= 0; j--)
        expansion.splice(j, 1);
    for (let i = expansion.length - 1; i >= 0; i--)
        if (isEdge(hexmap, expansion[i]) || !isValidVector(hexmap, expansion[i]))
            expansion.splice(i, 1);

    return uniqBy(expansion, JSON.stringify);
}


HexMap.prototype.tilesToArray = function () {
    let tiles = [];
    for (let i of this.contents)
        for (let j of i)
            tiles.push(j.getVector());
    return tiles;
};

HexMap.prototype.shiftVectorRelativeToCenter = function (vector) {
    return new Vector(vector.x - Math.round(this.width / 2), Math.round(this.height / 2) - vector.y);
};

HexMap.prototype.shiftVectorBackToGrid = function (vector) {
  return new Vector(vector.x + Math.round(this.width / 2), Math.round(this.height / 2) - vector.y);
};

HexMap.prototype.generateFunctionalCentered = function () {

    let vertical_chance = Math.random();

    let A = Math.random() * 4 - 2;
    let B = Math.random() / Math.sqrt(this.width/3);
    let C = Math.random() * 2 - 1;

    let linspace = [];
    let results = [];
    for (let i = -this.width / 2; i <= this.width / 2; i += 0.5)
        if (vertical_chance < 0.5)
            linspace.push(new Vector(Math.round(i), Math.round(i * (A * Math.exp(-Math.pow(B * i, 2)) + C))));
        else
            linspace.push(new Vector(Math.round(i * (A * Math.exp(-Math.pow(B * i, 2)) + C)), Math.round(i)));
    for (let v of linspace)
        if (isValidVector(this, this.shiftVectorBackToGrid(v)))
            results.push(this.shiftVectorBackToGrid(v));
    return [results, C];
};

// returns a list of vectors that are part of a growth
HexMap.prototype.generateGrowth = function (area, vector, percentage) {
    let growth = [vector];
    do {
        growth = expand(this, growth);
    } while (growth.length / area.length < percentage);
    return growth;
};

HexMap.prototype.generateBorders = function (landmass, border_outer, exclude="") {
    let borders = [];
    for (let v of landmass)
        if (findNumberOfHexesType(this, getNeighboursDistanceN(this, v, 1), border_outer) && this.getTile(v).type !== exclude)
            borders.push(v);
    return borders;
};

HexMap.prototype.findSymmetricPair = function (on_tile_type) {

    let root = new Vector(0, 0);
    let i = 0;

    while (!(this.getTile(root).type === on_tile_type) && i < 100) {
        let a = Math.abs(Math.round(Math.random() * (this.width - 1)));
        let b = Math.abs(Math.round(Math.random() * (this.height - 1)));
        root.x = a; root.y = b;
        i++;
    }

    let symmetric = sub(scale(new Vector(Math.round(this.width / 2), Math.round(this.height / 2)), 2), root);
    if (isValidVector(this, symmetric)) {
        let j = 0;
        let sym_list = [symmetric];
        while (!(this.getTile(symmetric).type === on_tile_type) && j < (this.width + this.height) / 8 ) {
            sym_list = expand(this, sym_list);
            for (let v of sym_list) {
                if (this.getTile(v).type === on_tile_type) {
                    symmetric = v;
                    break;
                }
            }
            j++;
        }
        return [root, symmetric];
    } else {
        console.log("Failed to find a symmetric");
        return [root];
    }


};

HexMap.prototype.generateJags = function (vectors, layers, exclusion_starting) {
    let jags = vectors.slice();
    for (let i = 1; i < layers + 1; i++)
        jags = expand(this, jags, exclusion_starting * i, 0);
    return jags;
};


// constants that have to do with the percentage of land on the map
const GENERATOR_MEAN_LAND_PERCENTAGE = 0.75;
const GENERATOR_LAND_PERCENTAGE_DEVIATION = 0.05;

// constants that have to do with forests
const GENERATOR_FOREST_MEAN_EXCLUSION_PERCENTAGE = 0.8;
const GENERATOR_FOREST_EXPANSION_DEVIATION = 0.15;
const HEAVY_FOREST_TURN_CHANCE = 0.7;
const HEAVY_FOREST_ALLOWANCE_LIMIT = 7;

// constants that have to do with the mountain range
const GENERATOR_MOUNTAINRANGE_CHANCE = 0.9;
const GENERATOR_MEAN_MOUNTAIN_EXCLUSION_PERCENTAGE = 0.9;
const MOUNTAINS_EXPANSION_DEVIATION = 0.28;
const MOUNTAINS_EXPANSION_DEVIATION_DEVIATION = 0.03;
const MOUNTAINS_SHORELINE_EXCLUSION_CHANCE = 0.3;


const SWAMP_EXPANSION_NUMBER = 3;

HexMap.prototype.generateIsland = function () {

    let UPPER_FOREST_LIMIT = this.width / 2;
    let LOWER_FOREST_LIMIT = Math.round(this.width / 3);
    let MAX_FOREST_EXPANSIONS = Math.ceil(this.width / 12);
    let MAX_MOUNTAIN_EXPANSIONS = Math.round(this.width / 40);


    let map_land_percentage = 0;
    while (map_land_percentage <= 0.0 || map_land_percentage >= 0.85)
        map_land_percentage = randGaussian(GENERATOR_MEAN_LAND_PERCENTAGE, GENERATOR_LAND_PERCENTAGE_DEVIATION);

    let middle = new Vector(Math.round((this.width - 1) / 2), Math.round((this.height - 1) / 2));

    let landmass = this.generateGrowth(this.tilesToArray(), middle, map_land_percentage);
    for (let t of landmass)
        this.setTile(t, "PLAINS");


    let shores = this.generateBorders(landmass, "SEA", "SEA");
    let jaggedness = this.generateJags(shores, 2, 0.2);
    for (let v of jaggedness)
        this.setTile(v, "SEA");

    shores = this.generateBorders(this.tilesToArray(), "SEA", "SEA");
    for (let t of shores)
       this.setTile(t, "SHORELINE");

    let mountain_count_chance = Math.random();
    if (mountain_count_chance > 1 - GENERATOR_MOUNTAINRANGE_CHANCE) {
        let mountain_list = this.generateFunctionalCentered();
        let mountains = mountain_list[0];
        for (let i = 0; i < MAX_MOUNTAIN_EXPANSIONS; i++)
            mountains = expand(this, mountains, Math.abs(randGaussian(GENERATOR_MEAN_MOUNTAIN_EXCLUSION_PERCENTAGE, MOUNTAINS_EXPANSION_DEVIATION)), MOUNTAINS_EXPANSION_DEVIATION_DEVIATION);
        for (let v of mountains)
            if (this.getTile(v).type !== "SEA" && (this.getTile(v).type !== "SHORELINE" || Math.random() < MOUNTAINS_SHORELINE_EXCLUSION_CHANCE))
                this.setTile(v, "MOUNTAINS");
    }

    for (let i of this.tilesToArray())
        if (findNumberOfHexesType(this, getNeighboursDistanceN(this, i, 1), "SEA") === 6)
            this.setTile(i, "SEA");

    let forests = [];
    let nOfForests = Math.ceil(Math.random() * (UPPER_FOREST_LIMIT - LOWER_FOREST_LIMIT) + LOWER_FOREST_LIMIT);
    for (let i = 0; i < nOfForests; i++) {
        let seed = this.findSymmetricPair("PLAINS");
        let rand_mean = Math.abs(randGaussian(GENERATOR_FOREST_MEAN_EXCLUSION_PERCENTAGE, GENERATOR_FOREST_EXPANSION_DEVIATION));
        let size = Math.ceil(Math.random() * MAX_FOREST_EXPANSIONS);
        for (let i = 0; i < size; i++)
            seed = expand(this, seed, rand_mean, GENERATOR_FOREST_EXPANSION_DEVIATION);
        forests = forests.concat(seed);
    }
    for (let v of forests)
        if ((this.getTile(v).type !== "SEA") && this.getTile(v).type !== "SHORELINE" && (this.getTile(v).type !== "MOUNTAINS" || Math.random() < 0.2))
            this.setTile(v, "FOREST_LIGHT");
    for (let v of forests)
        if ((findNumberOfHexesType(this, getNeighboursDistanceN(this, v, 1), "FOREST_LIGHT")
                + findNumberOfHexesType(this, getNeighboursDistanceN(this, v, 1), "FOREST_HEAVY") >= HEAVY_FOREST_ALLOWANCE_LIMIT)
            && (Math.random() >= HEAVY_FOREST_TURN_CHANCE))
            this.setTile(v, "FOREST_HEAVY");

    let swamps = this.findSymmetricPair("SHORELINE");
    let swampExpansions = Math.ceil(Math.random() * SWAMP_EXPANSION_NUMBER + 2);
    for (let i = 0; i < swampExpansions; i++)
        swamps = expand(this, swamps, 0.7, 0.1);
    for (let v of swamps) {
        if ((this.getTile(v).type !== "SEA") && (this.getTile(v).type !== "SHORELINE")) this.setTile(v, "SWAMP");
        else if ((this.getTile(v).type === "SHORELINE")) this.setTile(v, "MARSH");
    }

    this.setTile(middle, "FOREST_HEAVY");
    let marsh = expand(this, [middle]);
    let size = Math.ceil(Math.random() * 2.5);
    for (let i = 0; i < size; i++)
        marsh = expand(this, marsh, 1 - 0.45 * i, 0.05);
    for (let t of marsh)
        if (!(this.getTile(t).type === "FOREST_HEAVY") && ((!(this.getTile(t).type === "MOUNTAINS")) || (Math.random() > 0.98)))
            this.setTile(t, "SWAMP");
    for (let t of marsh)
        if ((findNumberOfHexesType(this, getNeighboursDistanceN(this, t, 1), "FOREST_HEAVY") > 0) && (!(this.getTile(t).type === "FOREST_HEAVY")))
            this.setTile(t, "MARSH");

};

HexMap.prototype.setSpawns = function () {
    let flag = false;
    let pair = [];
    do {
        pair = this.findSymmetricPair("SHORELINE");
        let validation = pair;
        validation = expand(this, validation, 1, 0);
        for (let v of validation)
            if (this.getTile(v).type === "SWAMP" || this.getTile(v).type === "SWAMP") {
                flag = false;
                break;
            }
        flag = true;
    } while (!flag);
    console.log(pair[0], pair[1]);
    return pair;
};