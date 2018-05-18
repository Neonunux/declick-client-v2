import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines Button, inherited from TGraphicalObject.
 * User can click on button and trigger an associated command.
 * @param {String} label    Text displayed on the button
 * @exports Button
 */
class Button extends TGraphicalObject {
    constructor(label) {
        super()
        if (TUtils.checkString(label)) {
            this._setText(label)
        }
        this.gObject.initialized()
    }

    /**
     * Set a label for Button.
     * @param {String} label    Label to be displayed
     */
    _setText(label) {
        label = TUtils.getString(label)
        const gObject = this.gObject
        gObject.p.label = label
        gObject.updateSize()
    }

    /**
     * Set a Label Size.
     * @param {Number} size
     */
    _setTextSize(size) {
        size = TUtils.getInteger(size)
        const gObject = this.gObject
        gObject.p.textSize = size
        gObject.updateSize()
    }

    /**
     * Fill Button with a color given in parameter.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    _setColor(red, green, blue) {
        const color = TUtils.getColor(red, green, blue)
        let r
        let g
        let b
        let ra
        let ga
        let ba
        r = color[0]
        g = color[1]
        b = color[2]
        ra = Math.max(r - 40, 0)
        ga = Math.max(g - 40, 0)
        ba = Math.max(b - 40, 0)
        const gObject = this.gObject
        gObject.p.fillColor = `rgb(${r},${g},${b})`
        gObject.p.fillColorActive = `rgb(${ra},${ga},${ba})`
        gObject.p.strokeColor = `rgb(${ra},${ga},${ba})`
        gObject.p.strokeColorActive = `rgb(${ra},${ga},${ba})`
    }

    /**
     * Set the Label Color.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    _setTextColor(red, green, blue) {
        const color = TUtils.getColor(red, green, blue)
        const gObject = this.gObject
        gObject.p.textColor = `rgb(${color[0]},${color[1]},${color[2]})`
    }

    /**
     * Associate a command to Button.
     * @param {(string|function}} command to be added
     */
    _addCommand(command) {
        this._ifClick(command)
    }

    /**
     * Remove all commands associated to button.
     */
    _removeCommands() {
        this._removeClickCommands()
    }
}

Button.prototype.className = 'Button'

const graphics = Button.prototype.graphics

Button.prototype.gClass = graphics.addClass('TGraphicalObject', 'TButton', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            fillColor: '#4d8cc2',
            strokeColor: '#0d4c82',
            textColor: '#ffffff',
            fillColorActive: '#3276b1',
            strokeColorActive: '#0d4c82',
            textColorActive: '#ffffff',
            w: 50,
            h: 24,
            active: false,
            label: '',
            textSize: 12,
            radius: 7,
            executed: false,
            type: TGraphicalObject.TYPE_INPUT
        }, props), defaultProps)
    },
    updateSize() {
        const oldH = this.p.h
        const oldW = this.p.w
        const context = graphics.getContext()
        context.font = `normal ${this.p.textSize}px Verdana,Sans-serif`
        this.p.h = 2 * this.p.textSize
        this.p.w = context.measureText(this.p.label).width + 2 * this.p.textSize
        this.p.x += this.p.w / 2 - oldW / 2
        this.p.y += this.p.h / 2 - oldH / 2
        graphics.objectResized(this)
    },
    draw(context) {
        // draw path
        context.beginPath()
        context.moveTo(-this.p.w / 2, 0)
        context.lineTo(-this.p.w / 2, -this.p.h / 2 + this.p.radius)
        context.arcTo(-this.p.w / 2, -this.p.h / 2, -this.p.w / 2 + this.p.radius, -this.p.h / 2, this.p.radius)
        context.lineTo(this.p.w / 2 - this.p.radius, -this.p.h / 2)
        context.arcTo(this.p.w / 2, -this.p.h / 2, this.p.w / 2, -this.p.h / 2 + this.p.radius, this.p.radius)
        context.lineTo(this.p.w / 2, this.p.h / 2 - this.p.radius)
        context.arcTo(this.p.w / 2, this.p.h / 2, this.p.w / 2 - this.p.radius, this.p.h / 2, this.p.radius)
        context.lineTo(-this.p.w / 2 + this.p.radius, this.p.h / 2)
        context.arcTo(-this.p.w / 2, this.p.h / 2, -this.p.w / 2, this.p.h / 2 - this.p.radius, this.p.radius)
        context.lineTo(-this.p.w / 2, 0)
        context.closePath()

        // fill button
        if (this.p.active)
            context.fillStyle = this.p.fillColorActive
        else
            context.fillStyle = this.p.fillColor
        context.fill()

        // stroke button
        context.lineWidth = 1
        if (this.p.active)
            context.strokeStyle = this.p.strokeColorActive
        else
            context.strokeStyle = this.p.strokeColor
        context.stroke()

        // draw text
        if (this.p.active)
            context.fillStyle = this.p.textColorActive
        else
            context.fillStyle = this.p.textColor
        context.textBaseline = 'middle'
        context.font = `normal ${this.p.textSize}px Verdana,Sans-serif`
        context.fillText(this.p.label, -this.p.w / 2 + this.p.textSize, 0)

    },
    touch(touch) {
        if (!this.p.designMode) {
            this.p.active = true
            this._super(touch)
        }
    },
    touchEnd(touch) {
        if (!this.p.designMode) {
            this.p.active = false
            this._super(touch)
        }
    },
    addCommand(command) {
        this.commands.addCommand(command)
    },
    executeCommands() {
        this.commands.executeCommands()
    },
    removeCommands() {
        this.commands.removeCommands()
    }
})

//TEnvironment.internationalize(Button, true);

export default Button
