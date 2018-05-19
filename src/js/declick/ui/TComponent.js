import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TResource from '@/data/TResource'
import TUtils from '@/utils/TUtils'

class TComponent {
    constructor(component, callback) {
        this.domComponent = null

        if (TUtils.checkString(component)) {
            // 'component' holds the name of html template
            const url = `components/${component}`
            const self = this
            TResource.getPlain(url, function (data) {
                self.domComponent = $(data)
                if (typeof callback !== 'undefined') {
                    callback.call(self, self.domComponent)
                }
            })
        } else {
            // 'component' holds div parameters
            let txtElement = '<div'
            if (typeof component.id !== 'undefined') {
                txtElement += ` id="${component.id}"`
            }
            if (typeof component.class !== 'undefined') {
                txtElement += ` class="${component.class}"`
            }
            txtElement += '></div>'
            this.domComponent = $(txtElement)
            if (typeof callback !== 'undefined') {
                callback.call(this, this.domComponent)
            }
        }

    }
    getComponent() {
        return this.domComponent
    }
}

export default TComponent