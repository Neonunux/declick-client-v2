import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Sprite from '@/objects/sprite/Sprite'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Walker, inhetired from Sprite.
 * It can have a gravity, jump and be linked to a Block.
 * @param {String} name Walker's name
 * @exports Walker
 */
class Walker extends Sprite {
    constructor(name) {
        super(name)
    }

    /**
     * Link a Block given in parameter to the Walker.
     * Walker can't walk in non-transparent areas of the Block.
     * @param {String} block
     */
    _addBlock(block) {
        block = TUtils.getObject(block)
        const self = this
        if (!block.isReady(() => {
            self.gObject.addBlock(block)
            self.blockReady()
        })) {
            // wait for block to be loaded
            this.gObject.waitForBlock()
        } else {
            // block is ready: add it
            self.gObject.addBlock(block)
        }
    }

    /**
     * Link a platform to the Walker. Walker will not pass through.
     * @param {String} platform
     */
    _addPlatform(platform) {
        this._addBlock(platform)
    }

    /**
     * Defines if the Walker can fall or not.
     * @param {Boolean} value
     */
    _mayFall(value) {
        if (typeof value === 'boolean') {
            value = TUtils.getBoolean(value)
        } else {
            value = true
        }
        this.gObject.mayFall(value)
    }

    /**
     * Set the Jump Speed of the Walker.
     * Walker can jump only if it has gravity and it is on a Block.
     * @param {Number} value
     */
    _setJumpSpeed(value) {
        value = TUtils.getInteger(value)
        this.gObject.setJumpSpeed(value)
    }

    /**
     * Walker will jump, depending of JumpSpeed.
     */
    _jump(...args) {
        if (args.length > 0) {
            throw this.getMessage('unexpected jump argument')
        }
        this.gObject.jump()
    }

    /**
     * Says that a Block is ready to be added. Remove it from the waiting list.
     */
    blockReady() {
        this.gObject.blockReady()
    }

    /**
     * Set the gravity. The higher the number, the faster Walker will fall.
     * @param {Number} value
     */
    _setGravity(value) {
        value = TUtils.getInteger(value)
        this.gObject.setGravity(value)
    }
}

Walker.prototype.className = 'Walker'

const graphics = Walker.prototype.graphics

Walker.prototype.gClass = graphics.addClass('TSprite', 'TWalker', {
    init(props, defaultProps) {
        this._super(TUtils.extend({
            type: TGraphicalObject.TYPE_WALKER | TGraphicalObject.TYPE_SPRITE,
            collisionMask: TGraphicalObject.TYPE_SPRITE | TGraphicalObject.TYPE_PLATFORM | TGraphicalObject.TYPE_BLOCK,
            mayFall: false,
            jumping: false,
            vy: 0,
            gravity: 9.8 * 100,
            jumpDelay: 10,
            jumpAvailable: 0,
            jumpSpeed: -300,
            waitingForBlocks: 0
        }, props), defaultProps)
        this.blocks = new Array()
        this.on('bump.bottom', 'landed')
    },
    step(dt) {
        const p = this.p
        if (!this.p.dragging && !this.p.frozen && this.p.waitingForBlocks === 0) {
            if (this.p.mayFall && (this.p.direction === Sprite.DIRECTION_UP || this.p.direction === Sprite.DIRECTION_DOWN)) {
                // cannot move upward or downward when walker may fall
                this.p.direction = Sprite.DIRECTION_NONE
            }
            if (this.p.mayFall) {
                this.p.vy += this.p.gravity * dt
                if (this.p.jumpAvailable > 0)
                    {this.p.jumpAvailable--}
                if (this.p.jumping) {
                    if (this.p.jumpAvailable > 0) {
                        // perform a jump
                        this.p.vy = this.p.jumpSpeed
                    }
                    this.p.jumping = false
                }
                if (this.p.direction === Sprite.DIRECTION_NONE) {
                    this.p.destinationY = this.p.y + this.p.vy * dt
                }
            }
        }
        this._super(dt)
    },
    checkCollisions() {
        // search for sprites and blocks
        this._super()
        // search for any platform
        graphics.searchCollisionLayer(this, TGraphicalObject.TYPE_PLATFORM, false)
    },
    handleCollisions() {
        const separate = []
        const p = this.p
        separate[0] = 0
        separate[1] = 0
        let blockedX = false
        let blockedY = false
        while (this.p.collisions.length > 0) {
            const collision = this.p.collisions.pop()
            const object = collision.obj
            const id = object.getId()
            if (this.blocks.includes(id) && (((object.p.type & TGraphicalObject.TYPE_PLATFORM) !== 0 ) || (((object.p.type & TGraphicalObject.TYPE_BLOCK) !== 0) && !object.checkTransparency(this, collision)))) {
                const impactX = Math.abs(p.vx)
                const impactY = Math.abs(p.vy)
                collision.impact = 0
                p.skipCollide = false
                if(collision.normalY < -0.3) {
                    collision.impact = impactY
                    this.trigger('bump.bottom',collision)
                    this.trigger('bump',collision)
                    if(!p.skipCollide && p.vy > 0) {
                        p.vy = 0
                        blockedY = true
                    }
                }
                if(collision.normalY > 0.3) {
                    collision.impact = impactY
                    this.trigger('bump.top',collision)
                    this.trigger('bump',collision)
                    if(!p.skipCollide && p.vy < 0) {
                        p.vy = 0
                        blockedY = true
                    }
                }
                if(collision.normalX < -0.3) {
                    collision.impact = impactX
                    this.trigger('bump.right',collision)
                    this.trigger('bump',collision)
                    if(!p.skipCollide && p.vx > 0) {
                        p.vx = 0
                        blockedX = true
                    }
                }
                if(collision.normalX > 0.3) {
                    collision.impact = impactX
                    this.trigger('bump.left',collision)
                    this.trigger('bump',collision)
                    if(!p.skipCollide && p.vx < 0) {
                        p.vx = 0
                        blockedX = true
                    }
                }
                if (!p.skipCollide) {
                    if (Math.abs(collision.separate[0]) > Math.abs(separate[0])) {
                        separate[0] = collision.separate[0]
                    }
                    if (Math.abs(collision.separate[1]) > Math.abs(separate[1])) {
                        separate[1] = collision.separate[1]
                    }
                }
            }
            if (object.p.type & (TGraphicalObject.TYPE_SPRITE | TGraphicalObject.TYPE_BLOCK) !== 0) {
                this.trigger('hit', collision)
                this.trigger('hit.collision', collision)
                // Do the reciprical collision
                collision.obj = this
                collision.normalX *= -1
                collision.normalY *= -1
                collision.distance = 0
                collision.magnitude = 0
                collision.separate[0] = 0
                collision.separate[1] = 0
                object.trigger('hit', collision)
                object.trigger('hit.sprite', collision)
            }
        }
        p.x -= separate[0]
        p.y -= separate[1]
        if (blockedX) {
            p.destinationX = p.x
            if (p.direction === Sprite.DIRECTION_RIGHT || p.direction === Sprite.DIRECTION_LEFT) {
                p.direction = Sprite.DIRECTION_NONE
            }
        }
        if (blockedY) {
            p.destinationY = p.y
            if (p.direction === Sprite.DIRECTION_UP || p.direction === Sprite.DIRECTION_BOTTOM) {
                p.direction = Sprite.DIRECTION_NONE
            }
        }
    },
    landed(col) {
        this.p.jumpAvailable = this.p.jumpDelay
    },
    addBlock(block) {
        const objId = block.getGObject().getId()
        if (!this.blocks.includes(objId)) {
            this.blocks.push(objId)
        }
    },
    removeBlock(block) {
        const objId = block.getGObject().getId()
        const index = this.blocks.indexOf(objId)
        if (index !== -1) {
            this.blocks.splice(index,1)
        }
    },
    mayFall(value) {
        if (typeof value === 'undefined') {
                value = true
        }
        this.perform(function() {
            this.p.mayFall = value
        })
    },
    setJumpSpeed(value) {
        this.perform(function() {
            this.p.jumpSpeed = -3 * value
        })
    },
    setGravity(value) {
        this.perform(function() {
            this.p.gravity = 9.8 * value
        })
    },
    jump() {
        this.perform(function() {
            this.p.jumping = true
        })
    },
    waitForBlock() {
        this.p.waitingForBlocks++
    },
    blockReady() {
        this.p.waitingForBlocks--
    },
    setLocation(x, y) {
        this._super(x, y)
        this.perform(function() {
        	this.p.vy = 0
        }, {})
    },
    setCenterLocation(x, y) {
        this._super(x, y)
        this.perform(function() {
        	this.p.vy = 0
        }, {})
    }

})

export default Walker
