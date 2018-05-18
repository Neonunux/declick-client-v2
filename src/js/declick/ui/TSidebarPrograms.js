import $ from 'jquery'

import TComponent from '@/ui/TComponent'
import TUI from '@/ui/TUI'
import TEnvironment from '@/env/TEnvironment'
import TProgram from '@/data/TProgram'

class TSidebarPrograms extends TComponent {
    constructor(callback) {
        let $programs
        let $list
        let $buttonDelete
        let programEdited = false
        super('TSidebarPrograms.html', function(component) {
            $programs = component
            $list = component.find('#tsidebar-programs-list')
            $list.addClass('loading')
            const $buttonNewProgram = component.find('#tsidebar-new-program')
            $buttonNewProgram.attr('title', TEnvironment.getMessage('option-new-program'))
            $buttonNewProgram.click(e => {
                TUI.newProgram()
            })
            $buttonDelete = component.find('#tsidebar-delete-program')
            $buttonDelete.attr('title', TEnvironment.getMessage('option-delete'))
            $buttonDelete.click(function(e) {
                if (!$(this).is(':disabled')) {
                    TUI.delete()
                }
            })
            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })
        /**
         * Init Sidebar.
         */
        this.init = function() {
            this.update()
        }
        /**
         * Loads Programs and Resources.
         */
        this.load = () => {
            $list.empty()
            $list.addClass('loading')
        }
        /**
         * Update Programs.
         */
        this.update = () => {
            $list.removeClass('loading')
            const project = TEnvironment.getProject()
            const programList = project.getProgramsNames()
            const editedPrograms = project.getEditedPrograms()
            const currentProgram = TUI.getCurrentProgram()
            const editedNames = []
            $list.empty()

            function addElement(name, id, displayedName, edited, current) {
                const element = document.createElement('div')
                element.className = 'tsidebar-program'
                if (edited) {
                    element.className += ' tsidebar-edited'
                }
                if (typeof current !== 'undefined' && current) {
                    element.className += ' tsidebar-current'
                }

                $(element).click(function(e) {
                    if ($(this).hasClass('tsidebar-renaming'))
                        {return false}
                    if (current) {
                        // rename program
                        $(this).addClass('tsidebar-renaming')
                        programEdited = true
                        const self = this
                        const checker = ev => {
                            $(self).removeClass('tsidebar-renaming')
                            renameElement.remove()
                            programEdited = false
                        }
                        if (programEdited) {
                            $(window).on('click', checker)
                        }
                        else {
                            $(window).off('click', checker)
                        }

                        var renameElement = document.createElement('input')
                        renameElement.type = 'text'
                        renameElement.className = 'tsidebar-rename'
                        renameElement.value = name
                        $(renameElement).keydown(function({which}) {
                            if (which === 13) {
                                // Enter was pressed
                                TUI.renameProgram(name, renameElement.value)
                            }
                            if (which === 27) {
                                // Escape was pressed
                                $(this).parent().removeClass('tsidebar-renaming')
                                $(renameElement).remove()
                            }
                        })

                        renameElement.onfocus = () => {
                            element.setAttribute('draggable', 'false')
                        }
                        renameElement.onblur = () => {
                            TUI.renameProgram(name, renameElement.value)
                            element.setAttribute('draggable', 'true')
                        }
                        $(this).append(renameElement)
                        renameElement.focus()
                    }
                    else {
                        // edit program
                        TUI.editProgram(name)
                        e.stopPropagation()
                    }
                    TUI.setEditionEnabled(true)
                    e.stopPropagation()
                })
                const nameElement = document.createElement('div')
                nameElement.id = `tsidebar-program-${id}`
                nameElement.appendChild(document.createTextNode(displayedName))
                element.appendChild(nameElement)
                if (edited) {
                    const closeElement = document.createElement('div')
                    closeElement.className = 'tsidebar-close'
                    closeElement.onclick = e => {
                        TUI.closeProgram(name)
                        e.stopPropagation()
                    }
                    element.appendChild(closeElement)
                }
                element.setAttribute('draggable', 'true')
                element.ondragstart = ({target, dataTransfer}) => {
                    const el = $(target).find('div')
                    let programName = el.text()
                    const length = programName.length
                    if (programName.charAt(length - 1) === '*' &&
                        programName.charAt(length - 2) === ' ') {
                        programName = programName.slice(0, -2)
                    }
                    dataTransfer.setData('text/plain', `"${programName}"`)
                }
                $list.append(element)
            }

            let currentName = ''
            if (typeof currentProgram !== 'undefined') {
                currentName = currentProgram.getName()
            }

            for (var i = 0; i < editedPrograms.length; i++) {
                const program = editedPrograms[i]
                const programName = program.getName()
                editedNames.push(programName)
                addElement(programName, program.getId(), program.getDisplayedName(), true, programName === currentName)
            }

            for (var i = 0; i < programList.length; i++) {
                const name = programList[i]
                if (!editedNames.includes(name)) {
                    addElement(name, TProgram.findId(name), name, false)
                }
            }
        }
        this.updateInfo = program => {
            const id = `#tsidebar-program-${program.getId()}`
            $(id).text(program.getDisplayedName())
        }
        this.showLoading = name => {
            const id = `#tsidebar-program-${TProgram.findId(name)}`
            const loadElement = document.createElement('div')
            loadElement.className = 'tsidebar-loading'
            $(id).append(loadElement)
        }
        this.removeLoading = name => {
            const id = `#tsidebar-program-${TProgram.findId(name)}`
            $(id).find('.tsidebar-loading').remove()
        }
        this.showRenaming = name => {
            const id = `#tsidebar-program-${TProgram.findId(name)}`
            const loadElement = document.createElement('div')
            loadElement.className = 'tsidebar-loading'
            $(id).parent().append(loadElement)
        }
        this.show = () => {
            $programs.show()
        }
        this.hide = () => {
            $programs.hide()
        }
        this.hasCurrent = () => $list.find('.tsidebar-current').length > 0
        this.setEditionEnabled = value => {
            if (value) {
                $buttonDelete.prop('disabled', false)
            }
            else {
                $buttonDelete.prop('disabled', true)
            }
        }
    }
}

export default TSidebarPrograms
