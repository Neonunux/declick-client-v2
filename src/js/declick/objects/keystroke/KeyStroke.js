import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'
import CommandManager from '@/utils/CommandManager'
import SynchronousManager from '@/utils/SynchronousManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines KeyStroke, inherited from TObject.
 * Allows the association of commands with keyboard.
 * @exports KeyStroke
 */
class KeyStroke extends TObject {
    constructor() {
        super()
        this.commands = new CommandManager()
        this.active = true
        this.keyDown = false
        this.keyboardEnabled = false
        this.checkAllKeysUp = false
        this.keys = new Array()
        const that = this
        this.listenerKeyDown = e => {
            that.processKeyDown(e)
            e.preventDefault()
        }
        this.listenerKeyUp = e => {
            that.processKeyUp(e)
            e.preventDefault()
        }
        this.enableKeyboard()
        this.synchronousManager = new SynchronousManager()        
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
     * Associate a command to key.
     * @param {String} key
     * @param {String} command  Command triggered if key is pressed
     */
    _addCommand(key, command) {
        key = TUtils.getString(key)
        command = TUtils.getCommand(command)
        const keycode = this.getKeyCode(key)
        if (keycode !== false) {
            this.keys[keycode] = false
            this.commands.addCommand(command, `${keycode}_down`)
        }
        //TODO: find a better way
        if (!this.keyboardEnabled) {
            this.enableKeyboard()
        }
    }

    /**
     * Remove all commands associated to key.
     * @param {String} key
     */
    _removeCommands(key) {
        key = TUtils.getString(key)
        const keycode = this.getKeyCode(key)
        if (keycode !== false) {
            this.commands.removeCommands(`${keycode}_down`)
            if (!this.commands.hasCommands(`${keycode}up`)) {
                this.keys[keycode] = undefined
            }
        }
    }

    /**
     * Add a command when one, or all keys are released.
     * Have two purposes, depending on the number of parameters :
     * - 1 : "param1" will be executed if all keys are released.
     * - 2 : "param2" will be executed if the key "param1" is released.
     * @param {String} param1
     * @param {String} param2
     */
    _addCommandRelease(param1, param2) {
        let key
        let command
        if (typeof param2 !== 'undefined') {
            key = param1
            command = param2
        } else {
            command = param1
        }
        command = TUtils.getCommand(command)
        if (TUtils.checkString(key)) {
            // command to be launched when a given key is released
            const keycode = this.getKeyCode(key)
            if (keycode !== false) {
                this.keys[keycode] = false
                this.commands.addCommand(command, `${keycode}_up`)
            }
        } else {
            // command to be launched when all keys are released
            this.commands.addCommand(command, 'key_up_all')
            this.checkAllKeysUp = true
        }
        //TODO: find a better way
        if (!this.keyboardEnabled) {
            this.enableKeyboard()
        }
    }

    /**
     * Have two purposes, depending on the number of parameters :
     * - 0 : Remove all commands associated with the release of all keys.
     * - 1 : Remove all commands associated with the release of key.
     * @param {String} key
     */
    _removeCommandRelease(key) {
        if (TUtils.checkString(key)) {
            // remove commands to be launched when a given key is released
            const keycode = this.getKeyCode(key)
            if (keycode !== false) {
                this.commands.removeCommands(`${keycode}_up`)
                if (!this.commands.hasCommands(`${keycode}down`)) {
                    this.keys[keycode] = undefined
                }
            }
        } else {
            // remove commands to be launched when all keys are released
            this.commands.removeCommands('key_up_all')
            this.checkAllKeysUp = false
        }
    }

    /**
     * Enable the management of keys.
     */
    _activate() {
        this.active = true
    }

    /**
     * Disable the management of keys.
     */
    _deactivate() {
        if (this.active) {
            this.active = false
            for (const keycode in this.keys) {
                this.keys[keycode] = false
            }
        }
    }

    /**
     * Delete all commands associated to KeyStroke, and delete it.
     */
    deleteObject() {
        // remove listeners
        this.disableKeyboard()

        // delete commands
        for (const keycode in this.keys) {
            this.commands.removeCommands(`${keycode}_down`)
            this.commands.removeCommands(`${keycode}_up`)
        }
        this.commands.removeCommands('key_up_all')
        this.commands = undefined

        // delete keys
        this.keys.length = 0
        this.keys = undefined

        super.deleteObject()
    }

    /**
     * Checks which keys are down and execute associated commands.
     * @param {type} e
     */
    processKeyDown({keyCode}) {
        if (this.active) {
            if (this.waiting) {
                this.waiting = false
                this.synchronousManager.end()
            }            
            const keycode = keyCode
            this.commands.executeCommands({'field': `${keycode}_down`})
            this.keys[keycode] = true

        }
    }

    /**
     * Checks which keys are up and execute associated commands.
     * @param {type} e
     */
    processKeyUp({keyCode}) {
        if (this.active) {
            const keycode = keyCode
            this.commands.executeCommands({'field': `${keycode}_up`})
            this.keys[keycode] = false
            if (this.checkAllKeysUp) {
                for (const value in this.keys) {
                    if (this.keys[value]) {
                        // there is still a key down: we skip the test
                        return
                    }
                }
                this.commands.executeCommands({'field': 'key_up_all'})
            }
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
     * Enable or disable the display of commands.
     * @param {Boolean} value
     */
    _displayCommands(value) {
        value = TUtils.getBoolean(value)
        this.commands.logCommands(value)
    }
}

KeyStroke.prototype.className = 'KeyStroke'

export default KeyStroke
