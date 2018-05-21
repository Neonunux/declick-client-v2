import $ from 'jquery'

import TComponent from '@/components/TComponent'
import TRuntime from '@/components/TRuntime'

class TLearnCanvas extends TComponent {
    constructor(callback) {
        let $main
        let $canvas
        let $canvasLoading
        let $canvasLoadingValue

        super('TLearnCanvas.html', function(component) {
            $main = component
            $canvas = component.find('#tcanvas')
            $canvasLoading = component.find('#tcanvas-loading')
            $canvasLoadingValue = component.find('#tcanvas-loading-value')

            if (typeof callback !== 'undefined') {
                callback.call(this, component)
            }
        })

        this.mounted = () => {
            const graphics = TRuntime.getGraphics()
            graphics.setCanvas('tcanvas')
            // resize canvas and its container when window is resized
            $(window).resize(e => {
                const width = $main.width()
                const height = $main.height()
                graphics.resize(width, height)
            })
        }

        this.show = () => {
            $main.show()
        }

        this.hide = () => {
            $main.hide()
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
    }
}

export default TLearnCanvas
