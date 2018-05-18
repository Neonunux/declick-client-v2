import $ from 'jquery'

import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'

/**
 * Defines Screen, inherited from TObject.
 * Screen is an object created automatically with the launch of Screen.
 * It allows several interactions.
 * @exports Screen
 */
class Screen extends TObject {
 constructor() {
     this.w = window
     this.d = document
     this.e = this.d.documentElement
     this.g = this.d.getElementsByTagName('body')[0]
 }

 /**
  * Get screen Height "value" in logs.
  * @param {String} value
  */
 _getHeight() {
     return this.w.innerHeight || this.e.clientHeight || this.g.clientHeight
 }

 /**
  * Get screen Width "value" in logs.
  * @param {String} value
  */
 _getWidth() {
     return this.w.innerWidth || this.e.clientWidth || this.g.clientWidth
 }

 /**
  * Clear all graphical objects.
  * @param {String} value
  */
 _clear() {
     TRuntime.clearGraphics()
 }
}

Screen.prototype.className = 'Screen'

const screenInstance = new Screen()

export default screenInstance
