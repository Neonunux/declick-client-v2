import $ from 'jquery'

import TResource from '@/data/TResource'
import TEnvironment from '@/env/TEnvironment'
import TRuntime from '@/run/TRuntime'

/**
 * Defines TObject.
 * This is the main class, all classes inherit from it.
 * @exports TObject
 */
class TObject {
    constructor() {
        TRuntime.addObject(this)
    }

    deleteObject() {
        TRuntime.removeObject(this)
    }

    getResource(location) {
        return `${this.objectPath}/resources/${location}`
    }

    loadJSON(location, callback, errorCallback) {
        TResource.get(location, [], callback, errorCallback)
    }

    loadFile(location, callback, errorCallback) {
        TResource.getPlain(location, [], callback, errorCallback)
    }

    getMessage(code) {
        if (typeof this.constructor.messages[code] !== 'undefined') {
            let message = this.constructor.messages[code]
            if (arguments.length > 1) {
                // message has to be parsed
                const elements = arguments
                message = message.replace(/{(\d+)}/g, (match, number) => {
                    number = parseInt(number) + 1
                    return typeof elements[number] !== 'undefined' ? elements[number] : match
                })
            }
            return message
        } else {
            return code
        }
    }

    /**
     * Delete TObject.
     */
    _delete() {
        this.deleteObject()
    }

    /**
     * To be defined in sub-objects, so they can have actions to freeze.
     * @param {Boolean} value
     */
    freeze(value) {
        // every object may add actions to take to freeze
    }

    /**
     * Get a String containing "TObject " and the class of the object.
     * @returns {String}
     */
    toString() {
        return `TObject ${this.className}`
    }
}

TObject.prototype.objectName = ''
TObject.prototype.className = 'TObject'
TObject.prototype.objectPath = 'tobject'

export default TObject
