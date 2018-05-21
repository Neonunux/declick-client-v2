import $ from 'jquery'

import Item from '@/objects/item/Item'
import Maze from '@/objects/maze/Maze'
import Robot from '@/objects/robot/Robot'
import TUtils from '@/utils/TUtils'

/**
 * Defines Builder, inherited from Robot.
 * It's a robot which can deposit tiles.
 * @exports Builder
 */
class Builder extends Robot {
    constructor() {
        // build maze before calling constructor in order to have builder drawn over the maze
        this.maze = new Maze()
        this.items = []
        super('builder', false)
    }

    /*
     * Put a tile at given location.
     * If no location given, use current location.
     * @param {Integer} x
     * @param {Integer} y
     */
    _build(tile, x, y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX()
            y = this.gObject.getGridY()
        }
        this.maze._setTileMaze(x, y, tile)
    }

    /*
     * Put a ground at given location
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildGround(x, y) {
        if (typeof x === 'undefined') {
            if (typeof x !== 'undefined') {
                throw this.getMessage('parameter ground')
            }
            x = this.gObject.getGridX()
            y = this.gObject.getGridY()
        }
        this.maze._buildGround(x, y)
    }

    /*
     * Build an entrance at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildEntrance(x, y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX()
            y = this.gObject.getGridY()
        }
        this.maze._buildEntrance(x,y)
    }

    /*
     * Build a door at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildDoor(x, y) {
        this._buildEntrance(x,y)
    }

    /*
     * Build an exit at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildExit(x, y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX()
            y = this.gObject.getGridY()
        }
        this.maze._buildExit(x,y)
    }

    /*
     * Build a wall at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildWall(x, y) {
        if (typeof y === 'undefined') {
            if (typeof x !== 'undefined') {
                throw this.getMessage('parameter wall')
            }
            x = this.gObject.getGridX()
            y = this.gObject.getGridY()
        }
        this.maze._buildWall(x,y)
    }

    /**
     * Set a new tile image. There can be many tiles.
     * Its value in the structure will depend of the moment where it is added :
     * The first time added will have the value "1", the second "2", etc...
     * @param {String} imageName    Image's name used for tiles
     */
    _addTile(imageName) {
        this.maze._addTile(imageName)
    }

    /**
     * Add a new row, starting from Builder's location
     * Builder goes down one tile afterwards, in order to allow several calls
     * @param {String} imageName    Image's name used for tiles
     */
    _addRow(...args) {
        let row
        if (args.length === 1 && TUtils.checkArray(args[0])) {
            row = args[0]
        } else {
            row = args
        }
        this.maze._setRow(this.gObject.getGridX(), this.gObject.getGridY(), row)
        this._moveDownward()
    }

    _getTileCount(number) {
        return this.maze._getTileCount(number)
    }

    /*
     * set flash mode of builder
     */
    _setFlash(value) {
        if (typeof value === 'undefined') {
            value = true
        }
        value = TUtils.getBoolean(value)
        this.gObject.setFlash(value)
    }

    _setTileCollidable(tileNumber, value) {
        if (typeof value === 'undefined') {
            value = true
        }
        tileNumber = TUtils.getInteger(tileNumber)
        value = TUtils.getBoolean(value)
        if (tileNumber < 0 || tileNumber - 1 >= this.maze.getTilesLength()) {
            throw new Error(TUtils.format(this.getMessage('incorrect index')), tileNumber)
        }
        this.maze.setCollidableTile(tileNumber, value)
    }

    _dropItem(type) {
        const item = new Item(type)
        const p = this.gObject.p
        item._setLocation(p.x - p.length / 2, p.y - p.length / 2)
        this.items.push(item)
        // return created object
        return item
    }

    _getMaze() {
        return this.maze
    }

    deleteObject() {
        this.maze.deleteObject()
        this.maze = undefined
        super.deleteObject()
    }
}

Builder.prototype.className = 'Builder'

const graphics = Builder.prototype.graphics

Builder.prototype.gClass = graphics.addClass('TRobot', 'TBuilder', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
        }, props), defaultProps)
    },
    setFlash(value) {
        if (value) {
            this.p.speed = 2000
        } else {
            this.p.speed = 200
        }
    }
})

export default Builder
