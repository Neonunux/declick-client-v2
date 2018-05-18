import TObject from '@/objects/tobject/TObject'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines Sequence, inherited from TObject.
 * A sequence can save commands, with or without a delay between,
 * then execute them one after another.
 * It can execute commands endlessly or only one time.
 * @exports Sequence
 */
class Sequence extends TObject {
    constructor() {
        super()
        this.actions = new Array()
        this.index = -1
        this.running = false
        this.frozen = false
        this.timeout = null
        this.loop = false
        this.wasRunning = false
        this.logCommands = true
    }

    /**
     * Add a command to Sequence.
     * @param {String} command
     */
    _addCommand(command) {
        command = TUtils.getCommand(command)
        if (this.actions.length > 0 && this.actions[this.actions.length - 1].type === Sequence.TYPE_COMMAND) {
            var cm = this.actions[this.actions.length - 1].value
            cm.addCommand(command)
        } else {
            var cm = new CommandManager()
            cm.addCommand(command)
            this.actions.push({type: Sequence.TYPE_COMMAND, value: cm})
        }
    }

    /**
     * Add a delay between commands.
     * @param {Number} delay    (ms)
     */
    _addDelay(delay) {
        delay = TUtils.getInteger(delay)
        this.actions.push({type: Sequence.TYPE_DELAY, value: delay})
    }

    /**
     * Execute the next command of Sequence (after waiting if there's a delay).
     */
    nextAction() {
        this.timeout = null
        this.index++
        if (this.actions.length > 0 && this.running) {
            if (this.index >= this.actions.length) {
                if (this.loop) {
                    this.index = 0
                } else {
                    // last action reached: we stop here
                    this.running = false
                    return
                }
            }
            const action = this.actions[this.index]
            if (action.type === Sequence.TYPE_COMMAND) {
                // execute commands
                const cm = action.value
                cm.logCommands(this.logCommands)
                cm.executeCommands()
                this.nextAction()
            } else if (action.type === Sequence.TYPE_DELAY) {
                const self = this
                this.timeout = window.setTimeout(() => {
                    self.nextAction()
                }, action.value)
            }
        }
    }

    /**
     * Start the execution of Sequence.
     * If Sequence is already running, restart it.
     */
    _start() {
        if (this.running) {
            // Sequence is already running: restart it
            this._stop()
        }
        this.running = true
        this.index = -1
        this.nextAction()
    }

    /**
     * Stop the execution of Sequence.
     */
    _stop() {
        this.running = false
        this.index = -1
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout)
            this.timeout = null
        }
    }

    /**
     * Pause the execution of Sequence. It can resume after.
     */
    _pause() {
        this.running = false
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout)
            this.timeout = null
        }
    }

    /**
     * Resume the execution of Sequence.
     */
    _unpause() {
        this.running = true
        this.nextAction()
    }

    /**
     * Delete Sequence.
     */
    deleteObject() {
        this._stop()
        super.deleteObject()
    }

    /**
     * Enable or disable loops for the execution of Sequence.
     * If it enable it, check the total delay of a loop.
     * If it's under the delay of MINIMUM_LOOP, throw a freeze warning.
     * Default value : false.
     * @param {Boolean} value
     */
    _loop(value) {
        value = TUtils.getBoolean(value)
        if (value) {
            // WARNING: in order to prevent Declick from freezing, check that there is at least a total delay of MINIMUM_LOOP in actions
            let totalDelay = 0
            for (let i = 0; i < this.actions.length; i++) {
                const action = this.actions[i]
                if (action.type === Sequence.TYPE_DELAY) {
                    totalDelay += action.value
                }
            }
            if (totalDelay < Sequence.MINIMUM_LOOP) {
                throw new Error(this.getMessage('freeze warning', Sequence.MINIMUM_LOOP))
            }
        }
        this.loop = value
    }

    /**
     * Freeze or unfreeze Sequence.
     * @param {Boolean} value
     */
    freeze(value) {
        TObject.prototype.freeze.call(value)
        if (value !== this.frozen) {
            if (value) {
                this.wasRunning = this.running
                this._pause()
                this.frozen = true
            } else {
                if (this.wasRunning) {
                    this._unpause()
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
        this.logCommands = value
    }
}

Sequence.prototype.className = 'Sequence'

Sequence.TYPE_COMMAND = 0x01
Sequence.TYPE_DELAY = 0x02
Sequence.MINIMUM_LOOP = 100

export default Sequence
