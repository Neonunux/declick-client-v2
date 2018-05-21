import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Polygon from '@/objects/shapes/polygon/Polygon'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Segment, inherited from Polygon.
 * @exports Segment
 */
class Segment extends Polygon {
    constructor(p1, p2) {
        super(p1, p2)
    }
}

Segment.prototype.className = 'Segment'

const graphics = Segment.prototype.graphics

Segment.prototype.gClass = graphics.addClass('TPolygon', 'TSegment', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps)
    },
    setVertices(value) {
        this.p.vertices = []
        if (value.length === 2) {
            for (let i = 0; i < value.length; i++) {
                this.p.vertices.push(value[i])
            }
            this.p.initVertices = true
        } else {
            throw new Error(this.getMessage('Bad vertices'))
        }
    }
})

export default Segment
