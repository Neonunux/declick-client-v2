import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Sprite from '@/objects/sprite/Sprite'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Block, inherited from Sprite.
 * Its utility is to be an obstacle for Walker.
 * Walker will be stop by any non-transparent area of Block.
 * @param {String} name Block's name
 * @exports Block
 */
class Block extends Sprite {
    constructor(name) {
        super(name)
    }

    /**
     * Set the image to be displayed.
     * If the image is ready, set it and compute Transparency Mask on it.
     * @param {String} name
     * @returns {Boolean}   Return true is the image is ready, else false.
     */
    setDisplayedImage(name) {
        if (Sprite.prototype.setDisplayedImage.call(this, name)) {
            // compute transparency mask
            this.computeTransparencyMask(name)
            return true
        } else {
            return false
        }
    }

    /**
     * Execute a Transparency Mask on the image.
     * Walker will be able to move on transparent areas.
     * @param {String} name Image's name
     */
    computeTransparencyMask(name) {
        const image = this.resources.get(name)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const width = image.width
        const height = image.height
        canvas.width = width
        canvas.height = height
        this.gObject.p.transparencyMask = new Array()
        const mask = this.gObject.p.transparencyMask
        let row = -1
        let col = width
        ctx.drawImage(image, 0, 0)
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
            col++
            if (col >= width) {
                col = 0
                row++
                mask[row] = new Array()
            }
            mask[row][col] = (data[i + 3] === 0) ? true : false
        }
    }
}

Block.prototype.className = 'Block'

const graphics = Block.prototype.graphics

Block.prototype.gClass = graphics.addClass('TSprite', 'TBlock', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            type: TGraphicalObject.TYPE_BLOCK,
            collisionMask: TGraphicalObject.TYPE_SPRITE,
            imageData: null,
            transparencyMask: null
        }, props), defaultProps)
    },
    setImageData(data) {
        this.perform(function(value) {
            this.p.imageData = value
        }, [data])
    },
    checkTransparency({p}, col) {
        if (this.p.transparencyMask === null) {
            return false
        }

        // get coordinates of bounding box, relative to this object
        const objectWidth = p.w
        const objectHeight = p.h
        const thisWidth = this.p.w
        const thisHeight = this.p.h
        const actualObjectX = p.x - objectWidth / 2 - this.p.x + thisWidth / 2
        const actualObjectY = p.y - objectHeight / 2 - this.p.y + thisHeight / 2

        const objectX = Math.round(actualObjectX)
        const objectY = Math.round(actualObjectY)

        const deltaX = actualObjectX - objectX
        const deltaY = actualObjectY - objectY

        let separateXL = 0
        let separateXR = 0
        let separateYT = 0
        let separateYB = 0

        let clear = true
        let index
        const mask = this.p.transparencyMask

        // CHECK HORIZONTALLY
        const middleY = Math.max(0, Math.min(Math.round(objectY + objectHeight / 2), thisHeight - 1))
        if (typeof mask[middleY] !== 'undefined') {
            for (let i = 0; i < objectWidth / 2; i++) {
                index = objectX + i
                if ((typeof mask[middleY][index] !== 'undefined') && !mask[middleY][index]) {
                    separateXL = i + 1
                    clear = false
                }
                index = objectX + objectWidth - 1 - i
                if ((typeof mask[middleY][index] !== 'undefined') && !mask[middleY][index]) {
                    separateXR = i + 1
                    clear = false
                }
            }
        }

        // CHECK VERTICALLY
        const middleX = Math.max(0, Math.min(Math.round(objectX + objectWidth / 2), thisWidth - 1))
        for (let j = 0; j < objectHeight / 2; j++) {
            index = objectY + j
            if ((typeof mask[index] !== 'undefined') && (typeof mask[index][middleX] !== 'undefined') && !mask[index][middleX]) {
                separateYT = j + 1
                clear = false
            }
            index = objectY + objectHeight - j
            if ((typeof mask[index] !== 'undefined') && (typeof mask[index][middleX] !== 'undefined') && !mask[index][middleX]) {
                separateYB = j + 1
                clear = false
            }
        }
        if (clear) {
            return true
        }
        //return false;
        if (separateXL !== 0) {
            if (separateXR !== 0) {
                // cannot move horizontally
                col.separate[0] = 0
            } else {
                col.separate[0] = -separateXL + deltaX
            }
        } else {
            col.separate[0] = separateXR + deltaX
        }

        if (separateYT !== 0) {
            if (separateYB !== 0) {
                // cannot move vertically
                col.separate[1] = 0
            } else {
                col.separate[1] = -separateYT + deltaY
            }
        } else {
            col.separate[1] = separateYB + deltaY
        }


        //return false;

        // calculate normal
        let normalX = col.separate[0]
        let normalY = -col.separate[1]



        const dist = Math.sqrt(normalX * normalX + normalY * normalY)
        if (dist > 0) {
            normalX /= dist
            normalY /= dist
        }

        col.normalX = normalX
        col.normalY = normalY

        return false
    }
})

export default Block
