import $ from 'jquery'

import ace from 'ace'

// import * as ace from 'ace-builds/src-noconflict/ace'
// import 'ace-builds/src-noconflict/worker-javascript'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-twilight'
import 'ace-builds/src-noconflict/ext-searchbox'

const ace_autocomplete = ace.require('ace/autocomplete').Autocomplete
const ace_range = ace.require('ace/range').Range

import TEnvironment from '@/env/TEnvironment'
import TComponent from '@/ui/TComponent'
import TLog from '@/ui/TLog'
import TUI from '@/ui/TUI'
import TUtils from '@/utils/TUtils'
import TParser from '@/run/TParser'
import TRuntime from '@/run/TRuntime'

/**
 * TConsole manages the console for Declick's users. It runs with lib ace.
 * @param {Function} callback
 * @exports {TConsole}
 */
class TConsole extends TComponent {
    constructor(callback) {
        let $console
        let $consoleText

        super('TConsole.html', function(component) {
            $console = component
            $consoleText = component.find('#tconsole-text')
            const buttonExecute = component.find('#tconsole-play')
            buttonExecute.attr('title', TEnvironment.getMessage('button-execute'))
            buttonExecute.click(e => {
                TUI.execute()
            })

            const buttonClear = component.find('#tconsole-clear')
            buttonClear.attr('title', TEnvironment.getMessage('option-clear'))
            buttonClear.click(e => {
                TUI.clear(true)
            })

            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })

        const AceRange = ace_range
        const AceAutocomplete = ace_autocomplete

        let aceEditor
        let currentCommand
        let currentPosition
        let computedHeight = -1
        let browsingHistory = false

        let popupTriggered = false
        let popupTimeout
        let triggerPopup = false

        this.mounted = function() {
            aceEditor = ace.edit($consoleText.attr('id'))
            aceEditor.getSession().setMode('ace/mode/javascript')
            // Disable JSHint
            aceEditor.getSession().setUseWorker(false)
            aceEditor.setShowPrintMargin(false)
            aceEditor.renderer.setShowGutter(false)
            aceEditor.setFontSize('20px')
            aceEditor.setHighlightActiveLine(false)
            aceEditor.setTheme('ace/theme/twilight')
            aceEditor.$blockScrolling = Infinity
            aceEditor.on('input', () => {
                if (triggerPopup) {
                    triggerPopup = false
                    popupTimeout = setTimeout(() => {
                        popupTriggered = false
                        // Force Ace popup to not add gutter width when computing popup pos
                        // since gutter is not shown
                        aceEditor.renderer.$gutterLayer.gutterWidth = 0
                        AceAutocomplete.startCommand.exec(aceEditor)
                    }, 800)
                    popupTriggered = true
                }
                else if (popupTriggered) {
                    clearTimeout(popupTimeout)
                    popupTriggered = false
                }
            })

            aceEditor.commands.addCommand({
                name: 'executeCommand',
                bindKey: { win: 'Return', mac: 'Return' },
                exec(editor) {
                    // postpone execution due to a bug in Firefox handling synchronous ajax when in a keyboard event
                    // (insert new line)
                    window.setTimeout(() => {
                        TUI.execute()
                    }, 0)
                },
                readOnly: true // false if this command should not apply in readOnly mode
            })
            aceEditor.commands.addCommand({
                name: 'browseHistoryUp',
                bindKey: { win: 'Up', mac: 'Up' },
                exec(editor) {
                    const history = TUI.getPreviousRow()
                    if (history !== null) {
                        if (!browsingHistory) {
                            currentCommand = editor.getValue()
                            currentPosition = editor.getCursorPosition()
                            browsingHistory = true
                        }
                        editor.setValue(history)
                        editor.navigateLineEnd()
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
            })
            aceEditor.commands.addCommand({
                name: 'browsehistoryDown',
                bindKey: { win: 'Down', mac: 'Down' },
                exec(editor) {
                    if (browsingHistory) {
                        const history = TUI.getNextRow()
                        if (history !== null) {
                            editor.setValue(history)
                            editor.navigateLineEnd()
                        }
                        else {
                            // end of history reached
                            editor.setValue(currentCommand)
                            editor.navigateTo(currentPosition.row, currentPosition.column)
                            browsingHistory = false
                        }
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
            })
            aceEditor.commands.addCommand({
                name: 'returnToCurrentCommand',
                bindKey: { win: 'Escape', mac: 'Escape' },
                exec(editor) {
                    if (browsingHistory) {
                        editor.setValue(currentCommand)
                        editor.navigateTo(currentPosition.row, currentPosition.column)
                        TUI.setLastRow()
                        browsingHistory = false
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
            })

            aceEditor.completers = [consoleCompleter]

            this.enableMethodHelper()

        }

        /**
         * Returns code in Console.
         * @returns {String}
         */
        this.getValue = () => {
            const simpleText = aceEditor.getSession().getValue()
            const protectedText = TUtils.addQuoteDelimiters(simpleText)
            const command = TUtils.parseQuotes(protectedText)
            return command
        }

        /**
         * Set code in Console to value.
         * @param {String} value
         */
        this.setValue = value => {
            aceEditor.getSession().setValue(value)
            // set cursor to the end of line
            aceEditor.gotoPageDown()
        }

        /**
         * Brings the current `textInput` into focus.
         */
        this.focus = () => {
            aceEditor.focus()
        }

        /**
         * Returns statements of Console's code.
         * @returns {Statement[]}
         */
        this.getStatements = function() {
            return TParser.parse(this.getValue())
        }

        /**
         * Clear Console.
         */
        this.clear = () => {
            aceEditor.setValue('')
            browsingHistory = false
        }

        /**
         * Show Console.
         */
        this.show = () => {
            $console.show()
            aceEditor.focus()
        }

        /**
         * Hide Console.
         */
        this.hide = () => {
            if (computedHeight === -1) {
                computedHeight = $console.outerHeight(false)
            }
            $console.hide()
        }

        /**
         * Get Console's height.
         * @returns {Number}
         */
        this.getHeight = () => {
            if (computedHeight === -1) {
                computedHeight = $console.outerHeight(false)
            }
            return computedHeight
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

        var consoleCompleter = {
            getCompletions(editor, session, pos, prefix, callback) {
                pos.column--
                let token = session.getTokenAt(pos.row, pos.column)

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

                if (token.type !== 'identifier' && token.type !== 'text' && token.type !== 'keyword' && token.type !== 'string') {
                    return false
                }

                let name = token.value.trim()

                for (let i = index - 1; i >= 0; i--) {
                    token = tokens[i]
                    if (token.type !== 'identifier' && token.type !== 'text') {
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

                /* var className = TRuntime.getTObjectClassName(name);
                var methods = TEnvironment.getClassMethods(className);*/
                const methods = TRuntime.getTObjectTranslatedMethods(name)
                let methodNames = Object.keys(methods)
                methodNames = TUtils.sortArray(methodNames)

                const completions = []
                for (let j = 0; j < methodNames.length; j++) {
                    completions.push({
                        caption: methodNames[j],
                        value: methods[methodNames[j]]
                    })
                }
                callback(null, completions)
            }
        }

        var dotCommand = {
            name: 'methodHelper',
            bindKey: { win: '.', mac: '.' },
            exec(editor) {
                triggerPopup = true
                return false // let default event perform
            },
            readOnly: true // false if this command should not apply in readOnly mode
        }

        var backspaceCommand = {
            name: 'methodHelper2',
            bindKey: { win: 'Backspace', mac: 'Backspace' },
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
        //        var classCommand = {
        //            name: "classHelper",
        //            bindKey: {win: 'Space', mac: 'Space'},
        //            exec: function (editor) {
        //                var cursor = editor.selection.getCursor();
        //                var token = editor.getSession().getTokenAt(cursor.row, cursor.column - 1);
        //
        //                if (token !== null && token.type === "keyword" && token.value === "new") {
        //                    triggerPopup = true;
        //                }
        //                return false;
        //            },
        //            readOnly: true // false if this command should not apply in readOnly mode
        //        };
    }
}

export default TConsole
