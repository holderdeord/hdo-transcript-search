module.exports = function (array, size) {
    var results = [];

    while (array.length) {
        results.push(array.splice(0, size));
    }
    return results;
};
