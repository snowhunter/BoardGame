
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

HexMap.prototype.isValidVector = function (vector) {
    return ( (vector.x >= 0) && (vector.x <= this.width - 1) && (vector.y >= 0) && (vector.y <= this.height - 1) );
};

HexMap.prototype.shiftVectorRelativeToCenter = function (vector) {
    return new Vector(vector.x - Math.round(this.width / 2), Math.round(this.height / 2) - vector.y);
};

HexMap.prototype.shiftVectorBackToGrid = function (vector) {
    return new Vector(vector.x + Math.round(this.width / 2), Math.round(this.height / 2) - vector.y);
};

function isValidVector(hexmap, vector) {
    return ( (vector.x >= 0) && (vector.x <= hexmap.width - 1) && (vector.y >= 0) && (vector.y <= hexmap.height - 1) );
}

HexMap.prototype.isEdge = function (vector) {
    if (this.isValidVector(vector))
        return ((vector.x === 0) || (vector.y === 0) || (vector.x === this.width - 1) || (vector.y === this.height - 1));
    return false;
};

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

const SCREEN_RATIO = 1.478;
const DC_COEFFICIENT_STRETCH_FACTOR = 0.0576;
const DC_COEFFICIENT_SCALE_FACTOR = 10.00;

const ELEVATION_EXPONENT = 1.1;
const HUMIDITY_EXPONENT = 0.8;

const ELEVATION_FIRST_HARMONIC_AMP = 1.5;
const ELEVATION_FIRST_HARMONIC_FREQ = 1.8;
const ELEVATION_SECOND_HARMONIC_AMP = 0.6;
const ELEVATION_SECOND_HARMONIC_FREQ = 2.5;
const ELEVATION_THIRD_HARMONIC_AMP = 1.0;
const ELEVATION_THIRD_HARMONIC_FREQ = 3.2;

const HUMIDITY_FIRST_HARMONIC_AMP = 3.5;
const HUMIDITY_FIRST_HARMONIC_FREQ = 1.4;
const HUMIDITY_SECOND_HARMONIC_AMP = 3.0;
const HUMIDITY_SECOND_HARMONIC_FREQ = 4.0;
const HUMIDITY_THIRD_HARMONIC_AMP = 2.0;
const HUMIDITY_THIRD_HARMONIC_FREQ = 7;

const CONDITION_LAND_ELEVATION = 0.50;
const CONDITION_BEACH_ELEVATION = 0.55;
const CONDITION_MOUNTAIN_ELEVATION = 0.94;
const CONDITION_STOP = 1.00;

const CONDITION_LIGHT_FOREST_HUMIDITY = 0.39;
const CONDITION_HEAVY_FOREST_HUMIDITY = 0.56;
const CONDITION_SWAMP_HUMIDITY = 0.70;
const CONDITION_MARSH_HUMIDITY_LAND = 0.78;
const CONDITION_MARSH_HUMIDITY_SHORE = 0.72;

const MAX_ELEVATION = Math.pow(ELEVATION_FIRST_HARMONIC_AMP + ELEVATION_SECOND_HARMONIC_AMP + ELEVATION_THIRD_HARMONIC_AMP + DC_COEFFICIENT_SCALE_FACTOR, ELEVATION_EXPONENT);
const MAX_HUMIDITY = Math.pow(HUMIDITY_FIRST_HARMONIC_AMP + HUMIDITY_SECOND_HARMONIC_AMP + HUMIDITY_THIRD_HARMONIC_AMP, HUMIDITY_EXPONENT);

HexMap.prototype.assignTileType = function (vector, elev, hum) {
    if (between(elev, CONDITION_LAND_ELEVATION, CONDITION_BEACH_ELEVATION)) {
        if (between(hum, -CONDITION_STOP, CONDITION_MARSH_HUMIDITY_SHORE))
            this.setTile(vector, "SHORELINE");
        else if (between(hum, CONDITION_MARSH_HUMIDITY_SHORE, CONDITION_STOP))
            this.setTile(vector, "MARSH");
    }
    if (between(elev, CONDITION_BEACH_ELEVATION, CONDITION_MOUNTAIN_ELEVATION)) {
        if (between(hum, -CONDITION_STOP, CONDITION_LIGHT_FOREST_HUMIDITY))
            this.setTile(vector, "PLAINS");
        else if (between(hum, CONDITION_LIGHT_FOREST_HUMIDITY, CONDITION_HEAVY_FOREST_HUMIDITY))
            this.setTile(vector, "FOREST_LIGHT");
        else if (between(hum, CONDITION_HEAVY_FOREST_HUMIDITY, CONDITION_SWAMP_HUMIDITY))
            this.setTile(vector, "FOREST_HEAVY");
        else if (between(hum, CONDITION_SWAMP_HUMIDITY, CONDITION_MARSH_HUMIDITY_LAND))
            this.setTile(vector, "SWAMP");
        else if (between(hum, CONDITION_MARSH_HUMIDITY_LAND, CONDITION_STOP))
            this.setTile(vector, "MARSH");
        else
            this.setTile(vector, "PLAINS");
    }
    if (between(elev, CONDITION_MOUNTAIN_ELEVATION, CONDITION_STOP)) this.setTile(vector, "MOUNTAINS");

    if (this.isEdge(vector)) this.setTile(vector, "SEA");
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

HexMap.prototype.generateIsland = function () {

    let gen = new SimplexNoise();
    let elevation = zeroes(this.width, this.height);
    let humidity = zeroes(this.width, this.height);

    for (let i = 0; i < this.width; i++)
        for (let j = 0; j < this.height; j++) {

            let nx = i / this.width - 0.5, ny = j / this.height - 0.5;
            let x = i - this.width / 2, y = this.height / 2 - j;

            let dc_coefficient_elevation = DC_COEFFICIENT_SCALE_FACTOR * Math.exp(-(Math.pow(DC_COEFFICIENT_STRETCH_FACTOR * x / SCREEN_RATIO, 2) + Math.pow(DC_COEFFICIENT_STRETCH_FACTOR * y, 2)))
                - Math.pow(DC_COEFFICIENT_STRETCH_FACTOR, 2) * Math.sqrt(((x * x) / (SCREEN_RATIO * SCREEN_RATIO)) + y * y);

            elevation[i][j] = Math.pow(
                normNoise(gen, nx, ny, ELEVATION_FIRST_HARMONIC_FREQ, ELEVATION_FIRST_HARMONIC_AMP)
                + normNoise(gen, nx, ny, ELEVATION_SECOND_HARMONIC_FREQ, ELEVATION_SECOND_HARMONIC_AMP)
                + normNoise(gen, nx, ny, ELEVATION_THIRD_HARMONIC_FREQ, ELEVATION_THIRD_HARMONIC_AMP)
                + dc_coefficient_elevation, ELEVATION_EXPONENT
            ) / MAX_ELEVATION;

            if (j < this.height / 2) {
                humidity[i][j] = Math.pow(
                    normNoise(gen, nx, ny, HUMIDITY_FIRST_HARMONIC_FREQ, HUMIDITY_FIRST_HARMONIC_AMP)
                    + normNoise(gen, nx, ny, HUMIDITY_SECOND_HARMONIC_FREQ, HUMIDITY_SECOND_HARMONIC_AMP)
                    + normNoise(gen, nx, ny, HUMIDITY_THIRD_HARMONIC_FREQ, HUMIDITY_THIRD_HARMONIC_AMP)
                    , HUMIDITY_EXPONENT) / MAX_HUMIDITY;

                let sym = scale(sub(new Vector(Math.round(this.width / 2), Math.round(this.height / 2)), new Vector(i , j)), 2);
                sym = add(sym, new Vector(i, j));
                humidity[sym.x - 2][sym.y - 2] = humidity[i][j];
            }
        }

    for (let i = 0; i < this.width; i++)
        for (let j = 0 ; j < this.height; j++)
            this.assignTileType(new Vector(i,j), elevation[i][j], humidity[i][j]);

    let mountain_range = expand(this, this.generateFunctionalCentered()[0], randGaussian(0.5, 0.1), 0.1);
    for (let v of mountain_range)
        if (this.getTile(v).type !== "SEA" && (this.getTile(v).type !== "SHORELINE" || Math.random() < 0.3))
            this.setTile(v, "MOUNTAINS");
};
