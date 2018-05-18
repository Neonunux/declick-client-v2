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
class Score extends Text {
    constructor(string) {
        if (typeof string === 'undefined') {
            string = 'Score : '
        }
        const displayedText = string + this.score
        super(displayedText)
    }

    /**
     * Reset score to 0.
     */
    _eraseScoreNumber() {
        this.score = 0
        this._setText(this.label + this.score)
    }

    /**
     * Increase score with integer step defined.
     * Default value : 1
     * @param {Number} step
     */
    _increaseScore(step) {
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
    _decreaseScore(step) {
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
    _setLabel(label) {
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
    _setScoreNumber(number) {
        this.score = TUtils.getInteger(number)
        this._setText(this.label + this.score)
    }

    /**
     * Get Label.
     * @returns {String}    Returns Label.
     */
    _getLabel() {
        const string = this.label
        return string
    }

    /**
     * Get score.
     * @returns {String} Return the score.
     */
    _getScoreNumber() {
        const string = `${this.score}` // "" to convert in string
        return string
    }

    /**
     * Get score's string.
     * @returns {String} Returns label and score.
     */
    _getScore() {
        const string = this.label + this.score
        return string
    }
}

Score.prototype.className = 'Score'
Score.prototype.label = 'Score : '
Score.prototype.score = 0

export default Score
