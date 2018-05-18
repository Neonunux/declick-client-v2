import $ from 'jquery'
import 'platform-pr' // platform-pr
import Prism from 'prism' // prism
import SplitPane from 'split-pane'

import TExerciseProject from '@/data/TExerciseProject'
import TLink from '@/data/TLink'
import TEnvironment from '@/env/TEnvironment'
import TLearnCanvas from '@/ui/TLearnCanvas'
import TLearnEditor from '@/ui/TLearnEditor'
import TComponent from '@/ui/TComponent'
import TRuntime from '@/run/TRuntime'
import TError from '@/utils/TError'

class TLearnFrame extends TComponent {
    constructor(callback) {
        let $text
        let $message
        let $textMessage
        let $textMessageContent
        let $messageContent
        let $instruction
        let $instructions
        let $solution
        let $solutionContent
        let $input
        let $loading
        let $right
        let $success
        let $successText
        let $slide
        let $slideContent
        let $buttonNext
        let $buttonOk
        let canvas
        let editor

        const exercise = new TExerciseProject()
        const bottomSolution = 0
        let score = 0
        let lastSubmission = ''
        let textMode = false
        let initialized = false
        let messageDisplayed = false
        let solutionDisplayed = false
        let slideDisplayed = false

        super('TLearnFrame.html', function(component) {
            $text = component.find('#tlearnframe-text')
            $input = $text.find('#tlearnframe-text-input')
            $message = component.find('#tlearnframe-message')
            $messageContent = component.find('#tlearnframe-message-content')
            $textMessage = component.find('#tlearnframe-text-message')
            $textMessageContent = component.find('#tlearnframe-text-message-content')
            const $messageClose = component.find('#tlearnframe-message-close')
            $messageClose.click(e => {
                $message.fadeOut(500)
            })
            const $textMessageClose = component.find('#tlearnframe-text-message-close')
            $textMessageClose.click(e => {
                $textMessage.fadeOut(500)
            })
            const $buttonClear = component.find('.ttoolbar-button-clear')
            $buttonClear.attr('title', 'Réinitialiser')
            $buttonClear.click(e => {
                clear()
            })
            const $buttonExecute = component.find('.ttoolbar-button-execute')
            $buttonExecute.attr('title', TEnvironment.getMessage('button-execute'))
            $buttonExecute.click(e => {
                execute()
            })
            const $buttonErase = component.find('.ttoolbar-button-erase')
            $buttonErase.attr('title', TEnvironment.getMessage('button-erase'))
            $buttonErase.click(e => {
                clear()
            })
            const $buttonCheck = component.find('.ttoolbar-button-check')
            $buttonCheck.attr('title', TEnvironment.getMessage('button-check'))
            $buttonCheck.click(e => {
                execute()
            })

            $buttonNext = component.find('.ttoolbar-button-next')
            $buttonNext.prepend(TEnvironment.getMessage('button-next-step'))
            $buttonNext.click(e => {
                platform.validate('nextOnly')
            })

            const $buttonClose = component.find('.ttoolbar-button-close')
            $buttonClose.click(e => {
                hideSuccess()
            })

            $buttonOk = component.find('#tlearnframe-slide-ok')
            $buttonOk.text(TEnvironment.getMessage('button-slide-ok'))
            $buttonOk.click(e => {
                e.preventDefault()
                e.stopPropagation()
                platform.validate('nextImmediate')
            })

            $instructions = component.find('#tlearnframe-instructions')
            $instruction = component.find('#tlearnframe-instruction')
            $solution = component.find('#tlearnframe-solution')
            $solution = component.find('#tlearnframe-solution')
            $solutionContent = component.find('#tlearnframe-solution-content')

            $loading = component.find('#tlearnframe-loading')
            const loadingText = $loading.find('p')
            loadingText.text(TEnvironment.getMessage('loading-message'))

            $right = component.find('#tlearnframe-right')

            $success = component.find('#tlearnframe-success')
            $successText = component.find('#tlearnframe-success-text')

            $slide = component.find('#tlearnframe-slide')
            $slideContent = $slide.find('#tlearnframe-slide-content')

            const self = this
            canvas = new TLearnCanvas(c => {
                component.find('#TLearnCanvas').replaceWith(c)
                editor = new TLearnEditor(d => {
                    component.find('#TLearnEditor').replaceWith(d)
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component)
                    }
                })
            })

        })

        // wait until $right's height is not null
        const initSplitPane = () => {
            if ($right.height() > 0) {
                $('.split-pane').splitPane()
            }
            else {
                $(window).one('resize', initSplitPane)
            }
        }

        this.mounted = function() {
            canvas.mounted()
            editor.mounted()
            exercise.setFrame(this)
            $right.on('splitpane:resized', () => {
                editor.resize()
            })
            initSplitPane()
            // declare itself as log
            TRuntime.setLog(this)
            window.platform.initWithTask(window.task)
        }

        this.init = () => {
            const height = $solution.height()
            $solution.css('top', `${-height}px`)
            $solution.css('bottom', `${height + bottomSolution}px`)
            $solution.css('visibility', 'visible')
            $solution.hide()
            $slide.hide()

            canvas.removeLoading()
            initialized = true
        }

        this.update = function(id, slide, ok, callback) {
            hideSuccess()
            if (slide) {
                if (!initialized) {
                    this.init()
                }
                this.loading()
                var self = this
                this.displaySlide(id, ok, function() {
                    self.loaded()
                    if (typeof callback !== 'undefined') {
                        callback.call(this)
                    }
                })
            }
            else {
                const exerciseId = parseInt(id)
                if (isNaN(exerciseId)) {
                    TEnvironment.error('Could not parse exercise id')
                    if (!initialized) {
                        this.init()
                    }
                    if (typeof callback !== 'undefined') {
                        callback.call(this)
                    }
                }
                else /*if (exerciseId !== exercise.getId() || slideDisplayed)*/ {
                    this.loading()
                    var self = this
                    this.loadExercise(exerciseId, () => {
                        if (!initialized) {
                            self.init()
                        }
                        self.loaded()
                        window.platform.showView({ task: {} }, () => {
                            if (typeof callback !== 'undefined') {
                                callback.call(self)
                            }
                        }, () => {
                            window.console.error('error while sending show View to platform')
                        })
                    })
                }
                /*else {
                                   if (typeof callback !== 'undefined') {
                                       callback.call(this);
                                   }
                               }*/
            }
        }

        this.load = function(callback) {
            const self = this
            TEnvironment.registerParametersHandler((parameters, callback) => {
                let id = false
                let slide = false
                let ok = true
                for (const name in parameters) {
                    const value = parameters[name]
                    if (name === 'id') {
                        id = value
                    }
                    else if (name === 'slide') {
                        id = value
                        slide = true
                    }
                    if (name === 'ok') {
                        ok = (value == 'true' || value == 0)
                    }
                }
                if (id) {
                    self.update(id, slide, ok, callback)
                }
                else if (callback) {
                    callback.call(self)
                }
            }, callback)
        }

        this.loading = () => {
            $slide.hide()
            $loading.stop().css({ opacity: 1 }).show()
        }

        this.loaded = () => {
            $loading.stop().fadeOut(200, function() {
                $(this).hide()
            })
        }

        const context = this

        const step = () => {
            try {
                let statements
                if (textMode) {
                    statements = $input.val()
                    lastSubmission = statements
                }
                else {
                    statements = editor.getStatements()
                    lastSubmission = editor.getValue()
                    exercise.start()
                    TRuntime.executeStatements(statements)
                    canvas.giveFocus()
                    exercise.end()
                    statements = statements.body
                }
                exercise.check(statements, output => {
                    let message
                    if (output.result === 'success') {
                        if (output.score < 100) {
                            message = output.message
                        }
                        let next = true
                        if (typeof output.next !== 'undefined') {
                            next = output.next
                        }
                        context.validateExercise(message, next)
                    }
                    else if (output.result === 'failure') {
                        context.invalidateExercise(output.message)
                    }
                    else if (output.action === 'reset') {
                        exercise.executeInit()
                        step()
                    }
                })
            }
            catch (err) {
                let error
                if (!(err instanceof TError)) {
                    error = new TError(err)
                    error.detectError()
                }
                else {
                    error = err
                }
                showError(error.getMessage())
            }
        }

        var execute = () => {
            hideMessage()
            if (!textMode) {
                clear(false)
            }
            step()
        }

        var clear = resetCode => {
            if (typeof resetCode === 'undefined') {
                resetCode = true
            }
            hideMessage()
            if (textMode) {
                // clear editor value
                $input.val('')
                // clear code editor value as well since setTextMode will copy value
                editor.setValue('')
            }
            else {
                // clear runtime
                TRuntime.clear()
                if (resetCode && exercise.hasUserCode()) {
                    editor.setValue(exercise.getUserCode())
                }
            }
            exercise.init()
        }

        this.validateExercise = (message, next) => {
            try {
                platform.validate('stay')
            }
            catch (e) {
                TEnvironment.error('Error validating exercise')
            }
            if (typeof message === 'undefined' || message === '') {
                message = TEnvironment.getMessage('success-message')
            }
            if (typeof next === 'undefined') {
                next = true
            }
            window.setTimeout(() => {
                showSuccess(message, next)
            }, 1000)
        }

        this.invalidateExercise = message => {
            showMessage(message)
        }

        var showError = message => {
            if (textMode) {
                $textMessageContent.text(message)
                $textMessage.addClass('tlearnframe-error')
                $textMessage.show()
            }
            else {
                $messageContent.text(message)
                $message.addClass('tlearnframe-error')
                $message.show()
            }
            messageDisplayed = true
        }

        var showMessage = message => {
            if (textMode) {
                $textMessageContent.text(message)
                $textMessage.addClass('tlearnframe-message')
                $textMessage.show()
            }
            else {
                $messageContent.text(message)
                $message.addClass('tlearnframe-message')
                $message.show()
            }
            messageDisplayed = true
        }

        var showSuccess = (message, next) => {
            $successText.text(message)
            if (next) {
                $buttonNext.show()
            }
            else {
                $buttonNext.hide()
            }
            $success.show()
        }

        var hideSuccess = () => {
            $success.hide()
        }

        const hideSlide = () => {
            $slide.off('load')
            $slide.hide()
            slideDisplayed = false
        }

        var hideMessage = () => {
            $message.hide()
            $message.removeClass('tlearnframe-error')
            $message.removeClass('tlearnframe-message')
            $textMessage.hide()
            $textMessage.removeClass('tlearnframe-error')
            $textMessage.removeClass('tlearnframe-message')
            messageDisplayed = false
        }

        this.loadExercise = function(id, callback) {
            if (solutionDisplayed) {
                closeSolution()
            }
            if (messageDisplayed) {
                hideMessage()
            }
            hideSlide()
            // by default: program mode
            this.setProgramMode()
            TRuntime.clear()
            editor.clear()
            $input.val()
            score = 0
            lastSubmission = ''
            exercise.load(function() {
                // set user code
                if (exercise.hasUserCode()) {
                    editor.setValue(exercise.getUserCode())
                }
                // set instruction
                if (exercise.hasInstructions()) {
                    exercise.getInstructions(function(data) {
                        $instructions.html(data)
                        Prism.highlightAll(false)
                        exercise.init()
                        // TODO: send callback to exercise.init() when interpreter supports callbacks
                        if (typeof callback !== 'undefined') {
                            callback.call(this)
                        }
                    })
                }
                else {
                    exercise.init()
                    // TODO: send callback to exercise.init() when interpreter supports callbacks
                    if (typeof callback !== 'undefined') {
                        callback.call(this)
                    }
                }
            }, id)
        }


        const openSolution = solutionHTML => {
            $solutionContent.html(solutionHTML)
            $solution.show().stop().animate({ top: '0px', bottom: `${bottomSolution}px` }, 600)
            solutionDisplayed = true
        }

        var closeSolution = () => {
            const height = $solution.height()
            $solution.stop().animate({ top: `${-height}px`, bottom: `${height + bottomSolution}px` }, 600, function() {
                $(this).hide()
            })
            solutionDisplayed = false
        }



        /**
         * Get the code unparsed
         * @returns {string}
         */
        this.getCode = () => editor.getValue()

        /**
         * Get the value of text input
         * @returns {string}
         */
        this.getText = () => $input.val()


        /**
         * Get the answer entered by user
         * @returns {string}
         */
        this.getAnswer = function() {
            if (textMode) {
                return this.getText()
            }
            else {
                return this.getCode()
            }
        }

        /**
         * Get the last submission entered by user
         * @returns {string}
         */
        this.getLastSubmission = () => lastSubmission

        /**
         * Set the code in the editor
         * @param {string} value
         */
        this.setCode = value => {
            editor.setValue(value)
        }

        /**
         * Set the value of text editor
         * @param {string} value
         */
        this.setText = value => {
            $input.val(value)
        }

        /**
         * Set the value of user's answer
         * @param {string} value
         */
        this.setAnswer = function(value) {
            if (textMode) {
                this.setText(value)
            }
            else {
                this.setCode(value)
            }
        }

        /**
         * Get the score
         * @returns {number}
         */
        this.getScore = () => score

        /**
         * Set the score
         * @param {number} value
         */
        this.setScore = value => {
            score = value
        }

        /**
         * Get the message
         * @returns {string}
         */
        this.getMessage = () => exercise.getMessage()

        /**
         * Set the message
         * @param {string} value
         * @returns {unresolved}
         */
        this.setMessage = value => exercise.setMessage(value)

        /**
         * Get the message
         * @returns {string}
         */
        this.getSolution = () => exercise.getSolution()

        /**
         * Display or hide the solution
         * @param {boolean} display or hide the solution
         */
        this.displaySolution = display => {
            if (exercise.hasSolution() && display) {
                const solutionCode = exercise.getSolution()
                const solutionHTML = solutionCode.replace(/\n/g, '<br>')
                openSolution(solutionHTML)
            }
            else {
                closeSolution()
            }
        }

        this.setTextMode = function() {
            // copy current value if any
            // TODO: fix this
            this.setText(this.getCode())
            $text.css('display', 'block')
            $instruction.addClass('text-mode')
            textMode = true
        }

        this.setProgramMode = () => {
            $text.css('display', 'none')
            $instruction.removeClass('text-mode')
            textMode = false
        }


        // LOG MANAGEMENT

        this.addError = error => {
            showError(error.getMessage())
        }

        this.addCommand = command => {
            // do nothing
        }


        this.displaySlide = (slideId, ok, callback) => {
            TLink.getSlideContent(slideId, function(data) {
                if (data instanceof TError) {
                    $slideContent.html(`<div class='tlearnframe-slide-error'>${data.getMessage()}</div>`)
                }
                else {
                    $slideContent.html(data)
                }
                if (ok) {
                    $buttonOk.show()
                }
                else {
                    $buttonOk.hide()
                }
                $slide.show()
                slideDisplayed = true
                if (typeof callback !== 'undefined') {
                    callback.call(this)
                }
            })
        }
    }
}

export default TLearnFrame
