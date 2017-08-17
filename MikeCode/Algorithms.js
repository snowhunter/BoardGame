/**
 * Created by Snowhunter (Boulasikis Michail) on 14/8/2017.
 */

var NORM_VECTORS_POLAR = [
    [1, 0],
    [1, Math.PI / 4],
    [1, 3 * Math.PI / 4],
    [1, Math.PI],
    [1, -Math.PI / 4],
    [1, -3 * Math.PI / 4]
];

// MORE EFFICIENT SOLUTION NEEDED
// This function passed my normal distribution test
// It works very strangely so if you need help understanding the intuition ask Mike

function randGaussian (mean, deviation) {

    // The only purpose of these 3 lines is to get two (2) random numbers between 0 exclusive and 1 exclusive.
    // The loops might look bad but it's VERY unlikely we'll get more than 1 iteration.
    var x1 = 0, x2 = 0;
    while (x1 === 0) x1 = Math.random();
    while (x2 === 0) x2 = Math.random();

    // Polar mapping to a pseudo-gaussian distribution
    return deviation * Math.sqrt( - 2.0 * Math.log(x1)) * Math.cos(2.0 * Math.PI * x2) + mean;
}

function vectorMagnitude (vector) {
    return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
}

// Moves a point according to the flow of a vector field - the intensity of the vector does not matter, just the direction.
function incrementPoint (point, vector) {
    var magn = vectorMagnitude(vector);
    return [Math.round(point[0] + ( vector[0] / magn ) * 2), Math.round(point[1] + (vector[1] / magn) * 2)];
}

function vectorToPolar (vector) {
    return [vectorMagnitude(vector), Math.atan2(vector[1], vector[0])];
}

function vectorToRect (vector) {
    return [vector[0]*Math.cos(vector[1]), vector[0]*Math.sin(vector[1])];
}
