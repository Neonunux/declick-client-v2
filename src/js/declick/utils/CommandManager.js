import TLink from '@/env/TLink'
import TEnvironment from '@/env/TEnvironment'
import TParser from '@/run/TParser'
import TRuntime from '@/run/TRuntime'
import TUtils from '@/utils/TUtils'

/**
 *
 * @exports CommandManager
 */
class CommandManager {
    constructor() {
        this.commands = []
        this.enabled = {}
        this.enabled._default = true
        this.logging = true
    }

    /**
     * Add a new command.
     * @param {String} command  Command to be added
     * @param {String} field  Field associated to the command ; can be empty
     */
    addCommand(command, field) {
        let i

        const self = this

        const pushCommand = (command, field) => {
            if (typeof field === 'undefined') {
                // simple command provided
                for (i = 0; i < command.length; i++) {
                    self.commands.push(command[i])
                }
            }
            else {
                // command with associated field
                if (typeof self.commands[field] === 'undefined') {
                    self.commands[field] = []
                    self.enabled[field] = true
                }
                for (i = 0; i < command.length; i++) {
                    self.commands[field].push(command[i])
                }
            }
        }

        if (TUtils.checkString(command)) {
            // command is a string: we check if it is the name of a program
            const project = TEnvironment.getProject()
            let statements
            if (project.hasProgram(command)) {
                TLink.getProgramStatements(command, ({body}) => {
                    const command = TRuntime.createCallStatement(TRuntime.createFunctionStatement(body))
                    pushCommand(command, field)
                }, false)
            }
            else {
                // Not the name of a program: we parse it
                command = TParser.parse(command).body
                pushCommand(command, field)
            }
        }
        else if (TUtils.checkFunction(command)) {
            command = TRuntime.createCallStatement(command)
            pushCommand(command, field)
        }
        else {
            pushCommand(command, field)
        }
    }

    /**
     * Removes all commands of field,
     * or all simples commands if field is undefined.
     * @param {String} field
     */
    removeCommands(field) {
        if (typeof field === 'undefined') {
            this.commands.length = 0
        }
        else if (typeof this.commands[field] !== 'undefined') {
            this.commands[field] = undefined
        }
    }

    /**
     * Execute commands, depending of parameters.
     * @param {String[]} parameters
     */
    executeCommands(parameters, allowSimultaneousExecutions) {
        if (typeof allowSimultaneousExecutions === 'undefined') {
            allowSimultaneousExecutions = false
        }

        // TODO: handle parameters
        let i

        let cmdParameters
        let field
        const self = this
        if (typeof parameters !== 'undefined') {
            if (typeof parameters.field !== 'undefined') {
                field = parameters.field
            }
            if (typeof parameters.parameters !== 'undefined') {
                cmdParameters = parameters.parameters
            }
        }
        if (typeof field === 'undefined') {
            if (allowSimultaneousExecutions) {
                TRuntime.executeNow(this.commands, cmdParameters, this.logging)
            }
            else if (this.enabled._default) {
                this.enabled._default = false
                TRuntime.executeNow(this.commands, cmdParameters, this.logging, () => {
                    self.enabled._default = true
                })
            }
        }
        else if (typeof this.commands[field] !== 'undefined') {
            if (allowSimultaneousExecutions) {
                TRuntime.executeNow(this.commands[field], cmdParameters, this.logging)
            }
            else if (this.enabled[field]) {
                this.enabled[field] = false
                TRuntime.executeNow(this.commands[field], cmdParameters, this.logging, () => {
                    self.enabled[field] = true
                })
            }
        }
    }

    /**
     * Check if field has associated commands.
     * If field is empty, check if there is simple commands.
     * @param {type} field
     * @returns {Boolean}   Returns true if at least one command is found,
     * else false.
     */
    hasCommands(field) {
        if (typeof field === 'undefined') {
            return this.commands.length > 0
        }
        else {
            return ((typeof this.commands[field] !== 'undefined') && (this.commands[field].length > 0))
        }
    }

    /**
     * Enable or disable the log of commands.
     * Default value : true.
     * @param {Boolean} value
     */
    logCommands(value) {
    this.logging = value
    }
}

export default CommandManager
