import TRuntime from '@/run/TRuntime'
import TObject from '@/objects/tobject/TObject'
import SynchronousManager from '@/utils/SynchronousManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines KeyStroke, inherited from TObject.
 * Allows the association of commands with keyboard.
 * @exports KeyStroke
 */
class Keyboard extends TObject {
    constructor() {
        super()
        this.active = false
        this.keyboardEnabled = false
        this.waiting = false
        this.keys = []
        const that = this
        this.listenerKeyDown = e => {
            that.processKeyDown(e)
            e.preventDefault()
        }
        this.listenerKeyUp = e => {
            that.processKeyUp(e)
            e.preventDefault()
        }
        this.synchronousManager = new SynchronousManager()
        TRuntime.addInstance(this)
        this.keyNamesInitialized = false       
    }

    /**
     * Returns the Keycode of a key.
     * @param {String} key
     * @returns {Number}    Keycode corresponding to key.
     */
    getKeyCode(key) {
        key = TUtils.removeAccents(key)
        key = this.getMessage(key)
        const code = TUtils.getkeyCode(key)
        if (code === false) {
            throw new Error(TUtils.format(this.getMessage('unknown key'), key))
        }
        return code
    }

    /**
     * Enable the possibility to use keyboard.
     * @returns {Boolean}   Returns false if already enabled.
     */
    enableKeyboard() {
        if (this.keyboardEnabled) {
            return false
        }

        const element = TRuntime.getGraphics().getElement()
        
        if (typeof element !== 'undefined') {

            // Copied from Quintus_input
            element.tabIndex = 0
            element.style.outline = 0

            element.addEventListener('keydown', this.listenerKeyDown, false)
            element.addEventListener('keyup', this.listenerKeyUp, false)

            this.keyboardEnabled = true
        }
    }

    /**
     * Disable the possibility to use keyboard.
     * @returns {Boolean}   Returns false if already disabled.
     */
    disableKeyboard() {
        if (!this.keyboardEnabled) {
            return false
        }
        const element = TRuntime.getGraphics().getElement()

        element.removeEventListener('keydown', this.listenerKeyDown, false)
        element.removeEventListener('keyup', this.listenerKeyUp, false)

        this.keyboardEnabled = false
    }

    /**
     * Checks which keys are down and execute associated commands.
     * @param {type} e
     */
    processKeyDown({keyCode}) {
        if (this.active) {
            const keycode = keyCode
            this.keys[keycode] = true
            this[TUtils.getkeyName(keycode)] = true
            if (this.waiting) {
                this.waiting = false
                this.synchronousManager.end()
            }
        }
    }

    /**
     * Checks which keys are up and execute associated commands.
     * @param {type} e
     */
    processKeyUp({keyCode}) {
        if (this.active) {
            const keycode = keyCode
            this.keys[keycode] = false
            this[TUtils.getkeyName(keycode)] = false
        }
    }

    /**
     * Enable or disable keyboard depending on value, and freeze it.
     * @param {Boolean} value
     */
    freeze(value) {
        if (value) {
            this.disableKeyboard()
        } else {
            this.enableKeyboard()
        }
        super.freeze(value)
    }

    /**
     * Wait for a key to be typed
     */
    _wait() {
        this.waiting = true
        this.synchronousManager.begin()
    }

    /**
     * Detect if a given key is down
     * @param {String} key
     */
    _detect(key) {
        const keycode = this.getKeyCode(key)
        return (typeof this.keys[keycode] !== 'undefined' && this.keys[keycode])
    }

    freeze(value) {
        this.active = !value
    }

    initKeyNames() {
        if (typeof this.constructor.messages !== 'undefined') {
            const names = TUtils.getKeyNames()
            for (let i = 0;i < names.length;i++) {
                TRuntime.exposeProperty(this, names[i],this.getMessage(names[i]))
                this[names[i]] = false
            }
            this.keyNamesInitialized = true
        }
    }

    clear() {
        this.waiting = false
        this.keys = []
        const names = TUtils.getKeyNames()
        for (let i = 0;i < names.length;i++) {
            this[names[i]] = false
        }        
        this.synchronousManager.end()
    }

    init() {
        if (!this.keyNamesInitialized) {
            this.initKeyNames()
        }
        this.enableKeyboard()
    }
}

Keyboard.prototype.className = 'Keyboard'


const instance = new Keyboard()

export default instance
