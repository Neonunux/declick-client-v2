import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Point from '@/objects/shapes/point/Point'
import Quadrilateral from '@/objects/shapes/quadrilateral/Quadrilateral'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Parallelogram, inherited from Quadrilateral.
 * @exports Parallelogram
 */
class Parallelogram extends Quadrilateral {
    constructor(p1, p2, p3) {
        super(p1, p2, p3, false)
    }
}

Parallelogram.prototype.className = 'Parallelogram'

const graphics = Parallelogram.prototype.graphics

Parallelogram.prototype.gClass = graphics.addClass('TQuadrilateral', 'TParallelogram', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps)
    },
    setVertices(value) {
        this.p.vertices = []
        if (value.length === 3 || (value.length === 4 && value[3] === false)) {
            for (let i = 0; i < 3; i++) {
                this.p.vertices.push(value[i])
            }
            this.p.vertices.push(this.addPointParallelogram(value))
            this.p.initVertices = true
        } else {
            throw new Error(this.getMessage('Bad vertices'))
        }
    },
    addPointParallelogram(value) {
        const point = new Point()
        point._hide()
        point._setLocation(value[0].gObject.p.x - value[1].gObject.p.x + value[2].gObject.p.x,
                           value[0].gObject.p.y - value[1].gObject.p.y + value[2].gObject.p.y)
        return point
    }
})

export default Parallelogram
