import $ from 'jquery'

import TObject from '@/objects/tobject/TObject'
import TUI from '@/components/TUI'

/**
 * Defines Mouse, inherited from TObject.
 * Mouse is an object created automatically with the launch of Mouse.
 * It allows several interactions.
 * @exports Mouse
 */
class Mouse extends TObject {
    constructor() {
        super()
    }

    getX() {
        TUI.getCanvasCursorX()
    }
    getY() {
        TUI.getCanvasCursorY()
    }

    /**
     * Get mouse X "value".
     */
    _getX() {
        return this.getX()
    }

    /**
     * Get mouse Width "value" in logs.
     */
    _getY() {
        return this.getY()
    }
}

Mouse.prototype.className = 'Mouse'

const mouseInstance = new Mouse()
export default mouseInstance