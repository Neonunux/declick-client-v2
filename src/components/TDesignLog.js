import $ from 'jquery'

import TComponent from '@/components/TComponent'
import TEnvironment from '@/env/TEnvironment'

class TDesignLog extends TComponent {
    constructor(callback) {
        let $designLog

        super({ id: 'tdesign-log' }, function(component) {
            $designLog = component

            $designLog.click(e => {
                $designLog.find('.tdesign-log-row').removeClass('selected')
            })

            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })

        const dragHandler = ({currentTarget, dataTransfer}) => {
            const element = $(currentTarget)
            const selectedElements = $designLog.find('.selected')
            let data = ''
            if (element.hasClass('selected')) {
                // there are selected elements: drag them
                let first = true
                selectedElements.each(function() {
                    const currentElement = $(this)
                    const name = currentElement.find('.tdesign-log-name').text()
                    const coordinates = currentElement.find('.tdesign-log-location').text()
                    if (!first) {
                        data += `;\n${name}${coordinates}`
                    }
                    else {
                        data += name + coordinates
                        first = false
                    }
                })
            }
            else {
                // current element is not selected: deselect other (if any), select it and drag it
                selectedElements.removeClass('selected').removeClass('selectee')
                element.addClass('selected')
                element.addClass('selectee')
                const name = element.find('.tdesign-log-name').text()
                const coordinates = element.find('.tdesign-log-location').text()
                data = name + coordinates
            }
            dataTransfer.setData('text/plain', data)
        }

        const clickHandler = event => {
            const $element = $(event.currentTarget)
            if (event.shiftKey) {
                // select range
                const startElement = $designLog.find('.selectee')
                if (startElement.length > 0) {
                    const start = startElement.index()
                    const stop = $element.index()
                    const selected = $designLog.find('.tdesign-log-row')
                    if (stop > start) {
                        selected.slice(start, stop + 1).addClass('selected')
                    }
                    else if (start > stop) {
                        selected.slice(stop, start + 1).addClass('selected')
                    }
                    else {
                        // start = stop : only select $element
                        $element.addClass('selected')
                    }
                }
                else {
                    // no start element
                    $element.addClass('selected')
                }
            }
            else if (event.ctrlKey || event.metaKey) {
                // add target to selection/remove target from selection
                $element.toggleClass('selected')
            }
            else {
                $designLog.find('.tdesign-log-row').removeClass('selected')
                $element.addClass('selected')
            }
            $designLog.find('.tdesign-log-row').removeClass('selectee')
            if ($element.hasClass('selected')) {
                $element.addClass('selectee')
            }
            event.stopPropagation()
        }

        this.isEmpty = () => $designLog.is(':empty')

        this.addObjectLocation = (name, {x, y}) => {
            const elementId = `tdesign-log-${name}`
            const $element = $designLog.find(`#${elementId}`)
            const nameText = TEnvironment.getMessage('design-name-text', name)
            const locationText = TEnvironment.getMessage('design-location-text', x, y)
            if ($element.length > 0) {
                // element already exists
                $element.find('.tdesign-log-name').text(nameText)
                $element.find('.tdesign-log-location').addClass('active').text(locationText).delay(500).queue(function() {
                    $(this).removeClass('active')
                    $(this).dequeue()
                })
            }
            else {
                // we create element
                const domElement = document.createElement('div')
                domElement.id = elementId
                domElement.className = 'tdesign-log-row'
                const domName = document.createElement('span')
                domName.className = 'tdesign-log-name'
                domName.innerHTML = nameText
                const domLocation = document.createElement('span')
                domLocation.className = 'tdesign-log-location'
                domLocation.innerHTML = locationText
                domElement.appendChild(domName)
                domElement.appendChild(domLocation)
                $designLog.append(domElement)
                // Drag disabled because it's making copy paste harder and the interface prevents
                // the user from dragging instructions into his code anyway.
                /*
                domElement.setAttribute("draggable", "true");
                domElement.ondragstart = dragHandler;
                $(domElement).click(clickHandler);
                */
                $designLog.scrollTop($designLog.prop('scrollHeight'))
                //$designLog.selectable();
            }
        }

        this.clear = () => {
            $designLog.empty()
        }

    }
}

export default TDesignLog

