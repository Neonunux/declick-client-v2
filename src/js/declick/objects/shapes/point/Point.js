import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Shape from '@/objects/shapes/shape/Shape'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Point, inherited from Shape.
 * @exports Point
 */
class Point extends Shape {
    constructor(x, y) {
        super()
        if (arguments.length === 2) {
            this._setLocation(x, y)
        }
    }
}

Point.prototype.className = 'Point'

const graphics = Point.prototype.graphics

Point.prototype.gClass = graphics.addClass('TShape', 'TPoint', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps)
    },
    draw(ctx) {
        const p = this.p
        ctx.beginPath()
        ctx.moveTo(-3, -3)
        ctx.lineTo(3, 3)
        ctx.moveTo(-3, 3)
        ctx.lineTo(3, -3)
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.width
        ctx.stroke()
    }
})

export default Point
