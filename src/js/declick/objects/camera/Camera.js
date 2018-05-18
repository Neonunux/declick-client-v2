import $ from 'jquery'

import TUtils from '@/utils/TUtils'
import TRuntime from '@/run/TRuntime'
import TObject from '@/objects/tobject/TObject'

/**
 * Defines Camera, inherited from TObject.
 * Its position will define what will be drawn on screen.
 * It can be fixed, or can follow an Object.
 * @exports Camera
 */
class Camera extends TObject {
    constructor() {
        this.activated = false
        this.followedObject = null
        this.followX = true
        this.followY = true
        TRuntime.addInstance(this)
    }

    /**
     * Activate Camera.
     */
    activate() {
        if (!this.activated) {
            const s = getStage()
            s.add('viewport')
            this.activated = true
        }
    }

    /**
     * Deactivate Camera.
     */
    deactivate() {
        if (this.activated) {
            const s = getStage()
            s.del('viewport')
            this.activated = false
        }
    }

    /**
     * Follow Object in this.followedObject.
     */
    follow() {
        if (this.activated) {
            const s = getStage()
            s.follow(this.followedObject.getGObject(), {x:this.followX, y:this.followY})
        }
    }

    /**
     * Unfollow any Object.
     */
    stopFollow() {
        if (this.activated) {
            const s = getStage()
            s.unfollow()
        }
    }

    /**
     * Activate Camera and follow an object given in parameter.
     * @param {String} object
     */
    _follow(object) {
        object = TUtils.getObject(object)
        this.followedObject = object
        this.activate()
        this.follow()
    }

    /**
     * Unfollow any Object.
     */
    _unfollow() {
        this.stopFollow()
    }

    /**
     * Enable or disable Object tracking on X Coordinate.
     * @param {Boolean} value
     */
    _followX(value) {
        value = TUtils.getBoolean(value)
        this.followX = value
        this.follow()
    }

    /**
     * Enable or disable Object tracking on Y Coordinate.
     * @param {Boolean} value
     */
    _followY(value) {
        value = TUtils.getBoolean(value)
        this.followY = value
        this.follow()
    }

    /**
     * Move the Camera's top-left pixel to coordinates {x,y}.
     * If it follow an Object, unfollow it.
     * @param {Number} x
     * @param {Number} y
     */
    _moveTo(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this.activate()
        const s = getStage()
        this.stopFollow()
        s.moveTo(x,y)
    }

    /**
     * Move the Camera's center pixel to coordinates {x,y}.
     * If it follow an Object, unfollow it.
     * @param {Number} x
     * @param {Number} y
     */
    _centerOn(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this.activate()
        const s = getStage()
        this.stopFollow()
        s.centerOn(x,y)
    }

    clear() {
        this.stopFollow()
        this.deactivate()
    }

    init() {
        
    }
}

Camera.prototype.className = 'Camera'

const getStage = () => TRuntime.getGraphics().getInstance().stage()

const instance = new Camera()

export default instance
