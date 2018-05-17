import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'
import TUtils from '@/utils/TUtils'

/**
 * Defines Random, inherited from TObject.
 * Its purpose is to send random numbers in a limited interval.
 * @exports Random
 */
var Random = function() {
    TObject.call(this);
};

Random.prototype = Object.create(TObject.prototype);
Random.prototype.constructor = Random;
Random.prototype.className = "Random";

/**
 * Return a random number between 1 and max.
 * @param {Number} max
 * @returns {Number}
 */
Random.prototype._throwDice = function(max) {
    return Math.floor((Math.random() * max) + 1);
};

export default Random
