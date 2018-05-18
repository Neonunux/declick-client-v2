import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Calculator, inherited from TObject.
 * A simple calculator.
 * @exports Calculator
 */
class Calculator extends TObject {
 constructor() {
     super()
 }

 /**
  * Round Number.
  * @param {Number} number
  * @returns {Number}
  */
 _round(number) {
     number = TUtils.getInteger(number)
     return (Math.round(number))
 }

 /**
  * Return Number's cosinus.
  * @param {Number} number
  * @returns {Number}
  */
 _cos(number) {
     number = TUtils.getInteger(number)
     return (Math.cos(number))
 }

 /**
  * Return Number's sinus.
  * @param {Number} number
  * @returns {Number}
  */
 _sin(number) {
     number = TUtils.getInteger(number)
     return (Math.sin(number))
 }

 /**
  * Return Number's tangent.
  * @param {Number} number
  * @returns {Number}
  */
 _tan(number) {
     number = TUtils.getInteger(number)
     return (Math.tan(number))
 }

 /**
  * Return the value of Number to be the power of Pow.
  * @param {Number} number
  * @param {Number} power
  * @returns {Number}
  */
 _pow(number, pow) {
     number = TUtils.getInteger(number)
     pow = TUtils.getInteger(pow)
     return number ** pow
 }

 /**
  * Return the square of Number.
  * @param {Number} number
  * @returns {Number}
  */
 _square(number) {
     number = TUtils.getInteger(number)
     return number ** 2
 }

 /**
  * Return the cube of Number.
  * @param {Number} number
  * @returns {Number}
  */
 _cube(number) {
     number = TUtils.getInteger(number)
     return number ** 3
 }

 /**
  * Return the square root of Number.
  * @param {Number} number
  * @returns {Number}
  */
 _sqrt(number) {
     number = TUtils.getInteger(number)
     return (Math.sqrt(number))
 }

 /**
  * Return Pi.
  * @returns {Number}
  */
 _pi() {
  return Math.PI
 }
}

Calculator.prototype.className = 'Calculator'

export default Calculator
