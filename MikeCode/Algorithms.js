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

//function that checks uniqueness of array elements based on a function key.
function uniqBy(array, key) {
    var seen = {};
    return array.filter(function(item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
}