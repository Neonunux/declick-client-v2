import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Text from '@/objects/text/Text'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Stopwatch, inherited from Text.
 * @exports Stopwatch
 */
class Stopwatch extends Text {
    constructor() {
        super()
        if (TUtils.checkString()) {
            this._setText()
        }
        this.gObject.initialized()
    }

    /**
     * (Re)Start Stopwatch.
     */
    _start() {
        this.gObject.p.time = 0
        this.gObject.p.pause = false
    }

    /**
     * (Un)Pause Stopwatch.
     * @param {Boolean} value
     */
    _pause(value) {
        this.gObject.p.pause = value
    }
}

Stopwatch.prototype.className = 'Stopwatch'

const graphics = Stopwatch.prototype.graphics

Stopwatch.prototype.gClass = graphics.addClass('TText', 'TStopwatch', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            oldTime: Date.now(),
            pause: true,
            time: 0
        }, props), defaultProps)
    },
    updateSize() {
        const oldH = this.p.h
        const oldW = this.p.w
        const context = graphics.getContext()
        context.font = `normal ${this.p.textSize}px Verdana,Sans-serif`
        this.p.h = this.p.textSize
        this.p.w = context.measureText(this.p.label).width
        this.p.x += this.p.w / 2 - oldW / 2
        this.p.y += this.p.h / 2 - oldH / 2
        graphics.objectResized(this)
    },
    draw(context) {
        context.fillStyle = this.p.textColor
        context.textBaseline = 'middle'
        context.font = `normal ${this.p.textSize}px Verdana,Sans-serif`
        context.fillText(this.p.label, -this.p.w / 2, 0)
    },
    step() {
        if (!this.p.pause){
            this.p.time += Date.now() - this.p.oldTime
        }
        this.p.oldTime = Date.now()
        this.p.label = `${Math.trunc(this.p.time / 60000)}:${Math.trunc(this.p.time % 60000 / 1000)}:${Math.trunc(this.p.time % 1000 / 10)}`
        this.updateSize()
    }
})

export default Stopwatch
