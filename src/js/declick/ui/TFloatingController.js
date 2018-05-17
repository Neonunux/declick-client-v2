import $ from 'jquery'

import TComponent from '@/ui/TComponent'
import TRuntime from '@/run/TRuntime'
import TParser from '@/run/TParser'

function TFloatingController(callback) {
  TComponent.call(this, 'TFloatingController.html', function(component) {
    var $controller = component.find('#tfloatingcontroller')

    function setupButton(button, keyCode) {
      button.on('mousedown touchstart', function(event) {
        var keyboard = TRuntime.getTObject('clavier')
        keyboard.processKeyDown({ keyCode: keyCode })
        event = event.originalEvent
        event.preventDefault()
        event.stopPropagation()
        event.cancelBubble = true
        event.returnValue = false
        return false
      })
      button.on('mouseup mouseleave mouseout touchend touchcancel', function(event) {
        var keyboard = TRuntime.getTObject('clavier')
        keyboard.processKeyUp({ keyCode: keyCode })
        event = event.originalEvent
        event.preventDefault()
        event.stopPropagation()
        event.cancelBubble = true
        event.returnValue = false
        return false
      })
    }
    setupButton(component.find('#tfloatingcontroller-button-up'), 38)
    setupButton(component.find('#tfloatingcontroller-button-down'), 40)
    setupButton(component.find('#tfloatingcontroller-button-left'), 37)
    setupButton(component.find('#tfloatingcontroller-button-right'), 39)
    setupButton(component.find('#tfloatingcontroller-button-a'), 65)
    setupButton(component.find('#tfloatingcontroller-button-b'), 66)
    callback(component)
  })
}

TFloatingController.prototype = Object.create(TComponent.prototype)
TFloatingController.prototype.constructor = TFloatingController

export default TFloatingController
