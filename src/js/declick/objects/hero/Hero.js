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
class Hero extends Character {
    constructor(name) {
        super()
        if (typeof (name) === 'undefined') {
            name = 'tangy'
        }
        this._setAspect(name)
    }
}

Hero.prototype.className = 'Hero'

const graphics = Hero.prototype.graphics

export default Hero
