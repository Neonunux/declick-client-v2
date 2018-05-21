import $ from 'jquery'

import TProject from '@/data/TProject'
import TEnvironment from '@/env/TEnvironment'
import TRuntime from '@/run/TRuntime'
import TFrame from '@/ui/TFrame'
import TUI from '@/ui/TUI'

require('css/style.css')
require('css/hints.css')
require('css/prism.css')
require('css/split-pane.css')
require('css/wColorPicker.min.css')
require('css/wPaint.min.css')
require('intro.js/themes/introjs-dark.css')
require('intro.js/themes/introjs-flattener.css')
require('intro.js/themes/introjs-modern.css')
require('intro.js/themes/introjs-nassim.css')
require('intro.js/themes/introjs-nazanin.css')
require('intro.js/themes/introjs-royal.css')
require('intro.js/introjs.css')

// Start the main app logic.
function load() {
    window.console.log('***********************')
    window.console.log('* Loading Environment *')
    window.console.log('***********************')
    TEnvironment.load(function () {
        TEnvironment.log('*******************')
        TEnvironment.log('* Loading Runtime *')
        TEnvironment.log('*******************')
        TRuntime.load(function () {
            TEnvironment.log('***************************')
            TEnvironment.log('* Building User Interface *')
            TEnvironment.log('***************************')
            var frame = new TFrame(function (component) {
                $('body').append(component)
                TEnvironment.log('*******************')
                TEnvironment.log('* Initiating link *')
                TEnvironment.log('*******************')
                var currentProject = new TProject()
                currentProject.init(function () {
                    TEnvironment.setProject(currentProject)
                    $(document).ready(function () {
                        frame.mounted()
                        TRuntime.init()
                        if (typeof window.parent !== 'undefined') {
                            window.parent.postMessage('init', '*')
                        }
                        TEnvironment.restore()
                    })
                })
            })
        })
    })
}

var loading = new Image()
loading.src = 'images/loader2.gif'
if (loading.complete) {
    load()
} else {
    loading.onload = load()
}