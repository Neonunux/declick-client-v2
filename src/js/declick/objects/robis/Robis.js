import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Robis, inherited from TObject.
 * Robis is a remote control robot.
 * @exports Robis
 */
class Robis extends TObject {
    constructor() {
        super()
        this.prefix = 'http://'
        this.suffix = '/'
        this.url = 'undefined'
    }

    command(command) {
        if (this.url !== 'undefined')
            $.get(this.url, {command})
        else
            console.debug('failed')
    }

    /**
     * Define Robis's server URL.
     * @param {String} url
     */
    _defineURL(url) {
        this.url = this.prefix + url + this.suffix
    }

    /**
     * Move Robis forward.
     */
    _moveForward() {
        this.command('fwd')
    }

    /**
     * Move Robis backward.
     */
    _moveBackward() {
        this.command('bwd')
    }

    /**
     * Spin round to left.
    */
    _turnLeft() {
        this.command('left')
    }

    /**
     * Spin round to right.
    */
    _turnRight() {
        this.command('right')
    }

    /**
     * Stop Robis.
     */
    _stop() {
        this.command('stop')
    }
}

Robis.prototype.className = 'Robis'

export default Robis
