/**
 * Generates a new array using the given populator function
 * 
 * @param {number} size The size of the array
 * @param {(i: number) => *} populator The populator function used for the array, defaults to the array index
 */
const generate = (size, populator = i => i) => {
    if (size < 0) {
        throw new Error('size must be no less than 0');
    }

    const arr = new Array(size);
    for (let i = 0; i < size; i++) {
        arr[i] = populator(i);
    }
    return arr;
};

/**
 * Generates a new 2-dimensional array
 * 
 * @param {number} width The width of the array
 * @param {number} height The height of the array
 * @param {any} defaultValue The default value to use
 * @returns {any[][]} A 2D array populated with the given default value
 */
const make2DArray = (width, height, defaultValue) => generate(height, () => generate(width, () => defaultValue));

/**
 * Clones an array by dereferencing all elements
 * @param {any[][]} array The array to clone
 */
const clone2D = array => array.map(sub => sub.slice(0));

/**
 * Checks to see if any elements in two arrays match
 * @param {any[]} array The array to check
 */
const equals = (a, b) => {
    if (typeof a !== typeof b) {
        return false;
    }

    if (a === b) {
        return true;
    }

    if (a instanceof Array && b instanceof Array) {
        if (a.every((value, index) => equals(value, b[index]))) {
            return true;
        }
    }

    return false;
};

module.exports = { generate, make2DArray, clone2D, equals };