import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Polygon from '@/objects/shapes/polygon/Polygon'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Triangle, inherited from Polygon.
 * @exports Triangle
 */
var Triangle = function (p1, p2, p3) {
    Polygon.call(this, p1, p2, p3)
}

Triangle.prototype = Object.create(Polygon.prototype)
Triangle.prototype.constructor = Triangle
Triangle.prototype.className = 'Triangle'

var graphics = Triangle.prototype.graphics

Triangle.prototype.gClass = graphics.addClass('TPolygon', 'TTriangle', {
    init: function (props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps)
    },
    setVertices: function (value) {
        this.p.vertices = []
        if (value.length === 3) {
            for (var i = 0; i < value.length; i++) {
                this.p.vertices.push(value[i])
            }
            this.p.initVertices = true
        } else {
            throw new Error(this.getMessage('Bad vertices'))
        }
    }
})

export default Triangle
