import Platform from '@/objects/platform/Platform'
import TUtils from '@/utils/TUtils'

/**
 * Defines Maze, inherited from Platform.
 * Creates a platform with some basic tiles.
 * @exports Maze
 */
class Maze extends Platform {
    constructor() {
        super()
        this._build()
    }

    /**
     * Change the value of the tile [x,y] in structure to the value "number".
     * Checks if there is an Entrance or an Exit.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} number
     */
    _setTileMaze(x, y, number) {
        this._setTile(x, y, number)
    }

    /*
     * Put a ground at given location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildGround(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this._setTileMaze(x,y,Platform.GROUND)
    }

    /*
     * Build a entrance at current location
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildEntrance(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this._setTileMaze(x,y,Platform.ENTRANCE)
    }

    /*
     * Build an exit at current location
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildExit(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this._setTileMaze(x,y,Platform.EXIT)
    }

    /*
     * Build an wall at current location
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    _buildWall(x, y) {
        x = TUtils.getInteger(x)
        y = TUtils.getInteger(y)
        this._setTileMaze(x,y,Platform.WALL)
    }

    _setRow(x, y, row) {
        for (let i = 0; i < row.length; i++){
            if (row[i] === Platform.ENTRANCE) {
                this.setEntranceLocation(x + i,y)
            } else if (row[i] === Platform.EXIT) {
                this.addExitLocation(x + i,y)
            }
        }
        super._setRow(x, y, row)
    }

    _loadStructure(structure) {
        super._loadStructure(structure)
        for (let i = 0; i < this.nbRows; i++) {
            for (let j = 0; j < this.nbCols; j++) {
                if (this.rows[i][j] === Platform.ENTRANCE) {
                    this.setEntranceLocation(j,i)
                } else if (this.rows[i][j] === Platform.EXIT) {
                    this.addExitLocation(j,i)
                }
            }
        }
    }
}

Maze.prototype.className = 'Maze'

export default Maze
