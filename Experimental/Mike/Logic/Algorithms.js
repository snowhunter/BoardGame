// This function passed my normal distribution test
// It works very strangely so if you need help understanding the intuition ask Mike

function randGaussian (mean, deviation) {

    // The only purpose of these 3 lines is to get two (2) random numbers between 0 exclusive and 1 exclusive.
    // The loops might look bad but it's VERY unlikely we'll get more than 1 iteration.
    let x1 = 0, x2 = 0;
    while (x1 === 0) x1 = Math.random();
    while (x2 === 0) x2 = Math.random();

    // Polar mapping to a pseudo-gaussian distribution
    return deviation * Math.sqrt( - 2.0 * Math.log(x1)) * Math.cos(2.0 * Math.PI * x2) + mean;
}

//function that checks uniqueness of array elements based on a function key.
function uniqBy(array, key) {
    let seen = {};
    return array.filter(function(item) {
        let k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
}

// Shuffles an array
function shuffle (array) {
    for (let i = array.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [array[i - 1], array[j]] = [array[j], array[i - 1]];
    }
}

function between (val, lim1, lim2) {
    let sign = lim1 > lim2;
    switch (sign) {
        case true: return (val <= lim1) && (val >= lim2);
        case false: return (val >= lim1) && (val <= lim2);
    }
}

function zeroes (width, height) {
    let zero = [];
    for (let i = 0; i < width; i++) {
        zero[i] = [];
        for (let j = 0; j < height; j++)
            zero[i][j] = 0.0;
    }
    return zero;
}

function dec2hex (dec) {
    return Number(parseInt(dec, 10)).toString(16);
}

function pad (h) {
    if(h.length === 1) return "0" + h;
    else return h;
}

function normNoise (gen, xin, yin, freq=1, amp=1) {
    return (amp * gen.noise2D(freq * xin, freq * yin) / 2) + (amp / 2);
}