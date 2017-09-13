
// Class hex map. The actual map of the game - used to render, generate and store the island.



const HEX_SIDE = 30;

function HexMap (width, height) {
    this.width = width;
    this.height = height;

    this.contents = [];
    for (let i = 0; i < this.width; i++) {
        this.contents[i] = [];
        for (let j = 0; j < this.height; j++)
            this.contents[i].push(new Tile(i, j, HEX_SIDE, images[0], "SEA"));
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
        neighbours = expand(hexmap, neighbours, 1, 0);
    return neighbours;

}


function findNumberOfHexesType (hexmap, vectors, type) {
    let count = 0;
    for (let v of vectors)
        if (hexmap.getTile(v).type === type) count++;
    return count;
}

function expand (hexmap, vectors, percentage, deviation) {
    let expansion = vectors;
    for (let v of vectors)
        expansion = expansion.concat(getNeighboursDistanceN(hexmap, v, 1));

    let nOfHexesToKeep = Math.abs(Math.round(randGaussian(percentage, deviation)) * expansion.length);
    shuffle(expansion);
    for (let j = 0; j < expansion.length - nOfHexesToKeep; j++)
        expansion.pop();
    for (let i = expansion.length - 1; i >= 0; i--)
        if (isEdge(hexmap, expansion[i]) || !isValidVector(hexmap, expansion[i]))
            expansion.splice(i, 1);


    return uniqBy(expansion, JSON.stringify);
}

// constants that have to do with the percentage of land on the map
const GENERATOR_MEAN_LAND_PERCENTAGE = 0.65;
const GENERATOR_LAND_PERCENTAGE_DEVIATION = 0.03;

// constants that have to do with how uneven the lands' shorelines are, and as a result how likely lakes get the closer you get to the shore
const GENERATOR_LAND_MEAN_EXCLUSION_PERCENTAGE = 0.1;
const GENERATOR_LAND_EXPANSION_DEVIATION = 0.1;
const GENERATOR_LAND_EXCLUSION_DEVIATION = 0.075;

// constants that have to do with forests
const GENERATOR_FOREST_MEAN_EXCLUSION_PERCENTAGE = 0.05;
const GENERATOR_FOREST_EXPANSION_DEVIATION = 0.8;
const HEAVY_FOREST_TURN_CHANCE = 0.275;
const MAX_FOREST_EXPANSIONS = 3;
const GENERATOR_FOREST_NUMBER_DEVIATION = 0.2;
const UPPER_FOREST_LIMIT = 15;
const LOWER_FOREST_LIMIT = 5;
const HEAVY_FOREST_ALLOWANCE_LIMIT = 7;

// constants that have to do with the mountain range
const GENERATOR_MOUNTAINRANGE_CHANCE = 0.9;
const GENERATOR_MEAN_MOUNTAIN_EXCLUSION_PERCENTAGE = 0.9;
const MOUNTAINS_EXPANSION_DEVIATION = 0.08;
const MOUNTAINS_EXPANSION_DEVIATION_DEVIATION = 0.03;
const MOUNTAINS_SHORELINE_EXCLUSION_CHANCE = 0.3;


const NUMBER_OF_SWAMPS = 2;
const SWAMP_MAX_EXPANSION_NUMBER = 2;
const SWAMP_EXPANSION_EXCLUSION_MEAN = 0.5;
const SWAMP_EXPANSION_EXCLUSION_DEVIATION = 0.3;

HexMap.prototype.generateGrowth = function (vector, percentage, type, horizontal_bias) {
    let growth = [vector];
    do {
        let rand_mean = Math.abs(randGaussian(GENERATOR_LAND_MEAN_EXCLUSION_PERCENTAGE, GENERATOR_LAND_EXPANSION_DEVIATION));
        growth = expand(this, growth, rand_mean, GENERATOR_LAND_EXCLUSION_DEVIATION);
        for (let v of growth)
            if (Math.abs(v.x - vector.x) > 0.5 * this.width)
                for (let i = 0; i < Math.round(randGaussian(horizontal_bias, 0.4)); i++)
                    growth = expand(this, growth, rand_mean, GENERATOR_LAND_EXCLUSION_DEVIATION);
    } while (growth.length / (this.width * this.height) < percentage);
    for (let t of growth)
        this.setTile(t, type);
    return growth;
};

HexMap.prototype.generateBorders = function (landmass, border_outer, border_type) {
    let borders = [];
    for (let v of landmass)
        if (findNumberOfHexesType(this, getNeighboursDistanceN(this, v, 1), border_outer)) {
            borders.push(v);
            this.setTile(v, border_type);
        }
    return borders;
};

HexMap.prototype.generateForests = function (number, max_size) {
    let forests = [];
    for (let i = 0; i < number; i++) {
        let forest = new Vector(0, 0);
        let i = 0;
        while (!(this.getTile(forest).type === "PLAINS") && i <= 50) {
            let a = Math.abs(Math.round(Math.random() * (this.width - 1)));
            let b = Math.abs(Math.round(Math.random() * (this.height - 1)));
            forest.x = a; forest.y = b;
            i++;
        }
        let new_forest = [forest];
        let rand_mean = Math.abs(randGaussian(GENERATOR_FOREST_MEAN_EXCLUSION_PERCENTAGE, GENERATOR_FOREST_EXPANSION_DEVIATION));
        let size = Math.ceil(Math.random() * max_size);
        for (let i = 0; i < size; i++)
            new_forest = expand(this, new_forest, rand_mean, GENERATOR_FOREST_EXPANSION_DEVIATION);
        for (let v of new_forest)
            if ((this.getTile(v).type !== "SEA") && this.getTile(v).type !== "SHORELINE")
                this.setTile(v, "FOREST_LIGHT");
        for (let v of new_forest)
            if ((findNumberOfHexesType(this, getNeighboursDistanceN(this, v, 1), "FOREST_LIGHT")
                    + findNumberOfHexesType(this, getNeighboursDistanceN(this, v, 1), "FOREST_HEAVY") >= HEAVY_FOREST_ALLOWANCE_LIMIT)
                && (Math.random() >= HEAVY_FOREST_TURN_CHANCE))
                this.setTile(v, "FOREST_HEAVY");
        forests.concat(new_forest);

    }
    return forests;
};

HexMap.prototype.generateDiagonal = function (angle, diagonal, type) {
    let mountains = [];
    for (let i = -Math.round(diagonal); i < Math.round(diagonal); i++) {
        let v = new Vector(Math.round(i + this.width / 2), -Math.round((Math.atan(angle) * i) - this.height / 2));
        if (isValidVector(this, v)) {
            mountains.push(v);
        }
    }
    let rand = Math.abs(randGaussian(GENERATOR_MEAN_MOUNTAIN_EXCLUSION_PERCENTAGE, MOUNTAINS_EXPANSION_DEVIATION));
    mountains = expand(this, mountains, rand, MOUNTAINS_EXPANSION_DEVIATION_DEVIATION);
    for (let v of mountains)
        if (this.getTile(v).type !== "SEA" && (this.getTile(v).type !== "SHORELINE" || Math.random() < MOUNTAINS_SHORELINE_EXCLUSION_CHANCE))
            this.setTile(v, type);
    return mountains;
};

HexMap.prototype.generateSwamp = function (number, max_size, type) {
    let swamp = [];
    for (let i = 0; i < number; i++) {
        let swamp_seed = new Vector(0, 0);
        let i = 0;
        while (!(this.getTile(swamp_seed).type === type) && i <= 50) {
            let a = Math.abs(Math.round(Math.random() * (this.width - 1)));
            let b = Math.abs(Math.round(Math.random() * (this.height - 1)));
            swamp_seed.x = a; swamp_seed.y = b;
            i++;
        }
        let swamp = [swamp_seed];
        for (let j = 0; j < Math.ceil(Math.random() * max_size); j++)
            swamp = expand(this, swamp, SWAMP_EXPANSION_EXCLUSION_MEAN, SWAMP_EXPANSION_EXCLUSION_DEVIATION);

        for (let v of swamp) {
            if (this.getTile(v).type !== "SEA")
                if (this.getTile(v).type === type)
                    this.setTile(v, "MARSH");
                else
                    this.setTile(v, "SWAMP");
        }

    }
    return swamp;
};

HexMap.prototype.generateIsland = function () {
    let map_land_percentage = 0;
    while (map_land_percentage <= 0.0 || map_land_percentage >= 0.85)
        map_land_percentage = randGaussian(GENERATOR_MEAN_LAND_PERCENTAGE, GENERATOR_LAND_PERCENTAGE_DEVIATION);

    let middle = new Vector(Math.round(this.width / 2), Math.round(this.height / 2));

    let landmass = this.generateGrowth(middle, map_land_percentage, "PLAINS", 2.6);
    let shores = this.generateBorders(landmass, "SEA", "SHORELINE");

    this.generateForests(Math.round(Math.abs(randGaussian(1, GENERATOR_FOREST_NUMBER_DEVIATION)) * (UPPER_FOREST_LIMIT - LOWER_FOREST_LIMIT)
        + LOWER_FOREST_LIMIT), MAX_FOREST_EXPANSIONS);

    let map_diagonal = Math.sqrt(this.width*this.width + this.height*this.height);
    let slope = Math.random() * 100 - 50;
    if (Math.random() > 1 - GENERATOR_MOUNTAINRANGE_CHANCE)
        this.generateDiagonal(slope, map_diagonal, "MOUNTAINS");

    this.generateSwamp(NUMBER_OF_SWAMPS, SWAMP_MAX_EXPANSION_NUMBER, "SHORELINE")
};