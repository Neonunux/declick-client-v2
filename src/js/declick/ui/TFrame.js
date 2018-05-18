import $ from 'jquery'
import SplitPane from 'split-pane'

import TEnvironment from '@/env/TEnvironment'
import TCanvas from '@/ui/TCanvas'
import TConsole from '@/ui/TConsole'
import TComponent from '@/ui/TComponent'
import TEditor from '@/ui/TEditor'
import THints from '@/ui/THints'
import TLog from '@/ui/TLog'
import TMessage from '@/ui/TMessage'
import TSidebar from '@/ui/TSidebar'
import TToolbar from '@/ui/TToolbar'
import TUI from '@/ui/TUI'
import TRuntime from '@/run/TRuntime'

class TFrame extends TComponent {
    constructor(callback) {
        let initialized = false
        let canvas
        let editor
        let sidebar
        let toolbar
        let console
        let log
        let message
        let $frame
        let $main
        let $top
        let $separator
        let $bottom
        let $loading

        const frame = this
        let separatorEnabled = true
        let currentToken = ''
        let currentId = null

        super('TFrame.html', component => {
            const waiting = ['canvas', 'editor', 'sidebar', 'toolbar', 'console', 'log', 'message']

            const checkWaiting = function(name) {
                const i = waiting.indexOf(name)
                if (i > -1) {
                    waiting.splice(i, 1)
                }
                if (waiting.length === 0) {
                    if (typeof callback !== 'undefined') {
                        callback.call(this, component)
                    }
                }
            }

            $frame = component
            $main = component.find('#tframe-main')
            $top = component.find('#tframe-top')
            $separator = component.find('#tframe-separator')
            $bottom = component.find('#tframe-bottom')
            $loading = component.find('#tframe-loading')
            const loadingText = $loading.find('p')
            loadingText.text(TEnvironment.getMessage('loading-message'))

            THints.loadHints('hints_create.json')

            canvas = new TCanvas(c => {
                component.find('#TCanvas').replaceWith(c)
                checkWaiting('canvas')
            })
            editor = new TEditor(c => {
                component.find('#TEditor').replaceWith(c)
                checkWaiting('editor')
            })
            sidebar = new TSidebar(c => {
                component.find('#TSidebar').replaceWith(c)
                checkWaiting('sidebar')
            })
            toolbar = new TToolbar(c => {
                component.find('#TToolbar').replaceWith(c)
                checkWaiting('toolbar')
            })
            console = new TConsole(c => {
                component.find('#TConsole').replaceWith(c)
                checkWaiting('console')
            })
            log = new TLog(c => {
                component.find('#TLog').replaceWith(c)
                checkWaiting('log')
            })
            message = new TMessage(c => {
                component.find('#TMessage').replaceWith(c)
                checkWaiting('message')
            })

        })

        const checkSeparatorEnabled = event => {
            if (!separatorEnabled) {
                event.stopImmediatePropagation()
            }
        }

        this.mounted = () => {
            // Set UI
            TUI.setFrame(frame)
            TUI.setCanvas(canvas)
            TUI.setEditor(editor)
            TUI.setSidebar(sidebar)
            TUI.setToolbar(toolbar)
            TUI.setConsole(console)
            TUI.setLog(log)
            TUI.setMessage(message)

            // Plug Runtime with Log
            TRuntime.setLog(log)

            canvas.mounted()
            editor.mounted()
            sidebar.mounted()
            console.mounted()
            toolbar.mounted()
            log.mounted()
            $main.on('splitpane:resized', () => {
                editor.resize()
            })
            // Important to attach handler before calling splitPane
            $separator.on('mousedown', checkSeparatorEnabled)
            const initEditor = () => {
                $(window).off('resize', initEditor)
                if ($frame.height() > 0) {
                    $('.split-pane').splitPane()
                    initialized = true
                    // init separator position so that toolbar is visible
                    TUI.enableEditor(false)
                    $loading.fadeOut(1000, function() {
                        $(this).remove()
                    })
                    // set init function to be launched whenever frame parameters (ie access token) change
                    TEnvironment.registerParametersHandler((parameters, callback) => {
                        let initRequired = false
                        let idSet = false
                        for (const name in parameters) {
                            if (name === 'editor') {
                                const editor = (parameters['editor'] == 'true')
                                if (editor) {
                                    TUI.enableEditor(false)
                                }
                                else {
                                    TUI.disableEditor(false)
                                }
                            }
                            if (name === 'id') {
                                idSet = true
                                if (currentId != parameters['id']) {
                                    currentId = parameters['id']
                                    initRequired = true
                                }
                            }
                            if (name === 'token') {
                                if (currentToken != parameters['token']) {
                                    currentToken = parameters['token']
                                    initRequired = true
                                }
                            }
                            if (name === 'wiki') {
                                const wiki = (parameters['wiki'] == 'true')
                                if (wiki) {
                                    TUI.enableWiki()
                                }
                                else {
                                    TUI.disableWiki()
                                }
                            }
                        }
                        if (!idSet) {
                            if (currentId !== null) {
                                initRequired = true
                            }
                            currentId = null
                        }
                        if (initRequired) {
                            TUI.init(currentId)
                        }
                    })
                    TEnvironment.registerMessagesHandler(message => {
                        if (message == 'init') {
                            TUI.init(currentId)
                        }
                    })
                }
                else {
                    $(window).resize(initEditor)
                }
            }
            initEditor()
        }

        this.setSeparatorPosition = value => {
            $top.css('bottom', value)
            $top.css('color', 'blue')
            $separator.css('bottom', value)
            $bottom.css('height', value)
            $frame.resize()
        }

        this.lowerSeparator = function(value) {
            if (initialized) {
                const totalHeight = $frame.height()
                const currentBottom = totalHeight - ($separator.position().top + $separator.height())
                const newBottom = `${(currentBottom - value) * 100 / totalHeight}%`
                this.setSeparatorPosition(newBottom)
            }
        }

        this.raiseSeparator = function(value) {
            this.lowerSeparator(-value)
        }

        this.disableSeparator = () => {
            separatorEnabled = false
            $separator.addClass('disabled')
        }

        this.enableSeparator = () => {
            separatorEnabled = true
            $separator.removeClass('disabled')
        }

        // Declare global functions

        /*if (typeof window.isUnsaved === 'undefined') {
            window.isUnsaved = function() {
                return TEnvironment.getProject().isUnsaved();
            };
        }*/
    }
}

export default TFrame
