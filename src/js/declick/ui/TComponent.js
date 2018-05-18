import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TResource from '@/data/TResource'
import TUtils from '@/utils/TUtils'

function TComponent(component, callback) {

    let domComponent

    if (TUtils.checkString(component)) {
        // 'component' holds the name of html template
        const url = `components/${component}`
        const self = this
        TResource.getPlain(url, data => {
            domComponent = $(data)
            if (typeof callback !== 'undefined') {
                callback.call(self, domComponent)
            }
        })
    }
    else {
        // 'component' holds div parameters
        let txtElement = '<div'
        if (typeof component.id !== 'undefined') {
            txtElement += ` id="${component.id}"`
        }
        if (typeof component.class !== 'undefined') {
            txtElement += ` class="${component.class}"`
        }
        txtElement += '></div>'
        domComponent = $(txtElement)
        if (typeof callback !== 'undefined') {
            callback.call(this, domComponent)
        }
    }

    this.getComponent = () => domComponent
}

export default TComponent
