import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Sprite from '@/objects/sprite/Sprite'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Shape, inherited from Sprite.
 * @exports Shape
 */
class Shape extends Sprite {
    constructor() {
        super()
    }

    /**
     * Change the color of the shape.</br>
     * Default value : red | [255, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    _color(red, green, blue) {
        this.gObject.color(red, green, blue)
    }

    /**
     * Set the width of the stroke.
     * Default value : 1.
     * @param {Number} value
     */
    _width(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value)
            this.gObject.width(value)
        }
    }

    /**
     * Enable or disable the fill of the shape.
     * Default value : False.
     * @param {Boolean} value
     */
    _fill(value) {
        if (typeof value !== 'undefined') {
            this.gObject.fill(value)
        }
    }

    /**
     * Change the color of the shape's fill.
     * Default value : marron | [128, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    _fillColor(red, green, blue) {
        this.gObject.fillColor(red, green, blue)
    }
}

Shape.prototype.className = 'Shape'

const graphics = Shape.prototype.graphics

Shape.prototype.gClass = graphics.addClass('TSprite', 'TShape', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            color: '#FF0000',
            width: 1,
            fill: false,
            fillColor: '#800000',
            type: TGraphicalObject.TYPE_SHAPE,
            initialized: false
        }, props), defaultProps)
        this.initialized()
    },
    color(red, green, blue) {
       this.p.color = TUtils.rgbToHex(TUtils.getColor(red, green, blue))
    },
    width(value) {
        this.p.width = value
    },
    fill(value) {
        this.p.fill = value
    },
    fillColor(red, green, blue) {
       this.p.fillColor = TUtils.rgbToHex(TUtils.getColor(red, green, blue))
    }
})

export default Shape
