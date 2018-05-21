import $ from 'jquery'

import TRuntime from '@/run/TRuntime'
import TEnvironment from '@/env/TEnvironment'
import THints from '@/components/THints'
import TError from '@/utils/TError'

class TUI {
    constructor() {
        let frame
        let canvas
        let editor
        let sidebar
        let toolbar
        let console
        let editorEnabled = false
        let consoleDisplayed = true
        let designModeEnabled = false
        let floatingControllerEnabled = false
        let programsDisplayed = true
        let resourcesDisplayed = false
        let log
        let message
        this.setFrame = element => {
            frame = element
            return
        }
        this.setCanvas = element => {
            canvas = element
            return
        }
        this.setEditor = element => {
            editor = element
            return
        }
        this.setSidebar = element => {
            sidebar = element
            return
        }
        this.setLog = element => {
            log = element
            return
        }
        this.setMessage = element => {
            message = element
            return
        }
        this.setToolbar = element => {
            toolbar = element
            return
        }
        this.setConsole = element => {
            console = element
            return
        }
        this.setHints = element => {
            hints = element
            return
        }
        this.getCanvas = () => canvas
        this.getCanvasCursorX = () => canvas.getCursorX()
        this.getCanvasCursorY = () => canvas.getCursorY()
        this.hideConsole = function (hideLog) {
            //TODO: check if hideLog is still used?
            if (typeof hideLog === 'undefined') {
                hideLog = true
            }
            if (consoleDisplayed) {
                this.hideHints()
                toolbar.disableConsole()
                log.saveScroll()
                if (hideLog) {
                    log.hide()
                }
                console.hide()
                if (hideLog) {
                    frame.setSeparatorPosition(`${toolbar.getHeight()}px`)
                    frame.disableSeparator()
                } else {
                    frame.lowerSeparator(console.getHeight())
                }
                THints.setPage('preview')
                consoleDisplayed = false
            }
        }
        this.showConsole = function () {
            if (!consoleDisplayed) {
                this.hideHints()
                toolbar.enableConsole()
                console.show()
                if (designModeEnabled) {
                    // designMode enabled: disable it
                    this.disableDesignMode(false)
                    //frame.raiseSeparator(console.getHeight());
                    log.restoreScroll()
                    frame.raiseSeparator(console.getHeight())
                } else {
                    log.show()
                    frame.enableSeparator()
                    frame.raiseSeparator(log.getHeight() + console.getHeight())
                    log.restoreScroll()
                }
                THints.setPage('preview-console')
                consoleDisplayed = true
            }
        }
        this.toggleConsole = function () {
            if (consoleDisplayed) {
                this.hideConsole()
            } else {
                this.showConsole()
            }
        }
        this.enableDesignMode = function () {
            if (!designModeEnabled) {
                this.hideHints()
                TRuntime.freeze(true)
                canvas.setDesignMode(true)
                TRuntime.setDesignMode(true)
                toolbar.enableDesignMode()
                if (consoleDisplayed) {
                    // log already displayed, with console: hide console
                    this.hideConsole(false)
                } else {
                    // log not displayed: show it
                    log.show()
                    frame.enableSeparator()
                    frame.raiseSeparator(log.getHeight())
                }
                log.showDesignLog()
                THints.setPage('preview-design')
                designModeEnabled = true
            }
        }
        this.disableDesignMode = function (hideLog) {
            if (typeof hideLog === 'undefined') {
                hideLog = true
            }
            if (designModeEnabled) {
                this.hideHints()
                TRuntime.freeze(false)
                canvas.setDesignMode(false)
                TRuntime.setDesignMode(false)
                toolbar.disableDesignMode()
                log.hideDesignLog()
                THints.setPage('preview')
                // TODO: check if hideLog is still used?
                if (hideLog) {
                    log.hide()
                    frame.lowerSeparator(log.getHeight())
                    frame.disableSeparator()
                }
                designModeEnabled = false
            }
        }
        this.enableFloatingController = function () {
            this.hideHints()
            canvas.enableFloatingController()
            toolbar.enableFloatingController()
            floatingControllerEnabled = true
        }
        this.disableFloatingController = function () {
            this.hideHints()
            canvas.disableFloatingController()
            toolbar.disableFloatingController()
            floatingControllerEnabled = false
        }
        this.toggleDesignMode = function () {
            if (designModeEnabled) {
                this.disableDesignMode()
            } else {
                this.enableDesignMode()
            }
        }
        this.toggleFloatingController = function () {
            if (floatingControllerEnabled) {
                this.disableFloatingController()
            } else {
                this.enableFloatingController()
            }
        }
        this.enableEditor = function (updateServer) {
            if (!editorEnabled) {
                // hide console
                this.hideConsole()
                // disable design mode
                this.disableDesignMode()
                toolbar.enableEditor()
                TRuntime.stop()
                this.hideHints()
                canvas.hide()
                editor.show()
                sidebar.show()
                THints.setPage('editor')
                editorEnabled = true
                if (typeof updateServer === 'undefined' || updateServer) {
                    if (typeof window.parent !== 'undefined') {
                        window.parent.postMessage('switchEditor', '*')
                    }
                }
            }
        }
        this.disableEditor = function (updateServer) {
            if (editorEnabled) {
                toolbar.disableEditor()
                editor.hide()
                sidebar.hide()
                this.hideHints()
                canvas.show()
                canvas.resize()
                THints.setPage('preview')
                editorEnabled = false
                if (typeof updateServer === 'undefined' || updateServer) {
                    if (typeof window.parent !== 'undefined') {
                        window.parent.postMessage('switchView', '*')
                    }
                }
                TRuntime.start()
            }
        }
        this.toggleEditor = function () {
            if (editorEnabled) {
                this.execute()
            } else {
                this.enableEditor()
            }
        }
        this.clear = function (confirm) {
            let goOn = true
            if (typeof confirm !== 'undefined' && confirm) {
                goOn = window.confirm(TEnvironment.getMessage('clear-confirm'))
            }
            if (goOn) {
                TRuntime.clear()
                console.clear()
                canvas.clear()
                this.clearLog()
                this.disableDesignMode()
                message.hide()
            }
        }
        this.addLogMessage = text => {
            if (typeof log !== 'undefined') {
                log.addMessage(text)
            } else {
                TEnvironment.log(text)
            }
        }
        this.showMessage = text => {
            if (typeof message !== 'undefined') {
                message.show(text)
            }
        }
        this.addLogError = error => {
            if (typeof log !== 'undefined') {
                log.addError(error)
            } else {
                TEnvironment.error(error)
            }
        }
        this.showErrorMessage = (text, index) => {
            if (typeof message !== 'undefined') {
                message.showError(text, index)
            }
        }
        this.clearLog = () => {
            if (typeof log !== 'undefined') {
                log.clear()
            }
        }
        this.getPreviousRow = () => {
            if (typeof log !== 'undefined') {
                return log.getPreviousRow()
            }
        }
        this.getNextRow = () => {
            if (typeof log !== 'undefined') {
                return log.getNextRow()
            }
        }
        this.setLastRow = () => {
            if (typeof log !== 'undefined') {
                return log.setLastRow()
            }
        }
        this.execute = function () {
            if (designModeEnabled) {
                this.disableDesignMode()
            }
            if (!editorEnabled) {
                // execution from console
                TRuntime.executeFrom(console)
                console.clear()
            } else if (editorEnabled) {
                // execution from editor
                this.clear(false)
                this.disableEditor()
                console.clear()
                const currentProgram = editor.getProgramName()
                if (currentProgram !== false) {
                    TRuntime.executeFrom(editor, currentProgram)
                    window.setTimeout(() => {
                        canvas.giveFocus()
                    })
                }
            }
        }
        this.handleError = function (index) {
            const error = log.getError(index)
            if (error.getProgramName() === null) {
                if (consoleDisplayed) {
                    // error from command
                    console.setValue(error.getCode())
                    console.focus()
                }
            } else {
                // error from program
                this.enableEditor()
                this.editProgram(error.getProgramName())
                editor.setError(error.getLines())
            }
        }
        this.saveProgram = function () {
            const project = TEnvironment.getProject()
            editor.updateProgram()
            const program = editor.getProgram()
            sidebar.showLoadingProgram(program.getName())
            const self = this
            project.saveProgram(program, error => {
                if (typeof error !== 'undefined') {
                    self.addLogError(error)
                } else {
                    self.addLogMessage(TEnvironment.getMessage('program-saved', program.getName()))
                    self.updateProgramInfo(program)
                    self.setSaveAvailable(false)
                    editor.reset()
                }
                sidebar.removeLoadingProgram(program.getName())
            }, editor.getSession())
        }
        this.newProgram = function (name, code) {
            const project = TEnvironment.getProject()
            const program = project.createProgram(name, code)
            project.setSession(program, editor.createSession(program))
            editor.setProgram(program)
            editor.setSession(project.getSession(program))
            this.updateSidebarPrograms()
            sidebar.displayPrograms()
            editor.giveFocus()
        }
        this.editProgram = function (name) {
            const project = TEnvironment.getProject()
            // save previous session if any
            const previousProgram = editor.getProgram()
            if (typeof previousProgram !== 'undefined') {
                project.updateSession(previousProgram, editor.getSession())
            }
            if (!project.isProgramEdited(name)) {
                // Program has to be loaded
                sidebar.showLoadingProgram(name)
                const self = this
                project.editProgram(name, error => {
                    if (typeof error !== 'undefined') {
                        self.addLogError(error)
                    } else {
                        const newProgram = project.getEditedProgram(name)
                        project.setSession(newProgram, editor.createSession(newProgram))
                        editor.setProgram(newProgram)
                        editor.setSession(project.getSession(newProgram))
                        //update sidebar
                        self.updateSidebarPrograms()
                        editor.giveFocus()
                    }
                })
            } else {
                const newProgram = project.getEditedProgram(name)
                editor.setProgram(newProgram)
                editor.setSession(project.getSession(newProgram))
                //update sidebar
                this.updateSidebarPrograms()
                editor.giveFocus()
            }
        }

        function nextProgram(name) {
            const project = TEnvironment.getProject()
            const program = project.findPreviousEditedProgram(name)
            if (program) {
                editor.setProgram(program)
                editor.setSession(project.getSession(program))
                editor.giveFocus()
                return true
            } else {
                editor.disable()
                return false
            }
        }
        this.closeProgram = function (name) {
            const project = TEnvironment.getProject()
            let result = project.closeProgram(name)
            if (result) {
                // close performed
                // check if program was current editing program in editor, in which case we set next editing program as current program
                if (name === editor.getProgramName()) {
                    result = nextProgram(name)
                    if (result) {
                        this.setSaveEnabled(true)
                        sidebar.setProgramsEditionEnabled(true)
                    } else {
                        this.setSaveAvailable(false)
                        this.setSaveEnabled(false)
                        sidebar.setProgramsEditionEnabled(false)
                    }
                }
                // update sidebar
                this.updateSidebarPrograms()
            } else {
                // close cancelled
                editor.giveFocus()
            }
        }
        this.renameProgram = function (oldName, newName) {
            if (newName !== oldName) {
                const project = TEnvironment.getProject()
                sidebar.showRenamingProgram(oldName)
                const self = this
                project.renameProgram(oldName, newName, error => {
                    if (typeof error !== 'undefined') {
                        self.addLogError(error)
                    }
                    self.updateSidebarPrograms()
                })
            }
        }
        this.renameResource = function (name, newBaseName) {
            const project = TEnvironment.getProject()
            const oldBaseName = project.getResourceBaseName(name)
            let newName = name
            if (newBaseName !== oldBaseName) {
                sidebar.showRenamingResource(name)
                const self = this
                project.renameResource(name, newBaseName, name => {
                    if (name instanceof TError) {
                        self.addLogError(name)
                    } else {
                        newName = name
                    }
                    self.updateSidebarResources()
                    sidebar.selectResource(newName)
                })
            }
        }
        this.setSaveAvailable = value => {
            toolbar.setSaveAvailable(value)
        }
        this.setSaveEnabled = value => {
            if (value && TEnvironment.isProjectAvailable()) {
                toolbar.setSaveEnabled(true)
                editor.setSaveEnabled(true)
            } else {
                toolbar.setSaveEnabled(false)
                editor.setSaveEnabled(false)
            }
        }
        this.setEditionEnabled = value => {
            sidebar.setEditionEnabled(value)
        }
        this.updateSidebarPrograms = () => {
            sidebar.updatePrograms()
        }
        this.updateSidebarResources = () => {
            sidebar.updateResources()
        }
        this.updateProgramInfo = program => {
            sidebar.updateProgramInfo(program)
        }
        this.getCurrentProgram = () => editor.getProgram()
        this.displayPrograms = () => {
            sidebar.displayPrograms()
            programsDisplayed = true
            resourcesDisplayed = false
        }
        this.togglePrograms = function () {
            if (programsDisplayed) {
                sidebar.close()
                programsDisplayed = false
            } else {
                this.displayPrograms()
            }
        }
        this.displayResources = () => {
            if (sidebar.displayResources()) {
                resourcesDisplayed = true
                programsDisplayed = false
            }
        }
        this.toggleResources = function () {
            if (resourcesDisplayed) {
                sidebar.close()
                resourcesDisplayed = false
            } else {
                this.displayResources()
            }
        }
        this.delete = function () {
            let goOn
            let name
            const self = this
            const project = TEnvironment.getProject()
            if (programsDisplayed) {
                // Program deletion
                name = editor.getProgramName()
                if (name === false) {
                    // editor disabled
                    return
                }
                goOn = window.confirm(TEnvironment.getMessage('delete-program-confirm', name))
                if (goOn) {
                    project.deleteProgram(name, error => {
                        if (typeof error !== 'undefined') {
                            self.addLogError(error)
                        } else {
                            const result = nextProgram(name)
                            if (result) {
                                self.setSaveEnabled(true)
                                sidebar.setProgramsEditionEnabled(true)
                            } else {
                                self.setSaveAvailable(false)
                                self.setSaveEnabled(false)
                                sidebar.setProgramsEditionEnabled(false)
                            }
                        }
                        //update sidebar
                        self.updateSidebarPrograms()
                        editor.giveFocus()
                    })
                }
                editor.giveFocus()
            } else {
                // Resource deletion
                name = sidebar.getCurrentResourceName()
                if (name !== '') {
                    goOn = window.confirm(TEnvironment.getMessage('delete-resource-confirm', name))
                    if (goOn) {
                        project.deleteResource(name, error => {
                            if (typeof error !== 'undefined') {
                                self.addLogError(error)
                            }
                            //update sidebar
                            self.updateSidebarResources()
                            sidebar.setResourcesEditionEnabled(false)
                        })
                    }
                }
            }
        }
        this.recordObjectLocation = (tObject, location) => {
            const name = TRuntime.getTObjectName(tObject)
            log.addObjectLocation(name, location)
        }
        this.setResourceContent = function (name, data, callback) {
            const self = this
            TEnvironment.getProject().setResourceContent(name, data, function (newName) {
                if (!(newName instanceof TError)) {
                    if (newName !== name) {
                        // name has changed: update sidebar
                        self.updateSidebarResources()
                        sidebar.selectResource(newName)
                    }
                    callback.call(this, newName)
                }
            })
        }
        this.duplicateResource = function (name, callback) {
            const self = this
            TEnvironment.getProject().duplicateResource(name, function (newName) {
                if (!(newName instanceof TError)) {
                    self.updateSidebarResources()
                    sidebar.selectResource(newName)
                    sidebar.viewResource(newName)
                }
                callback.call(this, newName)
            })
        }
        this.newResource = () => {
            sidebar.createResource()
        }
        this.createResource = function (name, width, height, callback) {
            const self = this
            TEnvironment.getProject().createResource(name, width, height, function (newName) {
                if (!(newName instanceof TError)) {
                    self.updateSidebarResources()
                    sidebar.selectResource(newName)
                    sidebar.viewResource(newName)
                }
                callback.call(this, newName)
            })
        }
        this.init = function (id) {
            this.clear()
            editor.disable()
            sidebar.load()
            TEnvironment.getProject().init(() => {
                sidebar.update()
            }, id)
        }
        this.hideHints = () => {
            THints.hideHints()
            toolbar.setHintsDisplayed(false)
        }
        this.toggleHints = () => {
            THints.toggleHints()
            toolbar.setHintsDisplayed(THints.visible())
        }
        this.enableWiki = () => {
            toolbar.setWikiOpen()
        }
        this.disableWiki = () => {
            toolbar.setWikiClosed()
        }
        this.saveDebugContent = () => {
            const program = editor.getProgram()
            if (program.getName() === 'autoload') {
                localStorage.setItem('autoload', editor.getValue())
            }
        }
        this.debugOnChange = () => {
            editor.getAceEditor().on('change', () => {
                this.saveDebugContent()
            })
        }
        this.restoreEditorContent = () => {
            const code = localStorage.getItem('autoload')
            this.newProgram('autoload', code)
        }
    }
}

const uiInstance = new TUI()
export default uiInstance