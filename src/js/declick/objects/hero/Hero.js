import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Character from '@/objects/character/Character'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Hero, inherited from Character.
 * It has predefined appearances, is animated when it moves,
 * can walk in a Scene and catch objects.
 * @param {String} name Hero's name
 * @exports Hero
 */
var Hero = function (name) {
    Character.call(this)
    if (typeof (name) === 'undefined') {
        name = 'tangy'
    }
    this._setAspect(name)
}

Hero.prototype = Object.create(Character.prototype)
Hero.prototype.constructor = Hero
Hero.prototype.className = 'Hero'

var graphics = Hero.prototype.graphics

export default Hero
