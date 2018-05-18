import $ from 'jquery'

import TComponent from '@/ui/TComponent'
import TEnvironment from '@/env/TEnvironment'
import TUI from '@/ui/TUI'

class TToolbar extends TComponent {
    constructor(callback) {
        let $main
        let $buttonExecute
        let $buttonFloatingController
        let $buttonDesignMode
        let $buttonConsole
        let $buttonSaveProgram
        let $buttonHints
        let $buttonWiki
        let editorMode = false
        let saveEnabled = false
        let currentHeight = -1

        super('TToolbar.html', function(component) {
            $main = component
            $buttonExecute = component.find('#ttoolbar-play')
            $buttonDesignMode = component.find('#ttoolbar-design-mode')
            $buttonFloatingController =
                component.find('#ttoolbar-floating-controller')
            $buttonConsole = component.find('#ttoolbar-console')
            $buttonSaveProgram = component.find('#ttoolbar-save')

            $buttonWiki = component.find('#ttoolbar-wiki')
            $buttonWiki.prop('title', TEnvironment.getMessage('button-wiki'))
            $buttonWiki.click(e => {
                $buttonWiki.toggleClass('active')
                if (typeof window.parent !== 'undefined') {
                    window.parent.postMessage('toggleWiki', '*')
                }
            })

            $buttonHints = component.find('#ttoolbar-hints')
            $buttonHints.prop('title', TEnvironment.getMessage('button-hints'))
            $buttonHints.click(e => {
                TUI.toggleHints()
            })

            $buttonExecute.attr('title', TEnvironment.getMessage('button-execute'))
            $buttonExecute.click(function(e) {
                if (!$(this).is(':disabled')) {
                    TUI.execute()
                }
            })

            $buttonDesignMode.attr('title', TEnvironment.getMessage('option-design-mode'))
            $buttonDesignMode.click(e => {
                TUI.toggleDesignMode()
            })

            $buttonFloatingController.attr('title', TEnvironment.getMessage('option-floating-controller'))
            $buttonFloatingController.click(e => {
                TUI.toggleFloatingController()
            })

            $buttonConsole.attr('title', TEnvironment.getMessage('option-console'))
            $buttonConsole.click(e => {
                TUI.toggleConsole()
            })


            $buttonSaveProgram.attr('title', TEnvironment.getMessage('option-save-program'))
            $buttonSaveProgram.click(function(e) {
                if (!$(this).is(':disabled')) {
                    TUI.saveProgram()
                }
            })

            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })

        this.mounted = () => {}

        this.enableConsole = () => {
            $buttonConsole.addClass('active')
        }

        this.disableConsole = () => {
            $buttonConsole.removeClass('active')
        }

        this.enableControllerMode = () => {
            $buttonControllerMode.addClass('active')
        }

        this.disableControllerMode = () => {
            $buttonControllerMode.removeClass('active')
        }

        this.enableDesignMode = () => {
            $buttonDesignMode.addClass('active')
        }

        this.disableDesignMode = () => {
            $buttonDesignMode.removeClass('active')
        }

        this.enableFloatingController = () => {
            $buttonFloatingController.addClass('active')
        }

        this.disableFloatingController = () => {
            $buttonFloatingController.removeClass('active')
        }

        this.enableEditor = () => {
            if (!editorMode) {
                $buttonDesignMode.hide()
                $buttonFloatingController.hide()
                $buttonConsole.hide()
                $buttonExecute.show()
                $buttonSaveProgram.show()
                editorMode = true
            }
        }

        this.disableEditor = () => {
            if (editorMode) {
                $buttonDesignMode.show()
                $buttonFloatingController.show()
                $buttonConsole.show()
                $buttonExecute.hide()
                $buttonSaveProgram.hide()
                editorMode = false
            }
        }

        this.setSaveEnabled = value => {
            saveEnabled = value
            if (value) {
                $buttonSaveProgram.prop('disabled', false)
            }
            else {
                $buttonSaveProgram.prop('disabled', true)
            }
        }

        this.setSaveAvailable = value => {
            if (value && saveEnabled) {
                $buttonSaveProgram.addClass('active')
            }
            else {
                $buttonSaveProgram.removeClass('active')
            }
        }

        this.setHintsDisplayed = value => {
            if (value) {
                $buttonHints.addClass('active')
            }
            else {
                $buttonHints.removeClass('active')
            }
        }

        this.getHeight = () => {
            if (currentHeight === -1) {
                currentHeight = $main.outerHeight(false)
            }
            return currentHeight
        }

        this.setWikiOpen = () => {
            $buttonWiki.addClass('active')
        }

        this.setWikiClosed = () => {
            $buttonWiki.removeClass('active')
        }
    }
}

export default TToolbar
