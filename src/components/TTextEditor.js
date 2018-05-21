import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TComponent from '@/components/TComponent'
import TUI from '@/components/TUI'

class TTextEditor extends TComponent {
    constructor(callback) {
        let $name
        let $textArea
        let $main
        let resourceName = ''

        super('TTextEditor.html', function (component) {
            const $buttonClose = component.find('.tviewer-button-close')
            $buttonClose.prop('title', TEnvironment.getMessage('texteditor-close'))
            $buttonClose.click(e => {
                hide()
            })

            const $buttonCancel = component.find('.tviewer-creation-cancel')
            $buttonCancel.append(TEnvironment.getMessage('viewer-creation-cancel'))
            $buttonCancel.click(e => {
                hide()
            })

            const $buttonSave = component.find('.tviewer-creation-save')
            $buttonSave.append(TEnvironment.getMessage('viewer-creation-save'))
            $buttonSave.click(e => {
                save()
            })

            $main = component
            $textArea = component.find('#ttexteditor-text')
            $name = component.find('.tviewer-text-name')
            $main.hide()

            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })

        this.loadText = name => {
            resourceName = name
            $name.text(name)
            const project = TEnvironment.getProject()
            $textArea.val('')
            project.getResourceContent(name, data => {
                $textArea.val(data)
            })
            $main.fadeIn()
        }

        this.init = () => {
            $('body').append($main)
        }

        var hide = () => {
            $main.fadeOut()
        }

        var save = () => {
            TUI.setResourceContent(resourceName, $textArea.val(), newName => {
                hide()
            })
        }
    }
}

export default TTextEditor