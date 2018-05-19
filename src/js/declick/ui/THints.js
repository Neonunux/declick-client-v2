import $ from 'jquery'
import introjs from 'intro.js'

import TEnvironment from '@/env/TEnvironment'
import TResource from '@/data/TResource'

function THints() {
    const introJS = introjs()
    let hintsDisplayed = false
    let currentPage = false
    let hintsAdded = false
    let hintsCount = 0
    const pages = {}

    $(document).ready(() => {
        //append css
        //var style = $("<link rel='stylesheet' media='all' href='js/libs/introjs/introjs.min.css'>");
        const style = $('<link rel=\'stylesheet\' media=\'all\' href=\'css/introjs.min.css\'>')
        const style2 = $('<link rel=\'stylesheet\' media=\'all\' href=\'css/hints.css\'>')
        $('head').append(style)
        $('head').append(style2)
    })

    this.loadHints = (name, callback) => {
        const hintsFile = TEnvironment.getResource(name)
        TResource.get(hintsFile, [], function(data) {
            introJS.setOptions(data)
            // check for pages
            let index = 0
            for (let i = 0; i < data.hints.length; i++) {
                const item = data.hints[i]
                if (typeof item.pages !== 'undefined') {
                    for (let j = 0; j < item.pages.length; j++) {
                        if (typeof pages[item.pages[j]] === 'undefined') {
                            pages[item.pages[j]] = []
                        }
                        pages[item.pages[j]].push(index)
                    }
                }
                index++
            }
            hintsCount = index
            if (typeof callback !== 'undefined') {
                callback.call(this)
            }
        })
    }

    this.showHints = page => {
        if (!hintsAdded) {
            introJS.addHints()
            hintsAdded = true
        }
        else  {
            introJS.refresh()
        }
        if (typeof page !== 'undefined') {
            // display only items for a given page
            // 1st hide every items
            introJS.hideHints()
            // 2nd display only required items
            if (typeof pages[page] !== 'undefined' && pages[page].length > 0) {
                for (let i = 0; i < pages[page].length; i++) {
                    $(`.introjs-hint[data-step=${pages[page][i]}]`).removeClass('introjs-hidehint')
                }
            }
        }
        else {
            $('.introjs-hidehint').removeClass('introjs-hidehint')
        }
        hintsDisplayed = true
    }

    this.hideHints = () => {
        introJS.hideHints()
        hintsDisplayed = false
    }

    this.toggleHints = function() {
        if (hintsDisplayed) {
            this.hideHints()
        }
        else {
            if (currentPage !== false) {
                this.showHints(currentPage)
            }
            else {
                this.showHints()
            }
        }
    }

    this.setPage = page => {
        currentPage = page
    }

    this.visible = () => hintsDisplayed
}

const instance = new THints()

export default instance
