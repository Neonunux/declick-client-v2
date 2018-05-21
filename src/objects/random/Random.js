import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'
import TUtils from '@/utils/TUtils'

/**
 * Defines Random, inherited from TObject.
 * Its purpose is to send random numbers in a limited interval.
 * @exports Random
 */
class Random extends TObject {
 constructor() {
     super()
 }

 /**
  * Return a random number between 1 and max.
  * @param {Number} max
  * @returns {Number}
  */
 _throwDice(max) {
  return Math.floor((Math.random() * max) + 1)
 }
}

Random.prototype.className = 'Random'

export default Random
