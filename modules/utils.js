class Utils {

    static randomFromArray(inputArray) {
        const index = Math.floor(Math.random() * inputArray.length);
        return inputArray[index];
    }
}

module.exports = Utils;