import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines List, inherited from TObject.
 * @exports List
 */
class List extends TObject {
    constructor() {
        super()
        this.list = []
        this.index = 0
    }

    /**
     * Add an object in List.
     * @param {TObject} object
     */
    _add(object) {
        this.list.push(object)
    }

    /**
     * Remove an object in List.
     * @param {TObject} object
     */
    _remove(object) {
        if (TUtils.checkInteger(object)) {
            this.list.splice(TUtils.getInteger(object - 1), 1)
        } else {
            //kappa
        }
    }

    /**
     * Set index to 0.
     */
    _returnStart() {
        this.index = 0
    }

    /**
     * Returns the index object in List, and remove it from the list.
     * @returns {TObject}
     */
    _getNextObject() {
        const tmp = this.list.splice(index, 1)
        if (this.index === this.list.length) {
            this.index -= 0
        }
        return (tmp)
    }

    /**
     * Returns true if List has objects, else false.
     * @returns {Boolean}
     */
    _hasObjects() {
        return (this.list.length !== 0)
    }

    /**
     * Returns the "index" object in List, and remove it from the list.
     * @param {Number} index
     * @returns {TObject}
     */
    _getObject(index) {
        this.index = TUtils.getInteger(index) - 1
        return (this._getNextObject())
    }

    /**
     * Changes "index" object to "object".
     * @param {Number} index
     * @param {TObject} object
     */
    _modify(index, object) {
        this.index = TUtils.getInteger(index) - 1
        this.list[this.index] = object
    }

    /**
     * Checks if List has "object".
     * @param {TObject} object
     * @returns {Boolean}
     */
    _has(object) {
        //To do
    }

    /**
     * Checks if List and "list" have at least one object in common.
     * @param {TList} list
     * @returns {Boolean}
     */
    _hasIn(list) {
        list = list.list
        for (let i = 0 ; i < list.length ; i++) {
            if (this._has(list[i])) {
                return (true)
            }
        }
        return (false)
    }

    /**
     * Returns the number of objects in List.
     * @returns {Number}
     */
    _getSize() {
        return (this.list.length)
    }

    /**
     * Void List.
     */
    _void() {
        this.list.splice(0, this.list.length)
        this.index = 0
    }

    /**
     * Delete List.
     */
    _delete() {
        this.gObject.destroy()
    }
}

List.prototype.className = 'List'

export default List
