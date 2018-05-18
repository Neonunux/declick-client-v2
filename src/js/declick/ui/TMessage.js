import $ from 'jquery'

import TComponent from '@/ui/TComponent'
import TUI from '@/ui/TUI'

class TMessage extends TComponent {
    constructor(callback) {
        let $main
        let $content

        super('TMessage.html', function(component) {
            const $buttonClose = component.find('#tmessage-close')
            $main = component
            $content = component.find('#tmessage-content')
            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
            $buttonClose.click(e => {
                hide(true)
            })
        })

        var hide = fade => {
            $main.stop(true, true).off('click')
            if (fade) {
                $main.fadeOut()
            }
            else {
                $main.hide()
            }
        }

        this.show = value => {
            $content.text(value)
            $main.removeClass('error')
            $main.addClass('message')
            $main.stop(true, true).off('click').show().delay(2000).fadeOut()
        }

        this.showError = (value, index) => {
            $content.text(value)
            $main.removeClass('message')
            $main.addClass('error')
            $main.stop(true, true).off('click').on('click', () => {
                TUI.handleError(index)
            }).show()
        }

        this.hide = () => {
            hide(false)
        }
    }
}

export default TMessage
