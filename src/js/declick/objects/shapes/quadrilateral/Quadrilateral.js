import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Polygon from '@/objects/shapes/polygon/Polygon'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Quadrilateral, inherited from Polygon.
 * @exports Quadrilateral
 */
var Quadrilateral = function (p1, p2, p3, p4) {
    Polygon.call(this, p1, p2, p3, p4);
};

Quadrilateral.prototype = Object.create(Polygon.prototype);
Quadrilateral.prototype.constructor = Quadrilateral;
Quadrilateral.prototype.className = "Quadrilateral";

var graphics = Quadrilateral.prototype.graphics;

Quadrilateral.prototype.gClass = graphics.addClass("TPolygon", "TQuadrilateral", {
    init: function (props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps);
    },
    setVertices: function (value) {
        this.p.vertices = [];
        if (value.length === 4) {
            for (var i = 0; i < value.length; i++) {
                this.p.vertices.push(value[i]);
            }
            this.p.initVertices = true;
        } else {
            throw new Error(this.getMessage("Bad vertices"));
        }
    }
});

export default Quadrilateral
