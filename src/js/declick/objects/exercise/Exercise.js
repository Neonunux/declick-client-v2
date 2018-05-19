import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'
import SynchronousManager from '@/utils/SynchronousManager'

/**
 * Defines Exercise, inherited from TObject.
 * Exercise is an object used to validate routes.
 * It compares values with statements, and can (un)validate steps.
 * @exports Exercise
 */
class Exercise extends TObject {
    constructor() {
        // Do not call parent constructor, as we don't want this object to be erased when clearing the
        // Runtime
        this.synchronousManager = new SynchronousManager()
        TRuntime.addInstance(this)

        this.statements = []
        this.frame = false
        this.score = 0
        this.message = ''
        this.values = {}
        this.requiredScore = 1
        this.displayedClasses = []
        this.displayedMethods = []
        this.completions = {}
        this.timer = -1
    }

    //Learn.countObject



    /**
     * Set the array of statements.
     * @param {String[]} value
     */
    setStatements(value) {
        this.statements = value
    }

    /**
     * Print Statements in debug.
     * @param {String} value
     */
    dumpStatements(value) {
        console.debug(this.statements)
    }

    /**
     * Set frame to "value".
     * @param {Boolean} value
     */
    setFrame(value) {
        this.frame = value
    }

    /**
     * Checks if the exercise statements contain a specific statement.
     * @param {Object} needle - The statement to find.
     * @param {Boolean} [deepSearch=true] - A boolean that defines if the search includes
     * statements contained in block statements.
     * @returns {Boolean} The search result.
     */
    containsStatement(needle, deepSearch) {
        if (typeof deepSearch === 'undefined') {
            deepSearch = true
        }
        const statements = this.statements.slice()

        for (const statement of statements) {
            if (matchObjects(statement, needle)) {
                return true
            }
            if (deepSearch && typeof statement.body !== 'undefined') {
                if (Object.prototype.toString.call(statement.body) === '[object Array]') {
                    Array.prototype.push.apply(statements, statement.body)
                } else if (typeof statement.body === 'object') {
                    statements.push(statement.body)
                }
            }
        }

        return false
    }

    hasStatement(needle, deepSearch) {
        return this.containsStatement(needle, deepSearch)
    }

    /**
     * Returns the number of statements.
     * @returns {Number}
     */
    statementsLength() {
        return (this.statements.length)
    }

    /**
     * Check if the code matches with the regexp
     * /!\ to verify "o = new O()", don't forget the \ before parenthesis
     * /!\ abort the syntax verification of the code
     * @param {String} value
     * @returns {Boolean} Returns true if the code matches with the regexp, else false.
     */
    verifyRegexp(value) {
        const re = new RegExp(value)
        return re.test(this.statements)
    }

    /**
     * Set the score
     * @param {Number} value
     */
    setScore(value) {
        this.score = value
    }

    /**
     * Set the message.
     * @param {Number} value
     */
    setMessage(value) {
        this.message  = value
    }

    /**
     * Validate the current exercise if "frame" is true
     * @param {String} message
     */
    validate(message) {
        if (this.frame) {
            this.frame.validateExercise(message)
        }
    }

    /**
     * Invalidate the current exercise if "frame" is true. Send a message.
     * @param {String} message
     */
    invalidate(message) {
        if (this.frame) {
            this.frame.invalidateExercise(message)
        }
    }

    /**
     * Set the score needed to validate
     * @param {number} value
     */
    setRequiredScore(value) {
        this.requiredScore = value
    }

    /**
     * Validate or invalidate the task, need to be appeal by
     * @param {String} optMessage is an optionnal message
     * @param {Number} optScore is an optionnal score
     */
    done(optMessage, optScore) {
        if(typeof optScore !== 'undefined') {
           this.setScore(optScore)
        }
        if(typeof optMessage !== 'undefined') {
           this.setMessage(optMessage)
        }
        if (this.frame) {
            this.frame.setScore(this.score)
        }
        if (this.score >= this.requiredScore) {
            this.validate(this.message)
        }
        else {
            this.invalidate(this.message)
        }
    }

    /**
     * Waits for "delay" ms.
     * @param {Number} delay
     */
    wait(delay) {
        this.synchronousManager.begin()
        const parent = this
        this.timer = window.setTimeout(() => {
            parent.synchronousManager.end()
        }, delay)
    }

    /**
     * Set value at values[name].
     * @param {String} name
     * @param {String} value
     */
    set(name, value) {
        this.values[name] = value
    }

    /**
     * Get the value of values[name].
     * @param {String} name
     * @returns {String|Boolean}    Returns values[name], or false if undefined.
     */
    get(name) {
        if (typeof this.values[name] !== 'undefined') {
            return this.values[name]
        } else {
            return false
        }
    }

    /**
     * Print value in log.
     * @param {String} value
     */
    log(value) {
        console.log(value)
    }

    /**
     * Print value in debug.
     * @param {String} value
     */
    debug(value) {
        console.debug(value)
    }

    /**
     * Set Text Mode.
     */
    setTextMode() {
        this.frame.setTextMode()
    }

    /**
     * Set Program Mode.
     */
    setProgramMode() {
        this.frame.setProgramMode()
    }

    /**
     * Set Completions.
     */
    setCompletions(json) {
        this.completions = json
    }

    /**
     * Get classes completions.
     */
    getDisplayedClasses() {
        for (const classes in completions) {
            if (typeof completions[classes] === 'undefined') {
               return []
            }
            if (typeof completions[classes] === 'object') {
                this.displayedClasses.push(classes)
            }
        }
        return this.displayedClasses
    }

    /**
     * Get displayed methods.
     */
    getDisplayedMethods(aClass) {
        const displayedClass = completions[aClass]
        const displayedMethods = []
        if (typeof displayedClass === 'undefined'){
            return []
        }
        const methods = displayedClass['methods']
        //TODO really sort methods = TUtils.sortArray(methods);
        if (typeof methods === 'Array'){
            return []
        }

        for (const i in methods) {
            displayedMethods.push({
                caption: methods[i]['translated'],
                value: methods[i]['displayed']
            })
        }

        return displayedMethods
    }

    freeze(value) {
    }

    clear() {
        if (this.timer !== -1) {
            window.clearTimeout(this.timer)
        }
        this.synchronousManager.end()
    }

    init() {
    }

    start() {
    }

    end() {
    }

    check() {
    }
}

Exercise.prototype.className = 'Exercise'

/**
 * Checks if 'base' and 'match' are the same type, in case they are objects also compares their
 * properties, in case they are primitive also compares their values.
 * @param {*} base - The base object for comparison.
 * @param {*} match - The match object for comparison.
 * @returns {Boolean} The comparison result.
 */
function matchObjects(base, match) {
    for (const key in match) {
        if (typeof base[key] === 'undefined') {
            return false
        }
        if (typeof base[key] === 'object') {
            if (typeof match[key] !== 'object') {
                return false
            }
            if (!matchObjects(base[key], match[key])) {
                return false
            }
        } else if (base[key] !== match[key]) {
            return false
        }
    }
    return true
}

export default Exercise
