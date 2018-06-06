import $ from 'jquery'

import TResource from '@/data/TResource'
import TEnvironment from '@/env/TEnvironment'
import TI18n from '@/env/TI18n'
import TGraphics from '@/run/TGraphics'
import TInterpreter from '@/run/TInterpreter'
import TParser from '@/run/TParser'
import TError from '@/utils/TError'
import TUtils from '@/utils/TUtils'

function TRuntime() {
    const interpreter = new TInterpreter()
    let runtimeCallback
    let graphics
    let log
    const tObjects = []
    const tInstances = []
    const tGraphicalObjects = []
    let designMode = false
    let frozen = false
    let wasFrozen = false
    let self
    const baseClasses = ['TObject', 'TGraphicalObject']
    const baseClasses3D = ['TObject3D']
    
    let Api
    
    this.load = function (callback) {

        // link interpreter to errorHandler
        interpreter.setErrorHandler(handleError)

        // create graphics;
        graphics = new TGraphics()

        self = this
        TEnvironment.log('loading base classes')
        // set repeat keyword
        TParser.setRepeatKeyword(TEnvironment.getMessage('repeat-keyword'))

        Api = require('@/objects/index')

        loadBaseClasses(TEnvironment.getLanguage(), () => {
            TEnvironment.log('* Retrieving list of translated objects')
            // find objects and translate them
            const classesUrl = TEnvironment.getObjectListUrl()
            TResource.get(classesUrl, [], data => {
                loadClasses(data, TEnvironment.getLanguage(), () => {
                    // Load translated error messages
                    TEnvironment.log('* Loading translated error messages')
                    TError.loadMessages(() => {
                        interpreter.initialize()
                        TEnvironment.log('**** TRUNTIME INITIALIZED ****')
                        if (typeof callback !== 'undefined') {
                            callback.call(self)
                        }
                    })
                })
            })
        })
    }

    var loadBaseClasses = (language, callback) => {
        let classes
        if (TEnvironment.is3DSupported()) {
            classes = baseClasses.concat(baseClasses3D)
        } else {
            classes = baseClasses
        }
        let classesToLoad = classes.length
        for (let i = 0; i < classes.length; i++) {
            const objectName = classes[i]
            TEnvironment.log(`adding base object ${objectName}`)
            const aClass = Api[objectName]
            // require([objectName], function(aClass) {
                TI18n.internationalize(aClass.default, false, language, () => {
                    classesToLoad--
                    if (classesToLoad === 0 && typeof callback !== 'undefined') {
                        callback.call(self)
                    }
                })
                // });
            }
        }
        
        var loadClasses = (classes, language, callback) => {
            const is3DSupported = TEnvironment.is3DSupported()
            let classesToLoad = Object.keys(classes).length
            $.each(classes, (key, val) => {
                let addObject = true
                if (typeof val.conditions !== 'undefined') {
                    // object rely on conditions
                    for (let i = 0; i < val.conditions.length; i++) {
                        const condition = val.conditions[i]
                        switch (condition) {
                            case '3d':
                            if (!is3DSupported) {
                                console.log(`skipping addition of object ${key}: 3D not supported`)
                                addObject = false
                            }
                            break
                        }
                    }
                }
                if (addObject) {
                    const lib = `objects/${val.path}/${key}`
                    if (typeof val.translations[language] !== 'undefined') {
                    TEnvironment.log(`adding ${lib}`)
                    const translatedName = val.translations[language]
                    let parents
                    let instance
                    if (typeof val.parents === 'undefined') {
                        parents = false
                    } else {
                        parents = val.parents
                    }
                    if (typeof val.instance === 'undefined') {
                        instance = false
                    } else {
                        instance = val.instance
                    }
                    
                    // require([lib], function(aClass) {
                        const aClass = Api[key]
                        // set Object path
                        let aConstructor = aClass
                        if (instance) {
                            // in case class is in fact an instance (e.g. special object declick),
                            // get its constructor
                            aConstructor = aClass.constructor
                        }
                        aConstructor.prototype.objectPath = val.path
                        TI18n.internationalize(aConstructor, parents, language, () => {
                        TEnvironment.log(`Declaring translated object '${translatedName}'`)
                        if (instance) {
                            interpreter.addInstance(aClass, translatedName)
                        } else {
                            interpreter.addClass(aClass, translatedName)
                        }
                        classesToLoad--
                        if (classesToLoad === 0 && typeof callback !== 'undefined') {
                            callback.call(self)
                        }
                    })
                    // });
                }
            } else {
                classesToLoad--
                if (classesToLoad === 0 && typeof callback !== 'undefined') {
                    callback.call(self)
                }
            }
        })
    }

    this.setCallback = callback => {
        runtimeCallback = callback
    }

    this.getCallback = () => runtimeCallback

    this.getTObject = objectName => interpreter.getObject(objectName)

    this.getTObjectName = reference => {
        if (reference.objectName) {
            return reference.objectName
        }
        const name = interpreter.getObjectName(reference)
        if (name) {
            reference.objectName = name
            return name
        }
        return false
    }

    this.getTObjectClassName = objectName => {
        const theObject = interpreter.getObject(objectName)
        if (theObject && theObject.className) {
            return theObject.className
        }
        return false
    }

    this.getClassTranslatedMethods = className => {
        const theClass = interpreter.getClass(className)
        if (theClass && typeof theClass.prototype.translatedMethodsDisplay !== 'undefined') {
            return theClass.prototype.translatedMethodsDisplay
        }
        return false
    }

    this.getTObjectTranslatedMethods = objectName => {
        const theObject = interpreter.getObject(objectName)
        if (theObject && typeof theObject.translatedMethodsDisplay !== 'undefined') {
            return theObject.translatedMethodsDisplay
        }
        return false
    }

    // COMMANDS EXECUTION

    var handleError = (err, programName) => {
        let error
        if (!(err instanceof TError)) {
            error = new TError(err)
            error.detectError()
        } else {
            error = err
        }
        if (typeof programName !== 'undefined') {
            error.setProgramName(programName)
        }
        if (typeof log !== 'undefined') {
            log.addError(error)
        } else {
            TEnvironment.error(error)
        }
    }

    this.evaluate = function (statements, callback) {
        const breakpoint = interpreter.createCallbackStatement(() => {
            callback(interpreter.convertToNative(interpreter.output))
        })
        const body = statements.body.slice()
        statements = $.extend({}, statements)
        statements.body = body
        statements.body.push(breakpoint)
        this.executeStatements(statements)
    }

    this.handleError = err => {
        handleError(err)
    }

    this.executeStatements = statements => {
        interpreter.addStatements(statements)
    }

    this.insertStatements = statements => {
        interpreter.insertStatements(statements)
    }

    this.insertStatement = (statement, parameters) => {
        interpreter.insertStatement(statement, parameters)
    }

    this.executeStatementsNow = (statements, parameters, log, callback) => {
        /*if (typeof parameter !== 'undefined') {
            // TODO: find a better way than using a string representation
            parameter = JSON.stringify(parameter);
        }*/
        interpreter.addPriorityStatements(statements, parameters, log, callback)
    }

    this.executeNow = function (commands, parameters, logCommands, callback) {
        this.executeStatementsNow(commands, parameters, logCommands, callback)
    }

    this.executeFrom = function (object, programName) {
        if (typeof programName === 'undefined') {
            programName = null
        }
        try {
            const statements = object.getStatements()
            this.executeStatements(statements)
        } catch (e) {
            handleError(e, programName)
        }
    }

    this.allowPriorityStatements = () => {
        interpreter.allowPriorityStatements()
    }

    this.refusePriorityStatements = () => {
        interpreter.refusePriorityStatements()
    }

    // LOG MANAGEMENT

    this.setLog = element => {
        log = element
        interpreter.setLog(element)
    }

    this.logCommand = command => {
        if (typeof log !== 'undefined') {
            log.addCommand(command)
        }
    }

    this.stop = function () {
        graphics.pause()
        wasFrozen = frozen
        this.freeze(true)
    }

    this.start = function () {
        graphics.unpause()
        if (!wasFrozen) {
            this.freeze(false)
        }
    }

    // SYNCHRONOUS EXECUTION

    this.suspend = () => {
        interpreter.suspend()
    }

    this.resume = () => {
        interpreter.resume()
    }

    this.interrupt = () => {
        interpreter.interrupt()
    }

    // OBJECTS MANAGEMENT

    this.addObject = object => {
        tObjects.push(object)
        // initialize object with current state
        object.freeze(frozen)
    }

    this.addInstance = instance => {
        tInstances.push(instance)
        // initialize object with current state
        instance.freeze(frozen)
    }

    this.removeObject = object => {
        const index = tObjects.indexOf(object)
        if (index > -1) {
            tObjects.splice(index, 1)
            interpreter.deleteObject(object)
        }
    }

    this.addGraphicalObject = (object, actually) => {
        if (typeof actually === 'undefined' || actually) {
            graphics.insertObject(object.getGObject())
        }
        tGraphicalObjects.push(object)
        // initialize object with current state
        object.freeze(frozen)
        object.setDesignMode(designMode)
    }

    this.removeGraphicalObject = object => {
        const index = tGraphicalObjects.indexOf(object)
        if (index > -1) {
            graphics.removeObject(object.getGObject())
            tGraphicalObjects.splice(index, 1)
            interpreter.deleteObject(object)
        }
    }

    // GRAPHICS MANAGEMENT

    this.getGraphics = () => graphics

    this.clearGraphics = () => {
        while (tGraphicalObjects.length > 0) {
            const object = tGraphicalObjects[0]
            // deleteObject will remove object from tGraphicalObjects
            object.deleteObject()
        }
    }

    this.clearObjects = () => {
        while (tObjects.length > 0) {
            const object = tObjects[0]
            // deleteObject will remove object from tGraphicalObjects
            object.deleteObject()
        }
        // clear instances
        for (let i = 0; i < tInstances.length; i++) {
            tInstances[i].clear()
        }
    }

    this.clear = function () {
        interpreter.clear()
        // TODO: clear RuntimeFrame as well (e.g. to erase declared functions)
        this.clearGraphics()
        this.clearObjects()
    }

    this.init = () => {
        // init instances
        for (let i = 0; i < tInstances.length; i++) {
            tInstances[i].init()
        }
    }

    this.setDesignMode = value => {
        // TODO: handle duplicate objects
        for (let i = 0; i < tGraphicalObjects.length; i++) {
            tGraphicalObjects[i].setDesignMode(value)
        }
        designMode = value
    }

    this.freeze = function (value) {
        let i
        if (value) {
            this.suspend()
        } else {
            this.resume()
        }

        for (i = 0; i < tGraphicalObjects.length; i++) {
            tGraphicalObjects[i].freeze(value)
        }
        for (i = 0; i < tObjects.length; i++) {
            tObjects[i].freeze(value)
        }
        frozen = value
    }

    this.getGraphics = () => graphics

    this.exposeProperty = (reference, property, name) => {
        interpreter.exposeProperty(reference, property, name)
    }

    this.createCallStatement = functionStatement => interpreter.createCallStatement(functionStatement)

    this.createFunctionStatement = functionStatement => interpreter.createFunctionStatement(functionStatement)
}

const runtimeInstance = new TRuntime()

export default runtimeInstance