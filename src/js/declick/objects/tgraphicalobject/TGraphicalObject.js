import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'
import TUI from '@/ui/TUI'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines TGraphicalObject, inhetired from TObject.
 * It's an object which can be drawn on stage.
 * @exports TGraphicalObject
 */
class TGraphicalObject extends TObject {
    constructor() {
        this.gObject = new this.gClass()
        this.gObject.setTObject(this)
        this._setLocation(0, 0)
        TRuntime.addGraphicalObject(this)
    }

    getGObject() {
        return this.gObject
    }

    /**
     * Remove TGraphicalObject.
     */
    deleteObject() {
        this.gObject.destroy()
        TRuntime.removeGraphicalObject(this)
    }

    /**
     * Enlarge TGraphicalobject on screen.
     * The enlargement will be proportionnal to the parameter given.
     * @param {Number} factor
     */
    _zoomIn(factor) {
        this.gObject.zoomIn(factor)
    }

    /**
     * Narrow TGraphicalobject on screen.
     * The narrowing will be proportionnal to the parameter given.
     * @param {Number} factor
     */
    _zoomOut(factor) {
        this.gObject.zoomOut(factor)
    }

    /**
     * Change the size of TGraphicalObject, regardless on its previous size.
     * The higher "factor" will be, the larger TGraphicalObject will be.
     * @param {Number} factor
     */
    _scale(factor) {
        //TODO: parseFloat
        this.gObject.scale(factor)
    }

    /**
     * Set an angle of rotation for TGraphicalObject, regarless of its previous.
     * @param {Number} angle
     */
    _setAngle(angle) {
        this.gObject.setAngle(angle)
    }

    /**
     * Rotate TGraphicalObject. Add the parameter to its current angle.
     * @param {Number} angle
     */
    _rotate(angle) {
        //TODO: parseFloat
        this.gObject.rotate(angle)
    }

    /**
     * Set the coordinates of TGraphicalObject's center pixel.
     * @param {Number} x
     * @param {Number} y
     */
    _setCenterLocation(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this.gObject.setCenterLocation(x, y)
    }

    /**
     * Set the coordinates of TGraphicalObject's top-left pixel.
     * @param {Number} x
     * @param {Number} y
     */
    _setLocation(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this.gObject.setLocation(x, y)
    }

    /**
     * Get the X coordinate of TGraphicalObject's center pixel.
     * @returns {Number}
     */
    _getXCenter() {
        return this.gObject.getXCenter()
    }

    /**
     * Get the Y coordinate of TGraphicalObject's center pixel.
     * @returns {Number}
     */
    _getYCenter() {
        return this.gObject.getYCenter()
    }

    /**
     * Get the X coordinate of TGraphicalObject's top-left pixel.
     * @returns {Number}
     */
    _getX() {
        return this.gObject.getX()
    }

    /**
     * Get the Y coordinate of TGraphicalObject's top-left pixel.
     * @returns {Number}
     */
    _getY() {
        return this.gObject.getY()
    }

    /**
     * Enable or disable Design Mode.
     * In Design Mode, user can handle objects with the mouse and move them.
     * @param {Boolean} value
     */
    setDesignMode(value) {
        const gObject = this.gObject
        if (value) {
            gObject.on('drag', gObject, 'designDrag')
            gObject.on('touchEnd', gObject, 'designTouchEnd')
            for (var i = 0; i < gObject.children.length; i++) {
                gObject.children[i].on('drag', gObject, 'designDrag')
                gObject.children[i].on('touchEnd', gObject, 'designTouchEnd')
            }
            const self = this
            gObject.p.designCallback = (x, y) => {
                TUI.recordObjectLocation(self, {x: Math.round(x), y: Math.round(y)})
            }
            gObject.p.designMode = true
        } else {
            gObject.off('drag', gObject, 'designDrag')
            gObject.off('touchEnd', gObject, 'designTouchEnd')
            for (var i = 0; i < gObject.children.length; i++) {
                gObject.children[i].off('drag', gObject, 'designDrag')
                gObject.children[i].off('touchEnd', gObject, 'designTouchEnd')
            }
            gObject.p.designCallback = null
            gObject.p.designMode = false
        }
    }

    /**
     * Freeze or unfreeze TGraphicalObject.
     * @param {Boolean} value
     */
    freeze(value) {
        this.gObject.freeze(value)
    }

    /**
     * Get a String containing "TGraphicalObject " and the class of the object.
     * @returns {String}
     */
    toString() {
        return `TGraphicalObject ${this.className}`
    }

    /**
     * Hide TGraphicalObject.
     */
    _hide() {
        this.gObject.p.hidden = true
    }

    /**
     * Show TGraphicalObject.
     */
    _show() {
        this.gObject.p.hidden = false
    }

    /**
     * Add command that will be executed when object is clicked.
     * @param {(string|function}} command to be added
     */
    _ifClick(command) {
        command = TUtils.getCommand(command)
        this.gObject.addClickCommand(command)
    }

    /**
     * Remove all commands associated to click.
     */
    _removeClickCommands() {
        this.gObject.removeClickCommands()
    }

    /**
     * GetWidth TGraphicalObject.
     */
    _getWidth() {
        return this.gObject.getWidth()
    }

    /**
     * GetHeight TGraphicalObject.
     */
    _getHeight() {
        return this.gObject.getHeight()
    }
}

TGraphicalObject.prototype.className = 'TGraphicalObject'
TGraphicalObject.prototype.objectPath = 'tgraphicalobject'


TGraphicalObject.TYPE_SPRITE = 0x0001
TGraphicalObject.TYPE_WALKER = 0x0002
TGraphicalObject.TYPE_HUMAN = 0x0004
TGraphicalObject.TYPE_TURTLE = 0x0008
TGraphicalObject.TYPE_BLOCK = 0x0010
TGraphicalObject.TYPE_PLATFORM = 0x0020
TGraphicalObject.TYPE_ITEM = 0x0040
TGraphicalObject.TYPE_CATCHABLE = 0x0080
TGraphicalObject.TYPE_SHAPE = 0x0100
TGraphicalObject.TYPE_INPUT = 0x0200
TGraphicalObject.TYPE_INACTIVE = 0x0400

const graphics = TRuntime.getGraphics()

TGraphicalObject.prototype.graphics = graphics

TGraphicalObject.prototype.gClass = graphics.addClass('TGraphicalObject', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            designMode: false,
            initialized: false,
            w: 0,
            h: 0,
            clickHandled: false
        }, props), defaultProps)
        this.operations = new Array()
        this.clickCommands = new CommandManager()
        this.initialized(false)
        this.tOject = null
    },
    designDrag({origX, dx, origY, dy}) {
        if (this.p.designMode) {
            this.p.dragging = true
            this.p.x = origX + dx
            this.p.y = origY + dy
        }
    },
    designTouchEnd(touch) {
        if (this.p.designMode) {
            this.p.dragging = false
            this.p.designCallback(this.p.x - this.p.w / 2, this.p.y - this.p.h / 2)
        }
    },
    perform(action, parameters) {
        if (this.p.initialized) {
            action.apply(this, parameters)
        } else {
            this.operations.push([action, parameters])
        }
    },
    initialized(value) {
        if (typeof value === 'undefined') {
            value = true
        }
        this.p.initialized = value
        if (value) {
            this.step = this.constructor.prototype.step
            this.draw = this.constructor.prototype.draw
            while (this.operations.length > 0) {
                const operation = this.operations.shift()
                operation[0].apply(this, operation[1])
            }
        } else {
            this.step = () => {}
            this.draw = () => {}
        }
        return value
    },
    scale(scale) {
        this.perform(function (scale) {
            this.p.scale = scale * 1
        }, [scale])
    },
    zoomIn(scale) {
        this.perform(function (scale) {
            if (typeof this.p.scale === 'undefined') {
                this.p.scale = 1
            }
            this.p.scale = scale + this.p.scale
        }, [scale])
    },
    zoomOut(scale) {
        this.perform(function (scale) {
            if (typeof this.p.scale === 'undefined') {
                this.p.scale = 1
            }
            this.p.scale = -scale + this.p.scale
        }, [scale])
    },
    setAngle(angle) {
        this.perform(function (angle) {
            this.p.angle = angle
        }, [angle])
    },
    rotate(angle) {
        this.perform(function (angle) {
            this.p.angle = this.p.angle + angle
        }, [angle])
    },
    setLocation(x, y) {
        this.perform(function (x, y) {
            this.p.x = x + this.p.w / 2
            this.p.y = y + this.p.h / 2
        }, [x, y])
    },
    getLocation() {
        return {x: Math.round(this.p.x - this.p.w / 2), y: Math.round(this.p.y - this.p.h / 2)}
    },
    getXCenter() {
        return Math.round(this.p.x)
    },
    getYCenter() {
        return Math.round(this.p.y)
    },
    getX() {
        return Math.round(this.p.x - this.p.w / 2)
    },
    getY() {
        return Math.round(this.p.y - this.p.h / 2)
    },
    getWidth() {
        return this.p.w
    },
    getHeight() {
        return this.p.h
    },
    setCenterLocation(x, y) {
        this.perform(function (x, y) {
            this.p.x = x
            this.p.y = y
        }, [x, y])
    },
    freeze(value) {
        // to be implemented by subclasses
    },
    touch({x, y}) {
        if (!this.p.designMode && !this.p.clickHandled) {
            this.clickCommands.executeCommands({x:x, y:y})
            this.p.clickHandled = true
        }
    },
    touchEnd(event) {
        if (!this.p.designMode) {
            this.p.clickHandled = false
        }
    },
    addClickCommand(command) {
        if (!this.clickCommands.hasCommands()) {
            // need to set touch and touchEnd listeners
            this.on('touch', this, 'touch')
            this.on('touchEnd', this, 'touchEnd')
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].on('touch', this, 'touch')
                this.children[i].on('touchEnd', this, 'touchEnd')
            }
        }
        this.clickCommands.addCommand(command)
    },
    removeClickCommands() {
        this.clickCommands.removeCommands()
        // un-register listeners
        this.off('touch', this, 'touch')
        this.off('touchEnd', this, 'touchEnd')
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].off('touch', this, 'touch')
            this.children[i].off('touchEnd', this, 'touchEnd')
        }
    },
    setTObject(ref) {
        this.tObject = ref
    },
    getTObject() {
        return this.tObject
    }
})

TGraphicalObject.prototype.messages = null

export default TGraphicalObject
