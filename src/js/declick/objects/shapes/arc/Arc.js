import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Shape from '@/objects/shapes/shape/Shape'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Arc, inherited from Shape.
 * @exports Arc
 */
class Arc extends Shape {
    constructor() {
        super()
    }

    /**
     * Set the starting and ending angle of the arc
     * @param {Number} start    degrees
     * @param {Number} end  degrees
     */
    _setAngles(start, end) {
        if (typeof start !== 'undefined' && typeof end !== 'undefined') {
            start = TUtils.getInteger(start)
            end = TUtils.getInteger(end)
            this.gObject.setAngles(start, end)
        }
    }

    /**
     * Set the rayon of Arc.
     * @param {Number} ray
     */
    _setRay(ray) {
        if (typeof ray !== 'undefined') {
            ray = TUtils.getInteger(ray)
            this.gObject.setRay(ray)
        }
    }
}

Arc.prototype.className = 'Arc'

const graphics = Arc.prototype.graphics

Arc.prototype.gClass = graphics.addClass('TShape', 'TArc', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            fill: false,
            tangle: 0,
            tx: 50,
            ty: 50,
            ray: false,
            startingAngle: false,
            endingAngle: false
        }, props), defaultProps)
    },
    setAngles(start, end) {
        this.p.startingAngle = start
        this.p.endingAngle = end
    },
    setRay(ray) {
        this.p.ray = ray
    },
    step(dt) {
        const p = this.p
        p.moving = false
        if (!p.dragging && !p.frozen) {
            const step = p.velocity * dt
            if (p.tx < p.destinationX) {
                p.tx = Math.min(p.tx + step, p.destinationX)
                p.moving = true
            } else if (p.tx > p.destinationX) {
                p.tx = Math.max(p.tx - step, p.destinationX)
                p.moving = true
            }
            if (p.ty < p.destinationY) {
                p.ty = Math.min(p.ty + step, p.destinationY)
                p.moving = true
            } else if (p.ty > p.destinationY) {
                p.ty = Math.max(p.ty - step, p.destinationY)
                p.moving = true
            }
        }
        this.checkCollisions()
    },
    rotate(angle) {
        this.perform(function(angle) {
            this.p.tangle = this.p.tangle + angle
        }, [angle])
    },
    draw(ctx) {
        const p = this.p
        if (p.ray !== false && p.startingAngle !== false) {
            ctx.beginPath()
            ctx.translate(p.tx, p.ty)
            ctx.rotate(p.tangle / 180 * Math.PI)
            ctx.arc(0, 0, p.ray, p.startingAngle / 180 * Math.PI, p.endingAngle / 180 * Math.PI)
            if (this.p.fill) {
                ctx.closePath()
                ctx.fillStyle = p.fillColor
                ctx.fill()
            }
            ctx.strokeStyle = p.color
            ctx.lineWidth = p.width
            ctx.stroke()
            
        }
    }
})

export default Arc
