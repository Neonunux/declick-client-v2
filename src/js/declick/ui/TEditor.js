import $ from 'jquery'

// require('ace-builds/src-noconflict/worker-javascript')
require('ace-builds/src-noconflict/ext-language_tools')
require('ace-builds/src-noconflict/mode-javascript')
require('ace-builds/src-noconflict/theme-twilight')
require('ace-builds/src-noconflict/ext-searchbox')

import ace from 'ace'
const ace_autocomplete = ace.require('ace/autocomplete').Autocomplete
const ace_range = ace.require('ace/range').Range


import TEnvironment from '@/env/TEnvironment'
import TComponent from '@/ui/TComponent'
import TUI from '@/ui/TUI'
import TUtils from '@/utils/TUtils'
import TRuntime from '@/run/TRuntime'

/**
 * TEditor manages the editor console. It runs with lib ace.
 * @param {Function} callback
 * @exports {TEditor}
 */
class TEditor extends TComponent {
    constructor(callback) {
        let $editor

        super({id: 'teditor'}, function(component) {
            $editor = component
            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })

        let aceEditor
        let codeChanged = false
        let program

        const AceEditSession = ace.EditSession
        const AceUndoManager = ace.UndoManager
        const AceRange = ace_range
        const AceAutocomplete = ace_autocomplete

        let errorMarker = null
        let disabled = false
        const disabledSession = new AceEditSession('')
        const disabledMessage = document.createElement('div')
        disabledMessage.id = 'disabled-message'
        const disabledP = document.createElement('p')
        const disabledText = TEnvironment.getMessage('editor-disabled')
        disabledP.appendChild(document.createTextNode(disabledText))
        disabledMessage.appendChild(disabledP)
        const $disabledMessage = $(disabledMessage)

        let popupTriggered = false
        let popupTimeout
        let triggerPopup = false
        let saveEnabled = false

        /**
         * Initialize Editor.
         */
        this.mounted = function() {
            aceEditor = ace.edit($editor.attr('id'))
            aceEditor.setShowPrintMargin(false)
            //aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize('20px')
            aceEditor.setHighlightActiveLine(false)
            aceEditor.setBehavioursEnabled(false)
            aceEditor.setTheme('ace/theme/twilight')
            aceEditor.$blockScrolling = Infinity

            const self = this
            aceEditor.on('input', () => {
                if (!program.isModified() && saveEnabled) {
                    program.setModified(true)
                    TUI.updateSidebarPrograms()
                    TUI.setSaveAvailable(true)
                }
                codeChanged = true
                self.removeError()
                if (triggerPopup) {
                    triggerPopup = false
                    popupTimeout = setTimeout(() => {
                        popupTriggered = false
                        AceAutocomplete.startCommand.exec(aceEditor)
                    }, 800)
                    popupTriggered = true
                } else if (popupTriggered) {
                    clearTimeout(popupTimeout)
                    popupTriggered = false
                }
            })
            aceEditor.commands.addCommand({
                name: 'save',
                bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
                exec(arg) {
                    if (saveEnabled) {
                        TUI.saveProgram()
                    }
                }
            })

            aceEditor.completers = [editorCompleter]
            aceEditor.setBehavioursEnabled(false)

            this.enableMethodHelper()

            // disable editor, waiting for a program to edit
            this.disable()
        }

        /**
         * Show Editor.
         */
        this.show = () => {
            $editor.show()
            aceEditor.focus()
        }

        /**
         * Hide Editor.
         */
        this.hide = () => {
            $editor.hide()
        }

        /**
         * Get code in Editor.
         * @returns {String}
         */
        this.getValue = () => {
            const simpleText = aceEditor.getSession().getValue()
            const protectedText = TUtils.addQuoteDelimiters(simpleText)
            const command = TUtils.parseQuotes(protectedText)
            return command
        }

        /**
         * Update Program & get statements of Program's code.
         * @returns {Statement[]}
         */
        this.getStatements = function() {
            this.updateProgram()
            return program.getStatements()
        }

        /**
         * Update Program's code.
         */
        this.updateProgram = function() {
            if (codeChanged) {
                program.setCode(this.getValue())
                codeChanged = false
            }
        }

        /**
         * Returns current Program.
         * @returns {TProgram}
         */
        this.getProgram = () => program

        /**
         * Set a Program.
         * @param {TProgram} value
         */
        this.setProgram = value => {
            program = value
            codeChanged = true
            TUI.setSaveAvailable(program.isModified())
        }

        /**
         * Returns Program's name.
         * @returns {String}
         */
        this.getProgramName = () => {
            if (disabled) {
                return false
            }
            return program.getName()
        }

        /**
         * Set Session.
         * @param {Session} session
         */
        this.setSession = session => {
            if (disabled) {
                aceEditor.setReadOnly(false)
                aceEditor.renderer.setShowGutter(true)
                $editor.removeClass('editor-disabled')
                $disabledMessage.remove()
                disabled = false
                TUI.setSaveEnabled(true)
            }
            aceEditor.setSession(session)
        }

        /**
         * Returns current Session.
         * @returns {Session}
         */
        this.getSession = () => aceEditor.getSession()

        /**
         * Reset current Session.
         */
        this.reset = () => {
            /*var undo = aceEditor.getSession().getUndoManager();
            undo.reset();*/
            codeChanged = false
        }

        /**
         * Brings the current `textInput` into focus.
         */
        this.giveFocus = () => {
            aceEditor.focus()
        }

        /**
         * Disable Editor.
         */
        this.disable = () => {
            aceEditor.setSession(disabledSession)
            aceEditor.setReadOnly(true)
            aceEditor.renderer.setShowGutter(false)
            $editor.addClass('editor-disabled')
            $editor.append($disabledMessage)
            TUI.setSaveEnabled(false)
            disabled = true
        }

        /**
         * Remove error marker.
         */
        this.removeError = () => {
            if (errorMarker !== null) {
                aceEditor.getSession().removeMarker(errorMarker)
                errorMarker = null
            }
        }

        /**
         * Set an error on a line or a range of lines :
         * - One number : Set an error on lines[0]
         * - Two numbers : Set an error on lines[0] to lines[1]
         * @param {Number[]} lines
         */
        this.setError = function(lines) {
            this.removeError()
            let range
            if (lines.length > 1) {
                range = new AceRange(lines[0] - 1, 0, lines[1] - 1, 100)
                errorMarker = aceEditor.getSession().addMarker(range, 'declick_error', 'line', true)
            } else if (lines.length > 0) {
                range = new AceRange(lines[0] - 1, 0, lines[0] - 1, 100)
                errorMarker = aceEditor.getSession().addMarker(range, 'declick_error', 'line', true)
            }
            aceEditor.navigateTo(lines[0] - 1, 0)
            // In a timer, because otherwise does not seem to work when editor mode has just been activated
            setTimeout(() => {
                aceEditor.scrollToLine(lines[0] - 1, true, true, null)
            }, 100)
        }

        /**
         * Create a new session.
         * @param {TProgram} program
         * @returns {Session}
         */
        this.createSession = program => {
            const session = new AceEditSession(program.getCode())
            session.setMode('ace/mode/javascript')
            session.setUndoManager(new AceUndoManager())
            // Disable JSHint
            session.setUseWorker(false)
            return session
        }

        /**
         * Enable helping methods.
         */
        this.enableMethodHelper = () => {
            aceEditor.commands.addCommand(dotCommand)
            aceEditor.commands.addCommand(backspaceCommand)
            aceEditor.commands.addCommand(AceAutocomplete.startCommand)
        }

        /**
         * Disable helping methods.
         */
        this.disableMethodHelper = () => {
            aceEditor.commands.removeCommand(dotCommand)
            aceEditor.commands.removeCommand(backspaceCommand)
            aceEditor.commands.removeCommand(AceAutocomplete.startCommand)
        }

        /**
         * Enable or disable the edition.
         * @param {Boolean} value
         */
        this.setSaveEnabled = value => {
            saveEnabled = value
        }

        /**
         * Resize the ACE editor according to its container's height
         */
        this.resize = () => {
            aceEditor.resize()
        }

        var editorCompleter = {
            getCompletions(editor, session, pos, prefix, callback) {
                pos.column--
                let token = session.getTokenAt(pos.row, pos.column)
                const endToken = '('

                if (token === null) {
                    return false
                }

                const tokens = session.getTokens(pos.row)
                const index = token.index

                // TODO: see if we can handle this situation in js
                /*if (token.type === "rparen") {
                 // Right parenthesis: try to find actual identifier
                 while (index >0 & token.type !== "identifier") {
                 index--;
                 token = tokens[index];
                 }
                 endToken = "[";
                 }*/
                if (token.type !== 'identifier' && token.type !== 'text' && token.type !== 'string' && token.type !== 'keyword') {
                    return false
                }

                let name = token.value.trim()

    // Class completion
                if (name === 'new') {
                    //TODO: get real classes
                    const classNames = ['Animation', 'Héros',
                        'CommandesClavier', 'Bloc', 'Item']
                    methodNames = TUtils.sortArray(classNames)

                    var completions = []
                    for (var j = 0; j < methodNames.length; j++) {
                        completions.push({
                            caption: methodNames[j],
                            value: `${methodNames[j]}()`
                        })
                    }
                    callback(null, completions)
                    return
                }
                for (let i = index - 1; i >= 0; i--) {
                    token = tokens[i]
                    if (token.type !== 'identifier' && token.type !== 'text' && token.type !== 'string') {
                        break
                    }
                    const part = token.value.trim()
                    if (part.length === 0) {
                        break
                    }
                    name = part + name
                }
                if (name.length === 0) {
                    return false
                }

                const lastcar = name.slice(name.length - 1, name.length)
                const lastlastcar = name.slice(name.length - 2, name.length - 1)
                const firstcar = name.slice(0, 1)

                if (token.type === 'text') {
                    // Remove first simple/double quote
                    if (firstcar === '"' || firstcar === '\'') {
                        name = name.slice(1, name.length) // "r. -> r.
                    }
                    // remove dot caracter
                    if (lastcar === '.') {
                        name = name.slice(0, name.length - 1) // "r. -> r
                    }
                    // remove dot caracter and simple/double quote
                    if (lastlastcar === '.' && (lastcar === '"' || firstcar === '\'')) {
                        name = name.slice(0, name.length - 2) // "r" -> r
                    }
                    // remove simple/double quote when string extracted hasn't "
                    if (lastlastcar !== '.' && (lastcar === '"' || firstcar === '\'')) {
                        name = name.slice(0, name.length - 1) // "r.") -> r
                    }
                }

                const range = new AceRange(0, 0, pos.row, pos.column)
                const valueBefore = session.getDocument().getTextRange(range)
                // Since regex do not support unicode...
                const unicodeName = TUtils.toUnicode(name)
                const regex = new RegExp(`(?:^|\\s)${unicodeName}\\s*=\\s*new\\s*([\\S^\\${endToken}]*)\\s*\\${endToken}`)

                let result = regex.exec(valueBefore)

                var completions = []

                if (name == 'declick') {
                    // result[1] is the important part
                    result = [name, name]
                }
                if (result !== null && result.length > 0) {
                    const className = result[1]
                    const methods = TRuntime.getClassTranslatedMethods(className)
                    var methodNames = Object.keys(methods)
                    methodNames = TUtils.sortArray(methodNames)
                    for (var j = 0; j < methodNames.length; j++) {
                        completions.push({
                            caption: methodNames[j],
                            value: methods[methodNames[j]]
                        })
                    }
                }

                callback(null, completions)
            }
        }

        var dotCommand = {
            name: 'methodHelper',
            bindKey: {win: '.', mac: '.'},
            exec(editor) {
                triggerPopup = true
                return false // let default event perform
            },
            readOnly: true // false if this command should not apply in readOnly mode
        }

        var backspaceCommand = {
            name: 'methodHelper2',
            bindKey: {win: 'Backspace', mac: 'Backspace'},
            exec(editor) {
                const cursor = editor.selection.getCursor()
                const token = editor.getSession().getTokenAt(cursor.row, cursor.column - 1)
                if (token !== null && token.type === 'punctuation.operator' && token.value === '.') {
                    triggerPopup = true
                }
                return false
            },
            readOnly: true // false if this command should not apply in readOnly mode
        }
    }
}

export default TEditor
