import $ from 'jquery'

import TComponent from '@/ui/TComponent'
import TRuntime from '@/run/TRuntime'
import TParser from '@/run/TParser'

class TFloatingController extends TComponent {
  constructor(callback) {
    super('TFloatingController.html', component => {
      const $controller = component.find('#tfloatingcontroller')

      function setupButton(button, keyCode) {
        button.on('mousedown touchstart', event => {
          const keyboard = TRuntime.getTObject('clavier')
          keyboard.processKeyDown({ keyCode })
          event = event.originalEvent
          event.preventDefault()
          event.stopPropagation()
          event.cancelBubble = true
          event.returnValue = false
          return false
        })
        button.on('mouseup mouseleave mouseout touchend touchcancel', event => {
          const keyboard = TRuntime.getTObject('clavier')
          keyboard.processKeyUp({ keyCode })
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
}

export default TFloatingController
