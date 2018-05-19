import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines Clock, inherited from TObject.
 * A clock can execute commands after waiting a delay.
 * It can execute this commands endlessly or only one time.
 * @exports Clock
 */
class Clock extends TObject {
    constructor() {
        super()
        this.commands = new CommandManager()
        this.delay = 1000
        this.initialDelay = false
        this.running = false
        this.wasRunning = false
        this.timeout = null
        this.loop = true
        this.frozen = false
    }

    /**
     * Add a command to Clock.
     * @param {String} command
     */
    _addCommand(command) {
        command = TUtils.getCommand(command)
        this.commands.addCommand(command)
    }

    /**
     * Remove all commands to Clock.
     */
    _removeCommands() {
        this.commands.removeCommands()
    }

    /**
     * Set a Delay between the execution of two commands.
     * If no initial delay is defined, set it to the same value.
     * Default value : 1000 ms.
     * @param {Number} delay    (ms)
     */
    _setDelay(delay) {
        delay = TUtils.getInteger(delay)
        this.delay = delay
        if (this.initialDelay === false) {
            this._setInitialDelay(delay)
        }
    }

    /**
     * Set the initial Delay before the execution of the commands,
     * and after each loop.
     * @param {Number} delay    (ms)
     */
    _setInitialDelay(delay) {
        delay = TUtils.getInteger(delay)
        this.initialDelay = delay
    }

    /**
     * Start the execution of Clock.
     */
    _start() {
        if (!this.running) {
            this.running = true
            const self = this
            this.timeout = window.setTimeout(() => {
                self.executeActions()
            }, this.initialDelay)
        }
    }

    /**
     * Stop the execution of Clock.
     */
    _stop() {
        this.running = false
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout)
            this.timeout = null
        }
    }

    /**
     * Execute actions linked to Clock.
     */
    executeActions() {
        this.timeout = null
        if (this.running) {
            this.commands.executeCommands()
            if (this.loop) {
                const self = this
                this.timeout = window.setTimeout(() => {
                    self.executeActions()
                }, this.delay)
            } else {
                this._stop()
            }
        }
    }

    /**
     * Delete Clock.
     */
    deleteObject() {
        this._stop()
        super.deleteObject()
    }

    /**
     * Enable or disable loops for the execution of Clock.
     * Default value : true.
     * @param {Boolean} value
     */
    _loop(value) {
        value = TUtils.getBoolean(value)
        this.loop = value
    }

    /**
     * Freeze of unfreeze Clock.
     * @param {Boolean} value
     */
    freeze(value) {
        TObject.prototype.freeze.call(value)
        if (value !== this.frozen) {
            if (value) {
                this.wasRunning = this.running
                this._stop()
                this.frozen = true
            } else {
                if (this.wasRunning) {
                    this._start()
                }
                this.frozen = false
            }
        }
    }

    /**
     * Enable or disable the display of commands.
     * Default value : true.
     * @param {type} value
     */
    _displayCommands(value) {
        value = TUtils.getBoolean(value)
        this.commands.logCommands(value)
    }
}

Clock.prototype.className = 'Clock'

export default Clock
