import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TLink from '@/env/TLink'
import TRuntime from '@/run/TRuntime'
import TObject from '@/objects/tobject/TObject'
import TUI from '@/ui/TUI'
import CommandManager from '@/utils/CommandManager'
import SynchronousManager from '@/utils/SynchronousManager'
import TError from '@/utils/TError'
import TUtils from '@/utils/TUtils'

/**
 * Defines Declick, inherited from TObject.
 * Declick is an object created automatically with the launch of Declick.
 * It allows several interactions.
 * @exports Declick
 */
class Declick extends TObject {
    constructor() {
        super()
        this.synchronousManager = new SynchronousManager()
        TRuntime.addInstance(this)
        this._interruptions = []
    }

    clear() {
        this._maskGrid()
    }

    _displayGrid() {
        TRuntime.getGraphics().displayGrid()
    }

    _maskGrid() {
        TRuntime.getGraphics().maskGrid()
    }

    delay(callback, arguments_, duration) {
        if (typeof duration === 'undefined') {
            duration = arguments_
        }
        const context = this
        const identifier = window.setTimeout(() => {
            const index = context._interruptions.indexOf(identifier)
            context._interruptions.splice(index, 1)
            callback()
        }, duration)
        this._interruptions.push(identifier)
    }

    loop(callback) {
        const loop = new CommandManager()
        loop.addCommand(callback)
        let previousTime = Date.now()
        let currentTime
        const context = this
        const repeater = () => {
            currentTime = Date.now()
            const delay = currentTime - previousTime
            loop.executeCommands({parameters: [delay]})
            previousTime = currentTime
            context.delay(repeater, 0)
        }
        repeater()
    }

    /**
     * Write "value" in logs.
     * @param {String} value
     */
    _write(value) {
        if (TUtils.checkInteger(value)) {
            value = value.toString()
        } else {
            value = TUtils.getString(value)
        }

        TUI.addLogMessage(value)
    }

    /**
     * Write "value" in a pop-up window.
     * @param {String} value
     */
    _alert(value) {
        if (TUtils.checkInteger(value)) {
            value = value.toString()
        } else {
            value = TUtils.getString(value)
        }
        const canvas = TUI.getCanvas()
        if (typeof canvas !== 'undefined') {
            this.synchronousManager.begin()
            const self = this
            canvas.popup(value, () => {
                self.synchronousManager.end()
            })
        }
        //window.alert(value);
    }

    /**
     * Load a script given in parameter.
     * @param {String} name
     */
    _loadScript(name) {
        name = TUtils.getString(name)
        this.synchronousManager.begin()
        TRuntime.refusePriorityStatements()
        const sm = this.synchronousManager
        TLink.getProgramStatements(name, statements => {
            if (statements instanceof TError) {
                sm.end()
                TRuntime.allowPriorityStatements()
                TRuntime.handleError(statements)
            }
            const statement = TRuntime.createCallStatement(TRuntime.createFunctionStatement(statements.body))
            TRuntime.insertStatement(statement)
            sm.end()
            TRuntime.allowPriorityStatements()
        })
    }

    /**
     * Clear screen, commands history and console.
     */
    _init() {
        TRuntime.clearGraphics()
        TRuntime.clearObjects()
        for (let index = 0; index < this._interruptions.length; index++) {
            const interruption = this._interruptions[index]
            window.clearTimeout(interruption)
        }
        this._interruptions = []
    }

    /**
     * Clear screen.
     */
    _clearScreen() {
        TRuntime.clearGraphics()
    }

    /**
     * Pause Declick. Freeze every object.
     */
    _pause() {
        TRuntime.stop()
    }

    /**
     * Resume Declick.
     */
    _unpause() {
        TRuntime.start()
    }

    /**
     * Wait for a given duration
     * @param {Integer} duration
     */
    _wait(duration) {
        duration = TUtils.getInteger(duration)
        const self = this
        window.setTimeout(() => {
            self.synchronousManager.end()
        }, duration)
        this.synchronousManager.begin()
    }

    /**
     * Ask a question and get the answer.
     * @param {String} text
     * @returns {String}    Returns the user's answer.
     */
    _ask(text) {
        const answer = window.prompt(text)
        if (answer === null || answer.length === 0)
            {return false}
        else
            {return answer}
    }

    /**
     * Interrupt execution
     */
    _interrupt() {
        TRuntime.interrupt()
    }

    freeze(value) {
    }

    clear() {
        this.synchronousManager.end()
    }

    init() {
    }
}

Declick.prototype.className = 'Declick'

const declickInstance = new Declick()

export default declickInstance
