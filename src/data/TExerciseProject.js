import TProject from '@/data/TProject'
import TEnvironment from '@/env/TEnvironment'
import TParser from '@/run/TParser'
import TRuntime from '@/run/TRuntime'
import TError from '@/utils/TError'

/**
* TExercise manage exercises in "Learn" part of Declick.
* @exports TExercise
*/
function TExerciseProject() {
    // associated project
    const project = new TProject()
    TEnvironment.setProject(project)
    let checkStatements = false
    let initStatements = false
    let startStatements = false
    let endStatements = false
    let exerciseStatements = false
    let exercise = false
    let userCode = false
    let solutionCode = false
    let instructions = false
    let hints = false
    //TODO: generate this name dynamically and find a way to protect it
    const name = 'exercise_123456'
    let frame = false

    const checkImgs = /(<img\s[^>]*?src\s*=\s*['"])([^'"]*?)(['"][^>]*?>)/g

    /**
    * Set Project's ID.
    * @param {String} value
    */
    this.setId = value => {
        project.setId(value)
    }

    /**
    * Returns Project's ID.
    * @returns {String}
    */
    this.getId = () => project.getId()

    /**
    * Checks if Exercise has insructions.
    * @returns {Boolean}
    */
    this.hasInstructions = () => instructions !== false

    /**
    * Checks if Exercise has a solution.
    * @returns {Boolean}
    */
    this.hasSolution = () => solutionCode !== false

    /**
    * Checks if Exercise has hints.
    * @returns {Boolean}
    */
    this.hasHints = () => hints !== false

    /**
    * Checks if Exercise has start statementse.
    * @returns {Boolean}
    */
    this.hasStart = () => startStatements !== false

    /**
    * Checks if Exercise has iit statementse.
    * @returns {Boolean}
    */
    this.hasInit = () => initStatements !== false


    /**
    * Checks if Exercise has end statementse.
    * @returns {Boolean}
    */
    this.hasEnd = () => endStatements !== false

    /**
    * Checks if Exercise has check statements.
    * @returns {Boolean}
    */
    this.hasCheck = () => checkStatements !== false

    /**
    * Checks if Exercise has user code.
    * @returns {Boolean}
    */
    this.hasUserCode = () => userCode !== false

    /**
    * Get Project's instructions if defined.
    * @param {Function} callback
    */
    this.getInstructions = function(callback) {
        if (instructions !== false) {
            const self = this
            const resources = project.getResources()
            project.getResourceContent('instructions.html', content => {
                content = content.replace(checkImgs, (match, start, value, end) => {
                    if (typeof resources[value] !== 'undefined') {
                        return start + project.getResourceLocation(value) + end
                    } else {
                        return start + value + end
                    }
                })
                if (typeof callback !== 'undefined') {
                    callback.call(self, content)
                }
            })                
        } else {
            if (typeof callback !== 'undefined') {
                callback.call(this)
            }
        }
    }

    /**
    * Returns solution code.
    * @returns {String}
    */
    this.getSolution = () => {
        if (solutionCode !== false) {
            return solutionCode
        } else {
            return ''
        }
    }

    /**
    * Get Project's hints.
    * @param {function} callback
    */
    this.getHints = function(callback) {
        if (hints !== false) {
            project.getResourceContent('hints.html', callback)
        } else {
            if (typeof callback !== 'undefined') {
                callback.call(this)
            }
        }
    }

    /**
    * Get User code.
    * @returns {String}
    */
    this.getUserCode = () => {
        if (userCode !== false) {
            return userCode
        } else {
            return ''
        }
    }

    this.executeInit = () => {
        if (initStatements !== false) {
            TRuntime.executeStatements(initStatements)
        }
    }

    /**
    * Exectute init statements if any.
    */
    this.init = function() {
        if (exerciseStatements !== false) {
            TRuntime.executeStatements(exerciseStatements)
            exercise = TRuntime.getTObject(name)
            exercise.setFrame(frame)
        }
        this.executeInit()
    }

    /**
    * Exectute start statements if any.
    */
    this.start = () => {
        if (startStatements !== false) {
            TRuntime.executeStatements(startStatements)
        }
    }

    /**
    * Exectute end statements if any.
    */
    this.end = () => {
        if (endStatements !== false) {
            TRuntime.executeStatements(endStatements)
        }
    }

    /**
    * Execute check statements if any.
    */
    this.check = (statements, callback) => {
        exercise.setStatements(statements)
        if (checkStatements !== false) {
            TRuntime.evaluate(checkStatements, callback)
        }
    }

    /**
    * Loads solution code.
    * @param {Function} callback
    */
    const loadSolution = callback => {
        project.getProgramCode('solution', function(result) {
            if (!(result instanceof TError)) {
                solutionCode = result
            }
            callback.call(this)
        })
    }

    /**
    * Loads user code.
    * @param {Function} callback
    */
    const loadUserCode = callback => {
        project.getProgramCode('user', function(result) {
            if (!(result instanceof TError)) {
                userCode = result
            }
            callback.call(this)
        })
    }        

    /** Loads exercise
    * @param {Function} callback
    */
    const loadExercise = callback => {
        project.getProgramCode('exercise', function(result) {
            if (!(result instanceof TError)) {
                let code = `${name}= new Exercise();\n`
                code += '(function(){\n'
                code += result
                code += `\nreturn this;\n}).call(${name})`
                exerciseStatements = TParser.parse(code)
                initStatements = TParser.parse(`${name}.init()`)
                startStatements = TParser.parse(`${name}.start()`)
                endStatements = TParser.parse(`${name}.end()`)
                checkStatements = TParser.parse(`${name}.check()`)
            }
            callback.call(this)
        })
    }

    /**
    * Initialize Exercise.
    * @param {Function} callback
    * @param {Integer} id
    */
    this.load = (callback, id) => {
        checkStatements = false
        initStatements = false
        startStatements = false
        endStatements = false
        solutionCode = false
        instructions = false
        hints = false

        project.init(function() {
            // 1st check existing programs
            const programs = project.getProgramsNames()
            let solutionPresent = false
            let exercisePresent = false
            let userCodePresent = false
            let toLoad = 0

            if (programs.includes('solution')) {
                toLoad++
                solutionPresent = true
            }

            if (programs.includes('exercise')) {
                toLoad++
                exercisePresent = true
            }

            if (programs.includes('user')) {
                toLoad++
                userCodePresent = true
            }

            // 2nd check existing resources
            const resources = project.getResourcesNames()
            if (resources.includes('instructions.html')) {
                instructions = true
            }

            if (programs.includes('hints.html')) {
                hints = true
            }

            // 3rd load statements
            if (toLoad === 0) {
                // In case there is nothing to load: call callback now
                callback.call(this)
            }
            const checkLoad = function() {
                toLoad--
                if (toLoad === 0) {
                    callback.call(this)
                }
            }
            if (solutionPresent) {
                loadSolution(checkLoad)
            }
            if (exercisePresent) {
                loadExercise(checkLoad)
            }
            if (userCodePresent) {
                loadUserCode(checkLoad)
            }
        }, id)

    }

    this.setFrame = aFrame => {
        frame = aFrame
        if (exercise) {
            exercise.setFrame(aFrame)
        }
    }
}

export default TExerciseProject
