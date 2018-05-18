import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Point from '@/objects/shapes/point/Point'
import Parallelogram from '@/objects/shapes/parallelogram/Parallelogram'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Rectangle, inherited from Parallelogram.
 * @exports Rectangle
 */
class Rectangle extends Parallelogram {
    constructor(p1, p2) {
        super(p1, p2, false)
    }
}

Rectangle.prototype.className = 'Rectangle'

const graphics = Rectangle.prototype.graphics

Rectangle.prototype.gClass = graphics.addClass('TParallelogram', 'TRectangle', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps)
    },
    setVertices(value) {
        this.p.vertices = []
        if (value.length === 2 || (value.length === 4 && value[2] === false)) {
            this.p.vertices.push(value[0])
            this.p.vertices.push(this.addPointRectangle(value))
            this.p.vertices.push(value[1])
            this.p.vertices.push(this.addPointParallelogram(this.p.vertices))
            this.p.initVertices = true
        } else {
            throw new Error(this.getMessage('Bad vertices'))
        }
    },
    addPointRectangle(value) {
        const point = new Point()
        point._hide()
        point._setLocation(value[0].gObject.p.x, value[1].gObject.p.y)
        return point
    }
})

export default Rectangle
