import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import Text from '@/objects/text/Text'
import TGraphicalObject from '@/objects/tgraphicalobject/TGraphicalObject'
import TUtils from '@/utils/TUtils'

/**
 * Defines Score, inherited from Text.
 * Can manage a graphical score.
 * @param {String} string   Can define a string displayed before the score.
 * @returns {Score}
 * @exports Score
 */
var Score = function(string) {
    if (typeof string === 'undefined') {
        string = 'Score : '
    }
    var displayedText = string + this.score
    Text.call(this, displayedText)
}

Score.prototype = Object.create(Text.prototype)
Score.prototype.constructor = Score
Score.prototype.className = 'Score'
Score.prototype.label = 'Score : '
Score.prototype.score = 0

/**
 * Reset score to 0.
 */
Score.prototype._eraseScoreNumber = function() {
    this.score = 0
    this._setText(this.label + this.score)
}

/**
 * Increase score with integer step defined.
 * Default value : 1
 * @param {Number} step
 */
Score.prototype._increaseScore = function(step) {
    if (typeof step === 'undefined') {
        step = 1
    }
    this.score += TUtils.getInteger(step)
    this._setText(this.label + this.score)
}

/**
 * Decrease score with integer step defined.
 * Default value : 1
 * @param {Number} step
 */
Score.prototype._decreaseScore = function(step) {
    if (typeof step === 'undefined') {
        step = 1
    }
    this.score -= TUtils.getInteger(step)
    this._setText(this.label + this.score)
}

/**
 * Defines a string label displayed before score number
 * Default value : "Score : "
 * @param {String} label First part of displayed string
 */
Score.prototype._setLabel = function(label) {
    if (typeof label === 'undefined') {
        this.label = 'Score : '
    }
    else
        this.label = label
    this._setText(this.label + this.score)
}

/**
 * Defines score with integer given.
 * Default value : 0
 * @param {Number} number
 */
Score.prototype._setScoreNumber = function(number) {
    this.score = TUtils.getInteger(number)
    this._setText(this.label + this.score)
}

/**
 * Get Label.
 * @returns {String}    Returns Label.
 */
Score.prototype._getLabel = function() {
    var string = this.label
    return string
}

/**
 * Get score.
 * @returns {String} Return the score.
 */
Score.prototype._getScoreNumber = function() {
    var string = this.score + '' // "" to convert in string
    return string
}
/**
 * Get score's string.
 * @returns {String} Returns label and score.
 */
Score.prototype._getScore = function() {
    var string = this.label + this.score
    return string
}

export default Score
