import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Block from '@/objects/block/Block'
import Sprite from '@/objects/sprite/Sprite'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Scene, inherited from Block.
 * It has a background image and a Block image.
 * Scene can be linked to Character.
 * @param {String} name Scene's name
 * @exports Scene
 */
class Scene extends Block {
    constructor(name) {
        super()
        if (typeof (name) === 'undefined') {
            name = 'nature'
        }
        this.backgroundName = ''
        this.blockName = ''
        this._setScene(name)
    }

    /**
     * Creates Scene.
     * Loads background and set it.
     * Loads Block image, execute a transparency mask on it and set the result.
     * @param {String} name Scene's name
     */
    _setScene(name) {
        name = TUtils.getString(name)
        name = this.getMessage(name)
        const baseSceneUrl = `${this.getResource(name)}/`
        const configUrl = `${baseSceneUrl}config.json`
        const parent = this
        this.loadJSON(
            configUrl,
            data => {
                const backImage = data['images']['background']
                const blockImage = data['images']['block']
                try {
                    parent._removeImageSet('elements')
                } catch (e) {
                }
                parent.gObject.reinit()
                const backgroundName = `${name}/${backImage}`
                parent.backgroundName = backgroundName
                const blockName = `${name}/${blockImage}`
                parent.blockName = blockName
                parent.addImage(backgroundName, 'elements', false, () => {
                    // background may have changed during loading
                    if (parent.backgroundName === backgroundName) {
                        parent.gObject.setBackground(backgroundName)
                    }
                })
                parent.addImage(blockName, 'elements', false, () => {
                    // block may have changed during loading
                    if (parent.blockName === blockName) {
                        parent.computeTransparencyMask(blockName)
                        parent.gObject.setBlock(blockName)
                    }
                })
            },
            error => {
                throw new Error(TUtils.format(parent.getMessage('unknown character'), name))
            }
        )
    }

    /**
     * Display the Block image.
     */
    _showBlock() {
        this.gObject.setBlockDisplayed(true)
    }

    /**
     * Hide the block image.
     */
    _hideBlock() {
        this.gObject.setBlockDisplayed(false)
    }

    /**
     * Remove the current background if existing and set a new one.
     * @param {String} name
     */
    _setBackground(name) {
        name = TUtils.getString(name)
        try {
            this.removeImage(this.backgroundName)
        } catch (e) {
        }
        this.backgroundName = name
        const sceneObject = this
        const gObject = this.gObject
        gObject.removeBackground()
        this.addImage(name, 'elements', true, () => {
            if (name === sceneObject.backgroundName) {
                gObject.setBackground(name)
            }
        })
    }

    /**
     * Remove the current Block image if existing and set a new one.
     * @param {String} name
     */
    _setBlock(name) {
        name = TUtils.getString(name)
        try {
            this.removeImage(this.blockName)
        } catch (e) {
        }
        this.blockName = name
        const sceneObject = this
        const gObject = this.gObject
        gObject.removeBlock()
        this.addImage(name, 'elements', true, () => {
            if (name === sceneObject.blockName) {
                sceneObject.computeTransparencyMask(name)
                gObject.setBlock(name)
            }
        })
    }

    /**
     * Execute a Transparency Mask on Block image and Background,
     * and set the created images as news Block image and Background.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    _setTransparent(red, green, blue) {
        if (this.resources.has(this.blockName)) {
            this.gObject.removeBlock()
        }
        if (this.resources.has(this.backgroundName)) {
            this.gObject.removeBackground()
        }
        const parent = this
        Sprite.prototype.setTransparent.call(this, red, green, blue, name => {
            if (name === parent.blockName) {
                parent.computeTransparencyMask(name)
                parent.gObject.setBlock(name)
            }
            if (name === parent.backgroundName) {
                parent.gObject.setBackground(name)
            }
        })
    }
}

Scene.prototype.className = 'Scene'

const graphics = Scene.prototype.graphics

Scene.prototype.gClass = graphics.addClass('TBlock', 'TScene', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            assetBlock: null,
            showBlock: false
        }, props), defaultProps)
    },
    draw(ctx) {
        this._super(ctx)
        const p = this.p
        if (p.showBlock && p.assetBlock) {
            ctx.drawImage(this.resources.getUnchecked(p.assetBlock), -p.cx, -p.cy)
        }
    },
    setBackground(asset) {
        const oldW = this.p.w
        const oldH = this.p.h
        this.p.asset = asset
        // resize only for background
        graphics.objectResized(this)
        this.p.x += (this.p.w - oldW) / 2
        this.p.y += (this.p.h - oldH) / 2
        this.p.destinationX = this.p.x
        this.p.destinationY = this.p.y
        if (!this.p.initialized && this.p.assetBlock) {
            this.initialized()
        }
    },
    setBlock(asset) {
        this.p.assetBlock = asset
        if (!this.p.initialized && this.p.asset) {
            this.initialized()
        }
    },
    setBlockDisplayed(value) {
        this.p.showBlock = value
    },
    reinit() {
        this.initialized(false)
        this.p.asset = null
        this.p.assetBlock = null
    },
    removeBlock() {
        this.initialized(false)
        this.p.assetBlock = null
    },
    removeBackground() {
        this.initialized(false)
        this.p.asset = null
    }
})

export default Scene
