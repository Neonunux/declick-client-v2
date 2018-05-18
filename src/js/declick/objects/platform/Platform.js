import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TRuntime from '@/run/TRuntime'
import ResourceManager from '@/utils/ResourceManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines Platform, inherited from TGraphicalObject.
 * Create a whole Block from a 2D matrix.
 * @exports Platform
 */
class Platform extends TGraphicalObject {
    constructor() {
        this.gObject = new this.gClass()
        this._setLocation(0, 0)
        this.baseTile = ''
        this.tiles = []
        this.rows = []
        this.nbCols = 0
        this.nbRows = 0
        this.resources = new ResourceManager()
        this.built = false
        this.entranceLocation = false
        this.exitLocations = false
        this.counters = [0]
        TRuntime.addGraphicalObject(this, false)
        const g = TRuntime.getGraphics().getInstance()
        g.stage().collisionLayer(this.gObject)
        Platform.instances.push(this)
        for (let i = 0;i < Platform.registered.length;i++) {
            const object = Platform.registered[i]
            object._addPlatform(this)
        }
        this.addTile('wall.png', this.getResource('wall.png'))
        this.addTile('brick.png', this.getResource('brick.png'))
        this.addTile('entrance.png', this.getResource('entrance.png'))
        this.addTile('exit.png', this.getResource('exit.png'))
        this.setCollidableTile(Platform.ENTRANCE, false)
        this.setCollidableTile(Platform.EXIT, false)
        this.hasDefaultSettings = true
    }

    /**
     * Set a new tile image. There can be many tiles.
     * Its value in the structure will depend of the moment where it is added :
     * The first time added will have the value "1", the second "2", etc...
     * @param {String} imageName    Image's name used for tiles
     */
    _addTile(imageName) {
        imageName = TUtils.getString(imageName)
        try {
            this.addTile(imageName, TEnvironment.getProjectResource(imageName))
        } catch (e) {
            throw new Error(this.getMessage('file not found', name))
        }
    }

    /**
     * Set a new tile image. There can be many tiles.
     * Its value in the structure will depend of the moment where it is added :
     * The first time added will have the value "1", the second "2", etc...
     * @param {String} name    name of the image
     * @param {String} path    path to image
     */
    addTile(imageName, imagePath) {
        const self = this
        this.tiles.push(imageName)
        this.counters.push(0)
        this.gObject.addCollidable()
        if (this.resources.has(imageName)) {
            if (this.built) {
                this.buildSheet()
            }
        } else {
            this.resources.add(imageName, imagePath, () => {
                if (self.built) {
                    // build sheet only if object already built
                    self.buildSheet()
                }
            })
        }
    }

    _initialize() {
        this.baseTile = ''
            this.rows = []
            this.nbCols = 0
            this.nbRows = 0
        this.removeEntranceLocation()
        this.removeExitLocations()
            this.counters = [0]
        this.gObject.empty()
            this.tiles = []
        this.built = false
        this.hasDefaultSettings = false
    }

    _setCollidableTile(number, value) {
        this.setCollidableTile(number, value)
    }

    setCollidableTile(number, value) {
        this.gObject.setCollidable(number, value)
    }

    /**
     * Set the background image. There is only one base tile.
     * Its value in the structure is 0.
     * @param {String} imageName    Image's name used for background
     */
    _setBaseTile(imageName) {
        imageName = TUtils.getString(imageName)
        try {
            this.baseTile = imageName
            const asset = TEnvironment.getProjectResource(imageName)
            const self = this
            this.resources.add(imageName, asset, () => {
                self.gObject.drawBaseTile(true)
                if (self.built) {
                    // build sheet only if object already built
                    self.buildSheet()
                }
            })
        } catch (e) {
            throw new Error(this.getMessage('file not found', imageName))
        }
    }

    _addTiles(...args) /* tile, ... */{
        this._addRow.apply(this, args)
    }

    /**
     * Add a new row, at the end of the structure.
     * If the row is too short, it is filled with 0.
     * If the row is too long, it is truncated.
     * @param {Number[]} row
     */
    _addRow(...args) {
        let row
        if (args.length === 1 && TUtils.checkArray(args[0])) {
            row = args[0]
        } else {
            row = args
        }

        if (this.nbCols === 0 && this.nbRows === 0) {
            this.nbCols = row.length
        }
        if (row.length < this.nbCols) {
            // Fill row with 0
            for (let i = row.length; i < this.nbCols; i++) {
                row.push(0)
            }
        } else if (row.length > this.nbCols) {
            // truncate row
            row.splice(this.nbCols, row.length)
        }
        for (let index = 0; index < row.length; index++) {
            this.notifyTileChange(index, this.rows.length, row[index])
        }
        this.rows.push(row)
        // update counters
        for (let j = 0;j < row.length;j++) {
            this.counters[row[j]]++
        }
        this.nbRows++
        this.buildStructure()
    }

    /**
     * Add a new column, at the end of the structure.
     * If the column is too short, it is filled with 0.
     * If the column is too long, it is truncated.
     * @param {Number[]} col
     */
    _addColumn(col) {
        col = TUtils.getArray(col)
        if (this.nbCols === 0 && this.nbRows === 0) {
            this.nbRows = col.length
        }
        for (let i = 0; i < this.nbRows; i++) {
            if (i < col.length) {
        this.notifyTileChange(this.rows[i].length, i, col[i])
                this.rows[i].push(col[i])
                this.counters[col[i]]++
            } else {
        this.notifyTileChange(this.rows[i].length, i, 0)
                this.rows[i].push(0)
                this.counters[0]++
            }
        }
        this.nbCols++
        this.buildStructure()
    }

    /**
     * Create a new structure from a 2D matrix.
     * Each empty tile will be filled with a 0.
     * @param {Number[][]} structure
     */
    _loadStructure(structure) {
        const newRows = []
        let i
        if (TUtils.checkArray(structure)) {
            if (!TUtils.checkArray(structure[0])) {
                throw new Error(this.getMessage('structure incorrect'))
            }
            const newNbCols = structure[0].length
            let tileNumber
            // init counters
            for (i = 0; i < this.counters.length; i++) {
                this.counters[i] = 0
            }
            for (i = 0; i < structure.length; i++) {
                newRows[i] = []
                for (let j = 0; j < newNbCols; j++) {
                    if (j < structure[i].length) {
                        tileNumber = structure[i][j]
            this.notifyTileChange(j, i, tileNumber)
                        newRows[i][j] = tileNumber
                        this.counters[tileNumber]++
                    } else {
                        // row too short: fill with 0
                        newRows[i][j] = 0
                        this.counters[0]++
                    }
                }
            }
        this.removeEntranceLocation()
        this.removeExitLocations()
            this.rows = newRows
            this.nbRows = structure.length
            this.nbCols = newNbCols
            this.buildStructure()
        } else {
            //TODO: offer to load structure from file as well (if structure is string)
            throw new Error(this.getMessage('structure incorrect'))
        }
    }

    _compareStructure(comparison) {
        const a = comparison
        const b = this.gObject.p.tiles
        if (a.length !== b.length) {
            return false
        }
        for (let y = 0; y < a.length; y++) {
            const ya = a[y]
            const yb = b[y]
            if (ya.length !== yb.length) {
                return false
            }
            for (let x = 0; x < ya.length; x++) {
                xa = ya[x]
                xb = yb[x]
                if (xa !== xb) {
                    return false
                }
            }
        }
        return true
    }

    /**
     * Returns the 2D matrix.
     * @returns {Integer[][]}
     */
    _getStructure() {
        return (this.gObject.p.tiles)
    }

    _placeTile(x, y, number) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number)
        } else {
            number = 1
        }
        this.setTile(x, y, number)
    }

    _removeTile(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this.setTile(x, y, 0)
    }

    /**
     * Change the value of the tile [x,y] in structure to the value "number".
     * @param {Number} x
     * @param {Number} y
     * @param {Number} number
     */
    _setTile(x, y, number) {
        this._placeTile(x, y, number)
    }

    setTile(x, y, number) {
        let i
        let j
        if (x < 0) {
            throw new Error(this.getMessage('x value incorrect', x))
        }
        if (y < 0) {
            throw new Error(this.getMessage('y value incorrect', y))
        }
        if (number < 0 || number > this.tiles.length) {
            // tile.length+1 to take base block (#0) into account
            throw new Error(this.getMessage('tile number incorrect', number))
        }
        if (y >= this.nbRows) {
            // rows have to be created
            for (i = this.nbRows; i <= y; i++) {
                this.rows[i] = []
                for (j = 0; j < this.nbCols; j++) {
                   this.rows[i].push(0)
                   this.counters[0]++
                }
            }
            this.nbRows = y + 1
        }
        if (x >= this.nbCols) {
            // cols have to be created
            for (i = 0; i < this.nbRows; i++) {
                for (j = this.nbCols; j <= x; j++) {
                    this.rows[i].push(0)
                    this.counters[0]++
                }
            }
            this.nbCols = x + 1
        }
        // update counter of preceding tile
        this.counters[this.rows[y][x]]--
        this.notifyTileChange(x, y, number)
        this.rows[y][x] = number
        this.counters[number]++
        this.buildStructure()
    }

    /**
     * Build Platform.
     */
    _build() {
        this.gObject.build()
        this.buildSheet()
        this.built = true
    }

    /**
     * Loads resources and draws Platform.
     */
    buildSheet() {
        let tile
        if (this.tiles.length === 0) {
            return
        }
        const tile0 = this.resources.get(this.tiles[0])
        if (!tile0) {
            // resource not already loaded: exit
            return
        }
        const tileW = tile0.width
        const tileH = tile0.height
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = tileW * (this.tiles.length + 1)
        canvas.height = tileH
        if (this.baseTile !== '') {
            tile = this.resources.get(this.baseTile)
            if (!tile) {
                // resource not already loaded: exit
                return
            }
            ctx.drawImage(tile, 0, 0)
        }
        for (let i = 0; i < this.tiles.length;i++) {
            tile = this.resources.get(this.tiles[i])
            if (!tile) {
                // resource not already loaded: exit
                return
            }
            ctx.drawImage(tile, tileW * (i + 1), 0)
        }
        const newImage = new Image()
        const self = this
        newImage.onload = () => {
            //self.sheet = newImage;
            self.gObject.sheet(newImage, {'tileW':tileW, 'tileH':tileH})
        }
        // start loading
        newImage.src = canvas.toDataURL()
    }

    /**
     * Build structure.
     */
    buildStructure() {
        this.gObject.setStructure(this.rows)
    }

    /**
     * Returns Platform is ready or not.
     * If Platform isn't ready, call callback if defined.
     * @param {function} callback
     * @param {type} arguments
     * @returns {Boolean}
     */
    isReady(callback, args) {
        if (this.gObject.p.initialized) {
            return true
        } else {
            if (typeof callback !== 'undefined') {
                this.gObject.perform(callback, args)
            }
            return false
        }
    }

    notifyTileChange(x, y, identifier) {
        if (this.entranceLocation !== false && this.entranceLocation[0] === x && this.entranceLocation[1] === y) {
            this.removeEntranceLocation()
        } else if (this.exitLocations !== false) {
            this.removeExitLocation(x, y)
        }
        if (this.hasDefaultSettings) {
            if (identifier === Platform.ENTRANCE) {
                this.setEntranceLocation(x, y)
            } else if (identifier === Platform.EXIT) {
                this.addExitLocation(x, y)
            }
        }
    }

    getEntranceLocation() {
        return this.entranceLocation
    }

    removeEntranceLocation() {
        if (this.entranceLocation === false) {
            return
        }
        const x = this.entranceLocation[0]
        const y = this.entranceLocation[1]
        for (let i = 0;i < Platform.registered.length;i++) {
            const object = Platform.registered[i]
            object.removeEntranceLocation()
        }
        this.entranceLocation = false
    }

    setEntranceLocation(x, y) {
        this.entranceLocation = [x,y]
        // warn every robots registered that entrance has been added
        for (let i = 0;i < Platform.registered.length;i++) {
            const object = Platform.registered[i]
            object.setEntranceLocation(x,y)
        }
    }

    getExitLocations() {
        return this.exitLocations
    }

    removeExitLocations() {
        if (this.exitLocations === false) {
            return
        }
        const exitLocations = this.exitLocations.slice()
        for (let index = 0; index < exitLocations.length; index++) {
            const location = exitLocations[index]
            this.removeExitLocation(location[0], location[1])
        }
        this.exitLocations = false
    }

    removeExitLocation(x, y) {
        for (let index = this.exitLocations.length - 1; index >= 0; index--) {
            const exitLocation = this.exitLocations[index]
            if (exitLocation[0] === x && exitLocation[1] === y) {
                this.exitLocations.splice(index, 1)
                break
            }
        }
        for (let i = 0;i < Platform.registered.length;i++) {
            const object = Platform.registered[i]
            object.removeExitLocation(x,y)
        }
    }

    addExitLocation(x, y) {
        if (this.exitLocations === false) {
            this.exitLocations = []
        }
        this.exitLocations.push([x,y])
        // warn every robots registered that entrance has been added
        for (let i = 0;i < Platform.registered.length;i++) {
            const object = Platform.registered[i]
            object.addExitLocation(x,y)
        }
    }

    /**
     * Sets a row, starting from the given location.
     * If the row is too short, it is filled with 0.
     * If the row is too long, it is truncated.
     * @param {Number[]} row
     */
    _setRow(x, y, row) {
        let i
        let j
        if (this.nbCols === 0 && this.nbRows === 0) {
            this.nbCols = row.length + x
        }
        if (y >= this.nbRows) {
            // rows have to be created
            for (i = this.nbRows; i <= y; i++) {
                this.rows[i] = []
                for (j = 0; j < this.nbCols; j++) {
                   this.rows[i].push(0)
                   this.counters[0]++
                }
            }
            this.nbRows = y + 1
        }
        const newNbCols = row.length + x
        if (newNbCols > this.nbCols) {
            // cols have to be created
            for (i = 0; i < this.nbRows; i++) {
                for (j = this.nbCols; j < newNbCols; j++) {
                    this.rows[i].push(0)
                    this.counters[0]++
                }
            }
            this.nbCols = newNbCols
        }

        let previous
        for (i = 0; i < row.length; i++) {
            previous = this.rows[y][x + i]
            this.counters[previous]--
        this.notifyTileChange(x + i, y, row[i])
            this.rows[y][x + i] = row[i]
            this.counters[row[i]]++
        }
        this.buildStructure()
    }

    _getTileCount(tileNumber) {
        if (typeof this.counters[tileNumber] !== 'undefined') {
            return this.counters[tileNumber]
        }
        return 0
    }

    getTilesLength() {
        return this.tiles.length
    }

    /**
     * Delete Platform.
     */
    deleteObject() {
        const g = TRuntime.getGraphics().getInstance()
        g.stage().removeCollisionLayer(this.gObject)
        // remove object from instances list
        const index = Platform.instances.indexOf(this)
        if (index > -1) {
            Platform.instances.splice(index, 1)
        }
        super.deleteObject()
    }
}

Platform.prototype.className = 'Platform'
Platform.instances = []
Platform.registered = []

Platform.WALL = 0x01
Platform.GROUND = 0x02
Platform.ENTRANCE = 0x03
Platform.EXIT = 0x04

const graphics = Platform.prototype.graphics

Platform.register =  object => {
    Platform.registered.push(object)
    for (let i = 0;i < Platform.instances.length; i++) {
        const platform = Platform.instances[i]
        object._addPlatform(platform)
    }
}

Platform.unregister =  object => {
    const index = Platform.registered.indexOf(object)
    if (index > -1) {
        Platform.registered.splice(index, 1)
    }
}

// TODO: Correct this. It's a hack that works if there is only 1 answer
// callback.
Platform.ask = (source, question) => {
    for (let index = 0; index < Platform.registered.length; index++) {
        const object = Platform.registered[index]
        if (object.className === 'Girl') {
            const commands = object.getGObject().askCommands
            commands.executeCommands({'parameters': [source, question]}, true)
        }
    }
}

const TSpriteSheet = graphics.addClass('SpriteSheet', 'TSpriteSheet', {
    init(img, options) {
        TUtils.extend(this, {
            name,
            img,
            w: img.width,
            h: img.height,
            tileW: 64,
            tileH: 64,
            sx: 0,
            sy: 0,
            spacingX: 0,
            spacingY: 0,
            currentRow: 0,
            frameProperties: {}
        })
        if (options) {
            TUtils.extend(this,options)
        }
        // fix for old tilew instead of tileW
        if (this.tilew) {
            this.tileW = this.tilew
            delete this.tilew
        }
        if (this.tileh) {
            this.tileH = this.tileh
            delete this.tileh
        }

        this.cols = this.cols ||
                    Math.floor(this.w / (this.tileW + this.spacingX))

        this.frames = this.cols * (Math.ceil(this.h / (this.tileH + this.spacingY)))
        },
            draw(ctx, x, y, frame) {
            if(!ctx) { ctx = Q.ctx }
            ctx.drawImage(this.img,
                this.fx(frame),this.fy(frame),
                this.tileW, this.tileH,
                Math.floor(x),Math.floor(y),
                this.tileW, this.tileH)
        }
})

Platform.prototype.gClass = graphics.addClass('TileLayer', 'TPlatform', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            type: TGraphicalObject.TYPE_PLATFORM,
            frozen: false,
            initialized: false,
            reset:false,
            drawBaseTile:false,
            built:false,
            designMode:false,
            tiles: [[]],
            collidable: [false]
        }, props), defaultProps)
        if (!this.p.built) {
            this.spriteSheet = false
            this.operations = []
        }
    },
    build() {
        this.perform( function() {
            this.init({built:true, initialized:this.p.initialized, tiles:this.p.tiles, tileW:this.p.tileW, tileH:this.p.tileH, drawBaseTile:this.p.drawBaseTile, id:this.p.id, x:this.p.x, y:this.p.y, collidable:this.p.collidable})
            graphics.objectResized(this)
        })
    },
empty() {
    this.sheet(new Image(), {'tileW': 40, 'tileH': 40})
    this.p.tiles = [[]]
    this.p.collidable = [false]
    this.p.initialized = false
    if (this.p.built) {
        this.build()
    }
},
    setStructure(data) {
        this.p.tiles = data
        if (this.p.built) {
                // rebuild object
            this.build()
        }
        if (!this.p.initialized && this.spriteSheet !== false) {
            this.initialized()
        }
    },
    draw(context) {
        if (this.p.initialized && this.p.built) {
            this._super(context)
        }
    },
    sheet(img, options) {
        if(!img) {
            return this.spriteSheet
        }
        this.spriteSheet = new TSpriteSheet(img, options)
        this.p.tileW = this.spriteSheet.tileW
        this.p.tileH = this.spriteSheet.tileH
        if (this.p.built) {
            // rebuild object
            this.build()
        }
        if (!this.p.initialized && this.p.tiles) {
            this.initialized()
        }
    },
    perform(action, parameters) {
        if (this.p.initialized) {
            action.apply(this, parameters)
        } else {
            this.operations.push([action, parameters])
        }
    },
    initialized() {
        this.p.initialized = true
        while (this.operations.length > 0) {
            const operation = this.operations.shift()
            operation[0].apply(this, operation[1])
        }
    },
    setDimensions() {
        this._super()
    },
    setLocation(x, y) {
        this.perform(function(x, y) {
            this.p.x = x
            this.p.y = y
        }, [x, y])
    },
    getLocation() {
        return {x: Math.round(this.p.x), y: Math.round(this.p.y)}
    },
    getXCenter() {
        return Math.round(this.p.x + this.p.w / 2)
    },
    getYCenter() {
        return Math.round(this.p.y + this.p.h / 2)
    },
    getX() {
        return Math.round(this.p.x)
    },
    getY() {
        return Math.round(this.p.y)
    },
    setCenterLocation(x, y) {
        this.perform(function(x, y) {
            this.p.x = x - this.p.w / 2
            this.p.y = y - this.p.h / 2
        }, [x, y])
    },
    freeze(value) {
    },
    drawBaseTile(value) {
        this.p.drawBaseTile = value
    },
    drawableTile(tileNum) {
        if (!this.p.drawBaseTile) {
            return tileNum > 0
        }
        return true
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
    getId() {
        return this.p.id
    },
    size(force) {
        if(force || (!this.p.w || !this.p.h)) {
            this.setDimensions()
        }
    },
    drawBlock(ctx, blockX, blockY) {
        // Fixed a bug in Quintus(?): startX and startY should not hold references to p.x and p.y
        const p = this.p

        const startX = Math.floor(blockX * p.blockW)
        const startY = Math.floor(blockY * p.blockH)

        if(!this.blocks[blockY] || !this.blocks[blockY][blockX]) {
          this.prerenderBlock(blockX,blockY)
        }

        if(this.blocks[blockY]  && this.blocks[blockY][blockX]) {
          ctx.drawImage(this.blocks[blockY][blockX],startX,startY)
        }
    },
    addCollidable() {
        this.p.collidable.push(true)
    },
    setCollidable(tileNum, value) {
        this.p.collidable[tileNum] = value
    },
    collidableTile(tileNum) {
        return this.p.collidable[tileNum]
    }
})


export default Platform
