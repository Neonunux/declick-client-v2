import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TComponent from '@/components/TComponent'
import TDesignLog from '@/components/TDesignLog'
import TUI from '@/components/TUI'

class TLog extends TComponent {
    constructor(callback) {
        let designLog
        let $main
        let $log
        let $designLog
        let $innerLog
        let rowCount = 0
        let currentRow = 0
        let scrollTop = 0
        let currentHeight = -1 // initial height set to 150px
        const errors = new Array()

        super('TLog.html', function(component) {
            $main = component
            $log = component.find('#tlog')
            $innerLog = component.find('#tlog-inner')
            //TUI.showDesignLog();
            //TUI.hideDesignLog();
            // add designLog
            const self = this
            designLog = new TDesignLog(c => {
                component.find('#TDesignLog').replaceWith(c)
                $designLog = c
                if (typeof callback !== 'undefined') {
                    callback.call(self, component)
                }
            })
        })

        this.mounted = () => {
            $designLog.hide()
        }

        this.addCommand = text => {
            if (typeof text === 'string') {
                const lines = text.split('\n')
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i]
                    const row = document.createElement('div')
                    row.className = 'tlog-row tlog-success'
                    row.id = `tlog-row-${rowCount}`
                    rowCount++
                    currentRow = rowCount
                    row.appendChild(document.createTextNode(line))
                    $log.append(row)
                    $log.scrollTop($log.prop('scrollHeight'))
                }
            }
        }

        this.addError = error => {
            let code
            let message
            if (typeof error.getCode !== 'undefined') {
                code = error.getCode()
            }
            if (typeof error.getMessage !== 'undefined') {
                message = error.getMessage()
            }
            else if (typeof error.message !== 'undefined') {
                message = error.message
            }
            else {
                message = 'undefined error'
                window.console.debug(error)
            }
            const index = errors.push(error) - 1
            const wrapper = document.createElement('div')
            wrapper.onclick = () => {
                TUI.handleError(index)
            }
            let row
            wrapper.className = 'tlog-row tlog-failure'
            if (typeof code === 'string') {
                const lines = code.split('\n')
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i]
                    row = document.createElement('div')
                    row.id = `tlog-row-${rowCount}`
                    rowCount++
                    currentRow = rowCount
                    row.appendChild(document.createTextNode(line))
                    wrapper.appendChild(row)
                }
            }
            if (typeof message === 'string') {
                row = document.createElement('div')
                row.appendChild(document.createTextNode(message))
                wrapper.appendChild(row)
            }
            $log.append(wrapper)
            $log.scrollTop($log.prop('scrollHeight'))
            TUI.showErrorMessage(message, index)
        }

        this.addMessage = text => {
            if (typeof text === 'string') {
                const row = document.createElement('div')
                row.className = 'tlog-row tlog-message'
                row.appendChild(document.createTextNode(text))
                $log.append(row)
                $log.scrollTop($log.prop('scrollHeight'))
                TUI.showMessage(text)
            }
        }

        this.clear = function() {
            $log.empty()
            rowCount = 0
            currentRow = 0
            errors.length = 0
            designLog.clear()
            this.hideDesignLog()
        }

        this.getPreviousRow = () => {
            if (currentRow > 0) {
                currentRow--
                const element = $(`#tlog-row-${currentRow}`)
                if (typeof element !== 'undefined') {
                    return element.text()
                }
            }
            else {
                // First row reached
                return null
            }
        }

        this.getNextRow = () => {
            if (currentRow < rowCount) {
                currentRow++
                if (currentRow < rowCount) {
                    const element = $(`#tlog-row-${currentRow}`)
                    if (typeof element !== 'undefined') {
                        return element.text()
                    }
                }
                else {
                    // Last row reached
                    return null
                }
            }
            else {
                // Last row reached
                return null
            }
        }

        this.setLastRow = () => {
            currentRow = rowCount
        }

        this.saveScroll = () => {
            scrollTop = $log.scrollTop()
        }

        this.restoreScroll = () => {
            $log.scrollTop(scrollTop)
        }

        this.getError = index => {
            if (index < errors.length) {
                return errors[index]
            }
            return null
        }

        this.showDesignLog = () => {
            $log.hide()
            $designLog.show()
        }

        this.hideDesignLog = () => {
            $designLog.hide()
            $log.show()
        }

        this.hideDesignLogIfEmpty = function() {
            const result = designLog.isEmpty()
            if (result) {
                this.hideDesignLog()
            }
            return result
        }

        this.addObjectLocation = (name, location) => {
            designLog.addObjectLocation(name, location)
        }

        this.show = () => {
            $main.show()
        }

        this.hide = () => {
            currentHeight = $main.outerHeight(false)
            $main.hide()
        }

        this.getHeight = () => {
            if (currentHeight === -1) {
                currentHeight = $main.outerHeight(false)
            }
            return currentHeight
        }
    }
}

export default TLog
