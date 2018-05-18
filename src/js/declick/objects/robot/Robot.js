import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Character from '@/objects/character/Character'
import Maze from '@/objects/maze/Maze'
import Platform from '@/objects/platform/Platform'
import Sprite from '@/objects/sprite/Sprite'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'
import SynchronousManager from '@/utils/SynchronousManager'

/**
 * Defines Robot, inherited from Character.
 * The main difference with Character is that it executes commands one by one.
 * @param {Boolean} auto
 * @exports Robot
 */
class Robot extends Character {
    constructor(name, auto) {
        if (typeof name !== 'undefined') {
            super(name)
        } else {
            super('robot')
        }

        if (typeof auto === 'undefined') {
            auto = true
        }
        this.synchronousManager = new SynchronousManager()
        this.gObject.synchronousManager = this.synchronousManager
        this.exitLocations = false
        if (auto) {
            Platform.register(this)
        }
    }

    // MOVEMENT MANAGEMENT

    /**
     * Move Robot of "number" tiles forward (to the right).
     * If no parameter is given, move it one case forward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    _moveForward(number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number)
        else
            number = 1
        if (number >= 0)
            this.gObject.moveForward(number)
        else
            this.gObject.moveBackward(-number)
    }

    /**
     * Move Robot of "number" tiles backward (to the left).
     * If no parameter is given, move it one case backward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    _moveBackward(number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number)
        else
            number = 1
        if (number >= 0)
            this.gObject.moveBackward(number)
        else
            this.gObject.moveForward(-number)
    }

    /**
     * Move Robot of "number" tiles upward.
     * If no parameter is given, move it one case upward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    _moveUpward(number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number)
        else
            number = 1
        if (number >= 0)
            this.gObject.moveUpward(number)
        else
            this.gObject.moveDownward(-number)
    }

    /**
     * Move Robot of "number" tiles downward.
     * If no parameter is given, move it one case downward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    _moveDownward(number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number)
        else
            number = 1
        if (number >= 0)
            this.gObject.moveDownward(number)
        else
            this.gObject.moveUpward(-number)
    }

    /**
     * Count the number of items in Stage.
     * @returns {Number}
     */
    _countItems() {
        //TODO: handle case where gObject not initialized yet
        return this.gObject.countItems()
    }

    /**
     * Pick up an Item.
     */
    _pickup() {
        try {
            this.gObject.pickup()
        } catch (e) {
            throw this.getMessage(e)
        }
    }

    /**
     * Drop an Item.
     */
    _drop() {
        try {
            this.gObject.drop()
        } catch (e) {
            throw this.getMessage(e)
        }
    }

    /**
     * Count the number of items carried by Robot.
     * @returns {Number}    Number of items carried.
     */
    _countCarriedItems(category) {
        if (typeof category !== 'undefined') {
            category = TUtils.getString(category)
        }
        return this.gObject.countCarriedItems(category)
    }

    /**
     * Returns gridX.
     * @returns {Integer}
     */
    _getGridX() {
        return (this.gObject.p.gridX)
    }

    /**
     * Returns gridY.
     * @returns {Integer}
     */
    _getGridY() {
        return (this.gObject.p.gridY)
    }

    /**
     * Set the coordinates of Robot.
     * @param {Number} x
     * @param {Number} y
     */
    _setLocation(x, y) {
        x = TUtils.getInteger(x) * this.gObject.p.length + this.gObject.p.baseX
        y = TUtils.getInteger(y) * this.gObject.p.length + this.gObject.p.baseY
        this.gObject.setLocation(x, y)
    }

    /**
     * Test if Robot was blocked during the last move
     * @param {String} way
     * @returns {Boolean}
     */
    _wasBlocked(way) {
        way = this.getMessage(TUtils.getString(way))
        switch (way) {
            case 'top':
                return this.gObject.wasBlockedTop()
            case 'bottom':
                return this.gObject.wasBlockedBottom()
            case 'left':
                return this.gObject.wasBlockedLeft()
            case 'right':
                return this.gObject.wasBlockedRight()
        }
        return false
    }

    /**
     * Link a platform to the Walker. Walker will not pass through.
     * @param {String} platform
     */
    _addPlatform(platform) {
        super._addPlatform(platform)
        const entrance = platform.getEntranceLocation()
        if (entrance !== false) {
            this.setEntranceLocation(entrance[0], entrance[1])
        }
        const exit = platform.getExitLocations()
        if (exit !== false) {
            this.exitLocations = exit
        }
    }

    removeEntranceLocation() {
        this.gObject.setStartLocation(0, 0)
    }

    setEntranceLocation(x, y) {
        this.gObject.setStartLocation(x, y)
    }

    removeExitLocation(x, y) {
        for (let index = 0; index < this.exitLocations.length; index++) {
            const location = this.exitLocations[index]
            if (location[0] === x && location[1] === y) {
            this.exitLocations.splice(index, 1)
            break
            }
        }
    }

    addExitLocation(x, y) {
        if (this.exitLocations === false) {
            this.exitLocations = []
        }
        this.exitLocations.push([x, y])
    }

    _getItemName() {
        try {
            return this.gObject.getItemName()
        } catch (e) {
            throw this.getMessage(e)
        }
    }

    _isOverExit() {
        if (this.exitLocations !== false) {
            const x = this.gObject.getGridX()
            const y = this.gObject.getGridY()
            for (let i = 0; i < this.exitLocations.length; i++) {
                if (x === this.exitLocations[i][0] && y === this.exitLocations[i][1]) {
                    return true
                }
            }
        }
        return false
    }

    _isOver(name) {
        try {
            const current = this.gObject.getItemName()
            if (name === current) {
                return true
            }
        } catch (e) {}
        return false
    }

    _isOverItem(name) {
        try {
            if (typeof name !== 'undefined')
                return this._isOver(name)
            this.gObject.getItemName()
            return true
        } catch (e) {}
        return false
    }

    _isCarrying(what) {
        if (!(TUtils.checkString(what) || TUtils.checkObject(what))) {
            throw this.getMessage('wrong carrying parameter')
        }
        return this.gObject.isCarrying(what)
    }

    deleteObject() {
        if (typeof this.synchronousManager !== 'undefined') {
            this.synchronousManager.end()
        }
        // remove object from instances list
        Platform.unregister(this)
        super.deleteObject()
    }
}

Robot.prototype.className = 'Robot'

const graphics = Robot.prototype.graphics

Robot.prototype.gClass = graphics.addClass('TCharacter', 'TRobot', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            length: 40,
            inMovement: false,
            encountered: [],
            carriedItems: [],
            gridX: 0,
            gridY: 0,
            baseX: 0,
            baseY: 0,
            x: 0,
            y: 0,
            blocked: [false, false, false, false]
        }, props), defaultProps)
        this.previous = {X: this.p.x, Y: this.p.y}
        this.move = null
        this.falling = false
        this.jumping = false
        this.previousGridX = 0
        this.previousGridY = 0
        this.on('bump.top', 'bumpTop')
        this.on('bump.bottom', 'bumpBottom')
        this.on('bump.left', 'bumpLeft')
        this.on('bump.right', 'bumpRight')
    },
    step(dt) {
        const p = this.p
        const previous = this.previous

        const completed = p.x === p.destinationX && p.y === p.destinationY
        const moved = p.x !== previous.X || p.y !== previous.Y
        const landed = this.falling && completed && !moved

        if (this.jumping && this.p.vy >= 0)
        {
            this.jumping = false
            this.falling = true
            // this.endMove();
        }
        else if (this.move === null && landed)
        {
            // Falling while move is empty means gravity activation.
            // End the current command when the robot stops falling.
            this.updateGridLocation()
            this.endMove()
        }

        else if (this.move !== null)
        {
            // The robot has a move to complete.
            if (completed)
            {
                // The robot has ended a submove.
                this.updateGridLocation()
                if (this.falling)
                {
                    // Stop fall if the robot landed. Else, wait.
                    if (!moved)
                    {
                        this.falling = false
                        this.consumeMove()
                    }
                }
                else if (p.gridX !== this.previousGridX
                      || p.gridY !== this.previousGridY)
                {
                    // The robot is not falling, so check if it finished a
                    // cell move.
                    this.previousGridX = p.gridX
                    this.previousGridY = p.gridY
                    if (p.mayFall)
                    {
                        // If the gravity is enabled, let it try to fall.
                        this.fall()
                    }
                    else
                    {
                        // Else directly load next cell move.
                        this.consumeMove()
                    }
                }
                else
                {
                    // The robot has ended a submove but is not falling
                    // nor changing cell, it must be blocked. End move.
                    this.endMove()
                }
            }
        }

        this.previous = {X: p.x, Y: p.y}

        this._super(dt)
        if (!p.dragging && !p.frozen)
        {
            if (moved)
            {
                this.updateItemsPosition()
            }
        }
    },
    bumpTop({tile}) {
        // check if collided is a ground
        if (typeof tile !== 'undefined' && tile === Platform.GROUND) {
            this.p.skipCollide = true
        }
        this.p.blocked[0] = true
    },
    bumpBottom() {
        this.p.blocked[1] = true
    },
    bumpLeft() {
        this.p.blocked[2] = true
    },
    bumpRight() {
        this.p.blocked[3] = true
    },
    initBumps() {
        this.p.blocked = [false, false, false, false]
    },
    wasBlockedTop() {
        return (this.p.blocked[0])
    },
    wasBlockedBottom() {
        return (this.p.blocked[1])
    },
    wasBlockedLeft() {
        return (this.p.blocked[2])
    },
    wasBlockedRight() {
        return (this.p.blocked[3])
    },
    fall() {
        this.p.vx = 0
        this.falling = true
    },
    jump() {
        if (this.p.mayFall)
        {
            this.synchronousManager.begin()
            this.perform(function ()
            {
                if (this.p.jumpAvailable > 1)
                {
                    this.p.vy = this.p.jumpSpeed
                    this.jumping = true
                }
                else
                {
                    this.synchronousManager.end()
                }
            })
        }
    },
    endMove() {
        this.move = null
        this.falling = false
        this.jumping = false
        this.p.destinationX = this.p.x
        this.p.destinationY = this.p.y
        this.synchronousManager.end()
    },
    consumeMove() {
        const direction = this.move[0]
        const intensity = this.move[1]
        if (intensity === 0)
        {
            this.endMove()
            return
        }
        let XMultiplier = 0
        let YMultiplier = 0
        switch (direction)
        {
            case Sprite.DIRECTION_UP:    YMultiplier = -1; break
            case Sprite.DIRECTION_DOWN:  YMultiplier =  1; break
            case Sprite.DIRECTION_LEFT:  XMultiplier = -1; break
            case Sprite.DIRECTION_RIGHT: XMultiplier =  1; break
        }
        this.p.destinationX = this.p.x + (XMultiplier * this.p.length)
        this.p.destinationY = this.p.y + (YMultiplier * this.p.length)
        this.p.vx = XMultiplier * this.p.speed
        this.p.vy = YMultiplier * this.p.speed
        this.move[1] = intensity - 1
    },
    initializeMove(direction, intensity) {
        this.synchronousManager.begin()
        this.perform(function ()
        {
            this.move = [direction, intensity]
            this.consumeMove()
        }, [])
    },
    moveUpward(intensity) {
        this.initializeMove(Sprite.DIRECTION_UP, intensity)
    },
    moveDownward(intensity) {
        this.initializeMove(Sprite.DIRECTION_DOWN, intensity)
    },
    moveBackward(intensity) {
        this.initializeMove(Sprite.DIRECTION_LEFT, intensity)
    },
    moveForward(intensity) {
        this.initializeMove(Sprite.DIRECTION_RIGHT, intensity)
    },
    updateItemsPosition() {
        const p = this.p
        const x = p.x - p.w / 2
        const y = p.y - p.h / 2
        for (let i = 0; i < p.carriedItems.length; i++)
        {
            const item = p.carriedItems[i]
            item.setLocation(x, y - 4 * i)
        }
    },
    countItems() {
        let skip = 0
        let collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_ITEM, skip)
        let object
        this.p.encountered = []
        while (collided) {
            object = collided.obj
            if (!this.p.carriedItems.includes(object)) {
                this.p.encountered.push(collided.obj)
            }
            skip++
            collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_ITEM, skip)
        }
        return this.p.encountered.length
    },
    pickup() {
        const count = this.countItems()
        if (count === 0) {
            throw 'no item'
        }
        const newItem = this.p.encountered[0]
        this.p.carriedItems.push(newItem)
        newItem.setLocation(this.p.x - this.p.w / 2, this.p.y - this.p.h / 2 - (this.p.carriedItems.length - 1) * 4)
    },
    drop() {
        if (this.p.carriedItems.length === 0) {
            throw 'no carried item'
        }
        this.p.carriedItems = this.p.carriedItems.slice(0, -1)
    },
    countCarriedItems(category) {
        if (typeof category === 'undefined') {
            return this.p.carriedItems.length
        } else {
            let count = 0
            for (let i = 0; i < this.p.carriedItems.length; i++) {
                const object = this.p.carriedItems[i]
                if (object.p.category === category) {
                    count++
                }
            }
            return count
        }
    },
    setLocation(x, y) {
        this._super(x, y)
        this.perform(function () {
            this.updateGridLocation()
        }, [])
    },
    setGridLocation(x, y) {
        this.setLocation(x * this.p.length, y * this.p.length)
    },
    updateGridLocation() {
        this.p.gridX = Math.round(this.getX() / this.p.length)
        this.p.gridY = Math.round(this.getY() / this.p.length)
    },
    setStartLocation(x, y) {
        this.setGridLocation(x, y)
    },
    getItemName() {
        const count = this.countItems()
        if (count === 0) {
            throw 'no item'
        }
        const item = this.p.encountered[0]
        return item.getName()
    },
    getGridX() {
        return this.p.gridX
    },
    getGridY() {
        return this.p.gridY
    },
    mayFall(value) {
        if (typeof value === 'undefined') {
            value = true
        }
        let startFalling = false
        if (!this.p.mayFall && value) {
            // object starts to fall
            startFalling = true
            this.synchronousManager.begin()
        }
        this.perform(function () {
            this.p.mayFall = value
            if (startFalling) {
                this.falling = true
                this.p.inMovement = true
            }
        })
    },
    isCarrying(what) {
        let category = false
        if (TUtils.checkString(what)) {
            category = true
        }
        for (let i = 0; i < this.p.carriedItems.length; i++) {
            const object = this.p.carriedItems[i]
            if (category) {
                if (object.p.category === what) {
                    return true
                }
            } else {
                if (what.getGObject().getId() === object.getId()) {
                    return true
                }
            }
        }
        return false
    }
})

export default Robot
