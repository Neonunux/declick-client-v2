import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Sprite from '@/objects/sprite/Sprite'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Item, inherited from Sprite.
 * Item is a Sprite which can be picked up.
 * @param {String} name Item's name
 * @exports Item
 */
class Item extends Sprite {
    constructor(name) {
        const translated = this.getMessage(name)
        if (translated !== name) {
            // name is one of the default category
            super()
            this.addImage(translated, '', false)
            this.setDisplayedImage(translated)
            this.gObject.setName(name)
        } else {
            super(name)
            if (typeof name === 'undefined') {
                this.addImage('coin.png', '', false)
                this.setDisplayedImage('coin.png')
                this.gObject.setName(this.getMessage('default'))                
            } else { 
                this.gObject.setName(name)                
            }
        }
    }

    _setName(value) {
        value = TUtils.getString(value)
        const translated = this.getMessage(value)
        if (translated !== value) {
            // name is one of the default category
            this.addImage(translated, '', false)
            this.setDisplayedImage(translated)
        }
        this.gObject.setName(value)
    }
}

Item.prototype.className = 'Item'

const graphics = Item.prototype.graphics

Item.prototype.gClass = graphics.addClass('TSprite', 'TItem', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            type: TGraphicalObject.TYPE_ITEM | TGraphicalObject.TYPE_SPRITE,
            name: 'item'
        }, props), defaultProps)
    },
    setName(value) {
        this.p.name = value
        this.setCategory(value)
    },
    getName() {
        return this.p.name
    }
})

export default Item
