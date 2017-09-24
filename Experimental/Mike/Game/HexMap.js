
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

// Maxinum allowed height/wetness for elevation and humidity
const MAX_HEIGHT = 25;

// Various "constant" constants. Not to be changed unless the system of the game changes
const SCREEN_RATIO = 1.778;
const DC_COEFFICIENT_STRETCH_FACTOR = 0.1305;
const DC_COEFFICIENT_SCALE_FACTOR = 2;

// To what power is the elevation matrix raised to? (In order to redistribute the noise)
const ELEVATION_EXPONENT = 0.8;

// frequencies and amplitudes for elevation noise sinusoids
const ELEVATION_FIRST_HARMONIC_AMP = 0.4;
const ELEVATION_FIRST_HARMONIC_FREQ = 3;
const ELEVATION_SECOND_HARMONIC_AMP = 0.5;
const ELEVATION_SECOND_HARMONIC_FREQ = 4;

// elevation conditions and limits
const CONDITION_LAND_ELEVATION = 0.45;
const CONDITION_BEACH_ELEVATION = 0.59;
const CONDITION_MOUNTAIN_ELEVATION = 1.82;
const CONDITION_MOUNTAIN_STOP_ELEVATION = 2.3;

// frequencies and amplitudes for humidity noise sinusoids
const HUMIDITY_FIRST_HARMONIC_AMP = 3;
const HUMIDITY_FIRST_HARMONIC_FREQ = 1.5;
const HUMIDITY_SECOND_HARMONIC_AMP = 4;
const HUMIDITY_SECOND_HARMONIC_FREQ = 2.8;
const HUMIDITY_THIRD_HARMONIC_AMP = 5.2;
const HUMIDITY_THIRD_HARMONIC_FREQ = 4.2;

// humidity conditions and limits
const CONDITION_LIGHT_FOREST_HUMIDITY = 0.56;
const CONDITION_HEAVY_FOREST_HUMIDITY = 1.96;
const CONDITION_SWAMP_HUMIDITY = 3.87;
const CONDITION_MARSH_HUMIDITY_LAND = 4.87;
const CONDITION_MARSH_HUMIDITY_SHORE = 3.87;

HexMap.prototype.assignTileType = function (vector, elev, hum) {
    if (between(elev, CONDITION_LAND_ELEVATION, CONDITION_BEACH_ELEVATION)) {
        if (between(hum, -MAX_HEIGHT, CONDITION_MARSH_HUMIDITY_SHORE))
            this.setTile(vector, "SHORELINE");
        else if (between(hum, CONDITION_MARSH_HUMIDITY_SHORE, MAX_HEIGHT))
            this.setTile(vector, "MARSH");
    }
    if (between(elev, CONDITION_BEACH_ELEVATION, CONDITION_MOUNTAIN_ELEVATION)) {
        if (between(hum, -MAX_HEIGHT, CONDITION_LIGHT_FOREST_HUMIDITY))
            this.setTile(vector, "PLAINS");
        else if (between(hum, CONDITION_LIGHT_FOREST_HUMIDITY, CONDITION_HEAVY_FOREST_HUMIDITY))
            this.setTile(vector, "FOREST_LIGHT");
        else if (between(hum, CONDITION_HEAVY_FOREST_HUMIDITY, CONDITION_SWAMP_HUMIDITY))
            this.setTile(vector, "FOREST_HEAVY");
        else if (between(hum, CONDITION_SWAMP_HUMIDITY, CONDITION_MARSH_HUMIDITY_LAND))
            this.setTile(vector, "SWAMP");
        else if (between(hum, CONDITION_MARSH_HUMIDITY_LAND, MAX_HEIGHT))
            this.setTile(vector, "MARSH");
        else
            this.setTile(vector, "PLAINS");
    }
    if (between(elev, CONDITION_MOUNTAIN_ELEVATION, CONDITION_MOUNTAIN_STOP_ELEVATION)) this.setTile(vector, "MOUNTAINS");

    if (this.isEdge(vector)) this.setTile(vector, "SEA");
};

HexMap.prototype.generateIsland = function () {

    // Ορίζω τον generator θορύβου.
    let gen = new SimplexNoise();

    // Αρχικοποίηση των πινάκων humidity και elevation.
    let elevation = zeroes(this.width, this.height);
    let humidity = zeroes(this.width, this.height);

    // Για κάθε στοιχείο των πινάκων...
    for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {

            // Οι συντεταγμένες (i, j) συρρικνωμένες σε ένα τετράγωνο 1x1 με κέντρο το (0,0), για να εισαχθούν στον generator.
            let nx = i / this.width - 0.5, ny = j / this.height - 0.5;

            // Μεταφορά της αρχής αξόνων από την πάνω αριστερά γωνία στο κέντρο του χάρτη.
            let x = i - this.width / 2, y = this.height / 2 - j;

            // Εδώ υπολογίζεται η DC συνιστώσα του elevation, F(x,y) = exp[-((Ax/R)^2 + Ay^2)] - A^2(Sqrt((x/R)^2 + y^2)
            let dc_coefficient_elevation = Math.exp(-(Math.pow(DC_COEFFICIENT_STRETCH_FACTOR * x / SCREEN_RATIO, 2) + Math.pow(DC_COEFFICIENT_STRETCH_FACTOR * y, 2)))
                - Math.pow(DC_COEFFICIENT_STRETCH_FACTOR, 2) * Math.sqrt(((x * x) / (SCREEN_RATIO * SCREEN_RATIO)) + y * y);

            // Υπολογίζεται το elevation με βάση 2 αρμονικές θορύβου, την DC συνιστώσα και το όλο άθροισμα υψώνεται στην ELEVATION_EXPONENT
            elevation[i][j] = (
                Math.pow(
                    ELEVATION_FIRST_HARMONIC_AMP * (gen.noise2D(ELEVATION_FIRST_HARMONIC_FREQ * nx, ELEVATION_FIRST_HARMONIC_FREQ * ny) / 2 + 0.5)
                    + ELEVATION_SECOND_HARMONIC_AMP * (gen.noise2D(ELEVATION_SECOND_HARMONIC_FREQ * nx, ELEVATION_SECOND_HARMONIC_FREQ * ny) / 2 + 0.5)
                    + DC_COEFFICIENT_SCALE_FACTOR * dc_coefficient_elevation, ELEVATION_EXPONENT)
            );

            // Υπολογίζεται το humidity με βάση 3 αρμονικές θορύβου.
            humidity[i][j] = (
                HUMIDITY_FIRST_HARMONIC_AMP * gen.noise2D(HUMIDITY_FIRST_HARMONIC_FREQ * nx, HUMIDITY_FIRST_HARMONIC_FREQ * ny) / 2 + 0.5
                + HUMIDITY_SECOND_HARMONIC_AMP * gen.noise2D(HUMIDITY_SECOND_HARMONIC_FREQ * nx, HUMIDITY_SECOND_HARMONIC_FREQ * ny) / 2 + 0.5
                + HUMIDITY_THIRD_HARMONIC_AMP * gen.noise2D(HUMIDITY_THIRD_HARMONIC_FREQ * nx, HUMIDITY_THIRD_HARMONIC_FREQ * ny) / 2 + 0.5
            );

            // Με βάση το humidity και το elevation καθορίζεται το είδος του tile.
            this.assignTileType(new Vector(i, j), elevation[i][j], humidity[i][j]);
        }
    }
};
