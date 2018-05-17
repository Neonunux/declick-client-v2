import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TResource from '@/data/TResource'
import TUtils from '@/utils/TUtils'

function TComponent(component, callback) {

    var domComponent

    if (TUtils.checkString(component)) {
        // 'component' holds the name of html template
        var url = 'components/' + component
        var self = this
        TResource.getPlain(url, function(data) {
            domComponent = $(data)
            if (typeof callback !== 'undefined') {
                callback.call(self, domComponent)
            }
        })
    }
    else {
        // 'component' holds div parameters
        var txtElement = '<div'
        if (typeof component.id !== 'undefined') {
            txtElement += ' id="' + component.id + '"'
        }
        if (typeof component.class !== 'undefined') {
            txtElement += ' class="' + component.class + '"'
        }
        txtElement += '></div>'
        domComponent = $(txtElement)
        if (typeof callback !== 'undefined') {
            callback.call(this, domComponent)
        }
    }

    this.getComponent = function() {
        return domComponent
    }
}

export default TComponent
