import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines Text, inherited from TGraphicalObject.
 * Creates a text given in parameter to be drawn.
 * @param {String} label
 * @exports Text
 */
class Text extends TGraphicalObject {
    constructor(label) {
        super()
        if (TUtils.checkString(label)) {
            this._setText(label)
        }
        this.gObject.initialized()
    }

    /**
     * Set a new Text. Don't draw it.
     * @param {String} label
     */
    _setText(label) {
        label = TUtils.getString(label)
        const gObject = this.gObject
        gObject.p.label = label
        gObject.updateSize()
    }

    /**
     * Set Text Size to "size".
     * @param {Number} size
     */
    _setTextSize(size) {
        size = TUtils.getInteger(size)
        const gObject = this.gObject
        gObject.p.textSize = size
        gObject.updateSize()
    }

    /**
     * Set Text Color.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    _setColor(red, green, blue) {
        const color = TUtils.getColor(red, green, blue)
        const gObject = this.gObject
        gObject.p.textColor = `rgb(${color[0]},${color[1]},${color[2]})`
    }

    _setFont(font) {
        this.gObject.p.textFont = TUtils.getString(font)
    }
}

Text.prototype.className = 'Text'

const graphics = Text.prototype.graphics

Text.prototype.gClass = graphics.addClass('TGraphicalObject', 'TText', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            textColor: '#000000',
            w: 0,
            h: 0,
            label: '',
            textSize: 12,
            textFont: 'Verdana',
            type: TGraphicalObject.TYPE_INACTIVE
        }, props), defaultProps)
    },
    updateSize() {
        const oldH = this.p.h
        const oldW = this.p.w
        const context = graphics.getContext()
        try {
            context.font = `normal ${this.p.textSize}px ${this.p.textFont}`
            this.p.h = this.p.textSize
            this.p.w = context.measureText(this.p.label).width
            this.p.x += this.p.w / 2 - oldW / 2
            this.p.y += this.p.h / 2 - oldH / 2
        } catch (e) {
            // Firefox may throw NS_ERROR_FAILURE in case iframe is hidden: fallback
            this.p.h = this.p.textSize
            // use fixed width for glyphs
            this.p.w = (this.p.textSize / 1.5) * this.p.label.length
            this.p.x += this.p.w / 2 - oldW / 2
            this.p.y += this.p.h / 2 - oldH / 2
        }
        graphics.objectResized(this)
    },
    draw(context) {
        context.fillStyle = this.p.textColor
        context.textBaseline = 'middle'
        context.font = `normal ${this.p.textSize}px ${this.p.textFont}`
        context.fillText(this.p.label, -this.p.w / 2, 0)
    }
})

export default Text
