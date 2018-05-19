import $ from 'jquery'
require('jquery.ui.draggable')

import TEnvironment from '@/env/TEnvironment'
import TRuntime from '@/run/TRuntime'
import TComponent from '@/ui/TComponent'
import TFloatingController from '@/ui/TFloatingController'

class TCanvas extends TComponent {
    constructor(callback) {
        let $main
        let $canvas
        let $canvasDesign
        let $canvasDesignMouse
        let $canvasLoading
        let $canvasLoadingValue
        let $popup
        let $popupContent
        let $floatingController
        let popupCallback = null
        let cursorX
        let cursorY

        super('TCanvas.html', function(component) {
            $main = component
            $canvas = component.find('#tcanvas')
            $canvasDesign = component.find('#tcanvas-design')
            $canvasDesignMouse = component.find('#tcanvas-design-mouse')
            $canvasLoading = component.find('#tcanvas-loading')
            $canvasLoadingValue = component.find('#tcanvas-loading-value')

            const floatingController = new TFloatingController(content => {
                component.find('#TFloatingController').replaceWith(content)
                $floatingController = component.find('#tfloatingcontroller')
                $floatingController.hide()
            })

            $canvasDesign.hide()
            $canvasLoading.hide()

            $canvas.on('mousemove', cursorHandler)
            $canvas.on('touchmove', cursorHandler)

            $canvasLoadingValue = component.find('#tcanvas-loading-value')

            $popup = component.find('#tcanvas-popup')
            $popupContent = component.find('#tcanvas-popup-content')
            const $buttonPopup = component.find('#tcanvas-popup-button')
            $buttonPopup.text(TEnvironment.getMessage('popup-ok'))
            $buttonPopup.click(function() {
                $popup.hide()
                if (popupCallback !== null) {
                    popupCallback.call(this)
                }
            })

            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })

        var cursorHandler = ({clientX, clientY}) => {
            cursorX = clientX + $main.scrollLeft()
            cursorY = clientY + $main.scrollTop()
        }
        const designMouseHandler = event => {
            $canvasDesignMouse.text(`${cursorX},${cursorY}`)
        }

        /**
         *
         * @param event
         */
        const designMouseSideHandler = event => {
            if ($canvasDesignMouse.hasClass('left-design')) {
                $canvasDesignMouse.removeClass('left-design')
                $canvasDesignMouse.addClass('right-design')
                return
            }
            else {
                $canvasDesignMouse.removeClass('right-design')
                $canvasDesignMouse.addClass('left-design')
            }
        }

        this.mounted = function() {
            $popup.hide()
            const graphics = TRuntime.getGraphics()
            graphics.setCanvas('tcanvas')
            // resize canvas and its container when window is resized
            const self = this
            $(window).resize(e => {
                self.resize()
            })
        }

        this.show = () => {
            $main.show()
        }

        this.hide = () => {
            $main.hide()
        }

        this.setDesignMode = value => {
            if (value) {
                $canvasDesign.show()
                $canvas.on('mousemove', designMouseHandler)
                $canvasDesignMouse.on('mouseover', designMouseSideHandler)

                //                $domCanvas3d.on("click", function(e) {
                //                    console.log("c3D clicked");
                //                    if (e.clientY > $(this).outerHeight() - 14) {
                //                        alert('clicked on the bottom border!');
                //                    }
                //                });
            } else {
                $canvasDesign.hide()
                $canvasDesignMouse.empty()
                $canvas.off('mousemove', designMouseHandler)
                $canvasDesignMouse.off('mouseover', designMouseSideHandler)
            }
        }

        this.enableFloatingController = () => {
            $floatingController.draggable({ containment: 'parent' })
            $floatingController.show()
        }

        this.disableFloatingController = () => {
            $floatingController.hide()
        }

        this.showLoading = () => {
            $canvasLoading.show()
        }

        this.setLoadingValue = (count, total) => {
            const value = Math.round(count * 100 / total)
            $canvasLoadingValue.text(`${value}%`)
        }

        this.removeLoading = () => {
            $canvasLoading.hide()
        }

        this.giveFocus = () => {
            $canvas.get(0).focus()
        }

        this.resize = () => {
            const width = $main.width()
            const height = $main.height()
            TRuntime.getGraphics().resize(width, height)
        }

        this.popup = (text, callback) => {
            $popupContent.text(text)
            if (typeof callback !== 'undefined') {
                popupCallback = callback
            } else {
                popupCallback = null
            }
            $popup.show()
        }

        this.clear = () => {
            $popup.hide()
        }

        this.getCursorX = () => cursorX
        this.getCursorY = () => cursorY
    }
}

export default TCanvas
