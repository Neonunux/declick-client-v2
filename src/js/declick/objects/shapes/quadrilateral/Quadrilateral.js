import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Polygon from '@/objects/shapes/polygon/Polygon'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Quadrilateral, inherited from Polygon.
 * @exports Quadrilateral
 */
class Quadrilateral extends Polygon {
    constructor(p1, p2, p3, p4) {
        super(p1, p2, p3, p4)
    }
}

Quadrilateral.prototype.className = 'Quadrilateral'

const graphics = Quadrilateral.prototype.graphics

Quadrilateral.prototype.gClass = graphics.addClass('TPolygon', 'TQuadrilateral', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps)
    },
    setVertices(value) {
        this.p.vertices = []
        if (value.length === 4) {
            for (let i = 0; i < value.length; i++) {
                this.p.vertices.push(value[i])
            }
            this.p.initVertices = true
        } else {
            throw new Error(this.getMessage('Bad vertices'))
        }
    }
})

export default Quadrilateral
