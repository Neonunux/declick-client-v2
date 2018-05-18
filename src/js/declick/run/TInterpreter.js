import acorn from 'acorn'
import Interpreter from 'js-interpreter'

import TError from '@/utils/TError'
import TUtils from '@/utils/TUtils'

class TInterpreter {
    constructor() {
        const MAX_STEP = 100
        let log
        let errorHandler
        const classes = {}
        const translatedClasses = {}
        const instances = {}
        const stored = {}
        let stepCount = 0
        let interpreter
        let running = false
        let priorityStatementsAllowed = true
        Object.defineProperty(this, 'output', {
            get() {
                return interpreter.value
            }
        })
        this.convertToNative = data => getNativeData(data)
        var getNativeData = data => {
            let result
            if (data.type) {
                if (data.type === 'function') {
                    return data
                }
                else if (typeof data.data !== 'undefined') {
                    // primitive data or declick objects
                    return data.data
                }
                else if (data.type === 'object') {
                    if (typeof data.length !== 'undefined') {
                        // we are in an array
                        result = []
                        for (let i = 0; i < data.length; i++) {
                            result.push(getNativeData(data.properties[i]))
                        }
                        return result
                    }
                    else {
                        result = {}
                        for (const member in data.properties) {
                            result[member] = getNativeData(data.properties[member])
                        }
                        return result
                    }
                }
            }
            return data
        }
        const getInterpreterData = data => {
            let result
            if (data instanceof Array) {
                // Array
                result = interpreter.createObject(interpreter.ARRAY)
                for (let i = 0; i < data.length; i++) {
                    interpreter.setProperty(result, i, getInterpreterData(data[i]))
                }
                return result
            }
            else if (typeof data === 'object') {
                // Object
                if (data.className) {
                    // declick object: wrap it
                    if (translatedClasses[data.className]) {
                        result = interpreter.createObject(getClass(translatedClasses[data.className]))
                        result.data = data
                        return result
                    }
                }
            }
            else {
                // Primitive types
                return interpreter.createPrimitive(data)
            }
            return data
        }
        const getClassMethodWrapper = (className, methodName) => function () {
            // transform data from interpreter into actual data
            const args = []
            for (let i = 0; i < arguments.length; i++) {
                args.push(getNativeData(arguments[i]))
            }
            return getInterpreterData(classes[className].prototype[methodName].apply(this.data, args))
        }
        //TODO: store classes
        var getClass = name => {
            const parent = interpreter.createObject(interpreter.FUNCTION)
            if (typeof classes[name].prototype !== 'undefined' && typeof classes[name].prototype.translatedMethods !== 'undefined') {
                const translated = classes[name].prototype.translatedMethods
                for (const methodName in translated) {
                    interpreter.setProperty(parent.properties.prototype, translated[methodName], interpreter.createNativeFunction(getClassMethodWrapper(name, methodName)))
                }
            }
            return parent
        }
        this.initialize = () => {
            const initFunc = (interpreter, scope) => {
                let name
                let object
                // #1 Declare translated Instances
                const getInstanceMethodWrapper = (className, methodName) => function () {
                    // transform data from interpreter into actual data
                    const args = []
                    for (let i = 0; i < arguments.length; i++) {
                        args.push(getNativeData(arguments[i]))
                    }
                    return getInterpreterData(instances[className][methodName].apply(this.data, args))
                }
                const getInstance = name => {
                    const object = interpreter.createObject(interpreter.FUNCTION)
                    object.data = instances[name]
                    if (typeof instances[name].translatedMethods !== 'undefined') {
                        const translated = instances[name].translatedMethods
                        for (const methodName in translated) {
                            interpreter.setProperty(object, translated[methodName], interpreter.createNativeFunction(getInstanceMethodWrapper(name, methodName)))
                        }
                    }
                    return object
                }
                for (name in instances) {
                    if (stored[name]) {
                        // instance already created and stored
                        object = stored[name]
                    }
                    else {
                        object = getInstance(name)
                        stored[name] = object
                    }
                    interpreter.setProperty(scope, name, object, true)
                }
                // #2 Declare translated Classes
                // generate wrapper for translated methods
                const getObject = name => {
                    const wrapper = function () {
                        const obj = interpreter.createObject(getClass(name))
                        const declickObj = Object.create(classes[name].prototype)
                        // transform data from interpreter into actual data
                        const args = []
                        for (let i = 0; i < arguments.length; i++) {
                            args.push(getNativeData(arguments[i]))
                        }
                        classes[name].apply(declickObj, args)
                        obj.data = declickObj
                        return obj
                    }
                    const obj = interpreter.createNativeFunction(wrapper)
                    return obj
                }
                for (name in classes) {
                    if (stored[name]) {
                        // instance already created and stored
                        object = stored[name]
                    }
                    else {
                        object = getObject(name)
                        stored[name] = object
                    }
                    interpreter.setProperty(scope, name, object, true)
                }
            }
            interpreter = new Interpreter('', initFunc)
        }
        this.setLog = element => {
            log = element
        }
        this.setErrorHandler = handler => {
            errorHandler = handler
        }
        /* Lifecycle management */
        const clear = () => {
            stop()
        }
        this.clear = () => {
            clear()
        }
        this.suspend = () => {
            interpreter.paused_ = true
        }
        this.resume = () => {
            if (interpreter.paused_) {
                interpreter.paused_ = false
                run()
            }
        }
        this.stop = () => {
            stop()
        }
        const logCommand = command => {
            if (typeof log !== 'undefined') {
                log.addCommand(command)
            }
        }
        var stop = scope => {
            running = false
            const emptyAST = acorn.parse('')
            if (!scope) {
                scope = interpreter.createScope(emptyAST, null)
            }
            interpreter.stateStack = [{
                node: emptyAST,
                scope,
                thisExpression: scope,
                done: false
            }]
            interpreter.paused_ = false
            priorityStatementsAllowed = true
        }
        const nextStep = () => {
            try {
                if (interpreter.step()) {
                    stepCount++
                    if (!interpreter.paused_) {
                        if (stepCount >= MAX_STEP) {
                            stepCount = 0
                            window.setTimeout(nextStep, 0)
                        }
                        else {
                            nextStep()
                        }
                    }
                }
                else {
                    running = false
                }
                //logCommand(interpreter.stateStack);
            }
            catch (err) {
                let state
                let error
                if (!(err instanceof TError)) {
                    error = new TError(err)
                    if (interpreter.stateStack.length > 0) {
                        state = interpreter.stateStack[0]
                        if (state.node.loc) {
                            error.setLines([state.node.loc.start.line, state.node.loc.end.line])
                        }
                    }
                    error.detectError()
                }
                else {
                    error = err
                }
                if (interpreter.stateStack.length > 0) {
                    state = interpreter.stateStack[0]
                    if (!state.node.loc || !state.node.loc.source) {
                        // no program associated: remove lines if any
                        error.setLines([])
                    }
                    else {
                        error.setProgramName(state.node.loc.source)
                    }
                }
                const baseState = interpreter.stateStack.pop()
                stop(baseState.scope)
                if (typeof errorHandler !== 'undefined') {
                    errorHandler(error)
                }
                else {
                    throw error
                }
            }
        }
        var run = () => {
            running = true
            nextStep()
        }
        this.start = () => {
            if (!running) {
                stepCount = 0
                run()
            }
        }
        this.addStatement = function (statement) {
            interpreter.appendCode(statement)
            if (!running) {
                this.start()
            }
        }
        this.addStatements = function (statements) {
            interpreter.appendCode(statements)
            if (!running) {
                this.start()
            }
        }
        this.insertStatement = function (statement, parameters) {
            interpreter.insertCode(statement, true, parameters)
            if (!running) {
                this.start()
            }
        }
        this.insertStatements = function (statements) {
            interpreter.insertBlock(statements, false)
            if (!running) {
                this.start()
            }
        }
        this.addPriorityStatements = function (statements, parameters, log, callback) {
            if (priorityStatementsAllowed) {
                if (typeof parameters !== 'undefined') {
                    for (let i = 0; i < parameters.length; i++) {
                        parameters[i] = getInterpreterData(parameters[i])
                    }
                }
                if (typeof callback !== 'undefined') {
                    interpreter.insertCode(statements, true, parameters, this.createCallbackStatement(callback))
                }
                else {
                    interpreter.insertCode(statements, true, parameters)
                }
                if (!running) {
                    this.start()
                }
            }
        }
        this.addClass = (func, name) => {
            classes[name] = func
            if (func.prototype.className) {
                translatedClasses[func.prototype.className] = name
            }
        }
        this.addInstance = (func, name) => {
            instances[name] = func
        }
        this.getClass = name => {
            if (classes[name]) {
                return classes[name]
            }
            else {
                return null
            }
        }
        this.getObject = name => {
            try {
                const obj = interpreter.getValueFromScope(name)
                if (obj && obj.data) {
                    return obj.data
                }
                return null
            }
            catch (err) {
                return null
            }
        }
        this.getObjectName = reference => {
            let scope = interpreter.getScope()
            while (scope) {
                for (const name in scope.properties) {
                    const obj = scope.properties[name]
                    if (obj.data && obj.data === reference) {
                        return name
                    }
                }
                scope = scope.parentScope
            }
            return null
        }
        this.deleteObject = reference => {
            let scope = interpreter.getScope()
            while (scope) {
                for (const name in scope.properties) {
                    const obj = scope.properties[name]
                    if (!scope.fixed[name] && obj.data) {
                        if (obj.data === reference) {
                            interpreter.deleteProperty(scope, name)
                            return true
                        }
                    }
                }
                scope = scope.parentScope
            }
            return false
        }
        this.exposeProperty = (reference, property, propertyName) => {
            let scope = interpreter.getScope()
            const wrapper = function () {
                return getInterpreterData(this.data[property])
            }
            while (scope) {
                for (const name in scope.properties) {
                    const obj = scope.properties[name]
                    if (obj.data === reference) {
                        const prop = interpreter.createObject(null)
                        prop.dynamic = wrapper
                        //window.console.log(typeof property);
                        interpreter.setProperty(obj, propertyName, prop)
                        return true
                    }
                }
                scope = scope.parentScope
            }
            return false
        }
        this.createCallStatement = function (functionStatement) {
            const state = [{ type: 'InnerCallExpression', arguments: [], func_: functionStatement, loc: functionStatement.node.loc }]
            return state
        }
        this.createCallbackStatement = callback => {
            const statement = { type: 'CallbackStatement', callback }
            return statement
        }
        this.createFunctionStatement = (body, parameters) => {
            if (typeof parameters === 'undefined') {
                parameters = []
            }
            const node = { type: 'FunctionExpression', body: { type: 'BlockStatement', body }, params: parameters }
            const statement = interpreter.createFunction(node)
            return statement
        }
        this.interrupt = () => {
            interpreter.stateStack.shift()
            interpreter.stateStack.unshift({ node: { type: 'InterruptStatement' }, priority: true, done: false })
        }
        this.allowPriorityStatements = () => {
            priorityStatementsAllowed = true
        }
        this.refusePriorityStatements = () => {
            priorityStatementsAllowed = false
        }
    }
}


// Modify Interpreter to handle function declaration
Interpreter.prototype.stepFunctionDeclaration = function() {
    const state = this.stateStack.shift()
    this.setValue(this.createPrimitive(state.node.id.name), this.createFunction(state.node))
}

// Modify Interpreter to throw exception when trying to redefining fixed property
Interpreter.prototype.setValueToScope = function(name, value) {
    let scope = this.getScope()
    const strict = scope.strict
    const nameStr = name.toString()
    while (scope) {
        if ((nameStr in scope.properties) || (!strict && !scope.parentScope)) {
            if (!scope.fixed[nameStr]) {
                scope.properties[nameStr] = value
            } else {
                this.throwException(this.REFERENCE_ERROR, `${nameStr} is alderady defined`)
            }
            return
        }
        scope = scope.parentScope
    }
    this.throwException(this.REFERENCE_ERROR, `${nameStr} is not defined`)
}

// Modify Interpreter to not delete statements when looking for a try
Interpreter.prototype.throwException = function(errorClass, opt_message) {
    let error
    if (this.stateStack[0].interpreter) {
        // This is the wrong interpreter, we are spinning on an eval.
        try {
            this.stateStack[0].interpreter.throwException(errorClass, opt_message)
            return
        } catch (e) {
            // The eval threw an error and did not catch it.
            // Continue to see if this level can catch it.
        }
    }
    if (opt_message === undefined) {
        error = errorClass
    } else {
        error = this.createObject(errorClass)
        this.setProperty(error, 'message',
        this.createPrimitive(opt_message), false, true)
    }
    // Search for a try statement.
    let i = 0
    let state
    const length = this.stateStack.length
    do {
        state = this.stateStack[i]
        i++
    } while (i < length && state.node.type !== 'TryStatement')
    if (state.node.type === 'TryStatement') {
        for (let j = 0; j < i; j++) {
            this.stateStack.shift()
        }
        // Error is being trapped.
        this.stateStack.unshift({
            node: state.node.handler,
            throwValue: error
        })
    } else {
        // Throw a real error.
        let realError
        if (this.isa(error, this.ERROR)) {
            const errorTable = {
                'EvalError': EvalError,
                'RangeError': RangeError,
                'ReferenceError': ReferenceError,
                'SyntaxError': SyntaxError,
                'TypeError': TypeError,
                'URIError': URIError
            }
            const type = errorTable[this.getProperty(error, 'name')] || Error
            realError = type(this.getProperty(error, 'message'))
        } else {
            realError = error.toString()
        }
        throw realError
    }
}

// add support for Repeat statement
Interpreter.prototype.stepRepeatStatement = function() {
    const state = this.stateStack[0]
    state.isLoop = true
    const node = state.node
    if (state.countHandled) {
        if (node.body) {
            if (state.infinite) {
                this.stateStack.unshift({node: node.body})
            } else {
                state.count--
                if (state.count >= 0) {
                    this.stateStack.unshift({node: node.body})
                } else {
                    this.stateStack.shift()
                }
            }
        }
    } else {
        if (node.count) {
            // count specified
            if (state.countReady) {
                state.infinite = false
                state.count = state.value
                state.countHandled = true
            } else {
                state.countReady = true
                this.stateStack.unshift({node: node.count})
            }
        } else {
            state.infinite = true
            state.countHandled = true
        }
    }
}

// add support for inner call
Interpreter.prototype.stepInnerCallExpression = function() {
    const state = this.stateStack.shift()
    let args = []
    let n = 0
    if (state.parameters) {
        args = state.parameters
        n = args.length
    }
    this.stateStack.unshift({node: {type:'CallExpression', arguments:args}, arguments:args, n_:n, doneCallee_: true, func_: state.node.func_, funcThis_: this.stateStack[this.stateStack.length - 1].thisExpression})
}


Interpreter.prototype.insertBlock = function(block, priority) {
    // Find index at which insertion has to be made
    let index = this.stateStack.length - 1
    while (index >= 0 && !this.stateStack[index].priority) {
        index--
    }
    index++

    // Append the new statements
    block.type = 'BlockStatement'
    this.stateStack.splice(index, 0, {node: block, priority, done:false})
}


// add ability to insert code
Interpreter.prototype.insertCode = function(code, priority, parameters, callbackStatement) {
    // Find index at which insertion has to be made
    let index = this.stateStack.length - 1
    while (index >= 0 && !this.stateStack[index].priority) {
        index--
    }
    index++

    // Append the new statements
    if (typeof callbackStatement !== 'undefined') {
        this.stateStack.splice(index, 0, {node: callbackStatement, priority, done:false})
    }
    for (let i = code.length - 1; i >= 0; i--) {
        const node = code[i]
        if (priority && node.type === 'InnerCallExpression' && typeof parameters !== 'undefined') {
            // Add parameter
            this.stateStack.splice(index, 0, {node, priority, done:false, parameters})
        } else  {
            this.stateStack.splice(index, 0, {node, priority, done:false})
        }
    }
}

// add ability to handle dynamic properties
Interpreter.prototype.getProperty = function(obj, name) {
    if (typeof (name))
    {name = name.toString()}
    if (obj == this.UNDEFINED || obj == this.NULL) {
        this.throwException(this.TYPE_ERROR, `Cannot read property '${name}' of ${obj}`)
    }
    // Special cases for magic length property.
    if (this.isa(obj, this.STRING)) {
        if (name == 'length') {
            return this.createPrimitive(obj.data.length)
        }
        const n = this.arrayIndex(name)
        if (!isNaN(n) && n < obj.data.length) {
            return this.createPrimitive(obj.data[n])
        }
    } else if (this.isa(obj, this.ARRAY) && name == 'length') {
        return this.createPrimitive(obj.length)
    }
    while (true) {
        if (obj.properties && name in obj.properties) {
            const prop = obj.properties[name]
            if (prop.dynamic ) {
                return prop.dynamic.apply(obj)
            }
            return prop
        }
        if (obj.parent && obj.parent.properties && obj.parent.properties.prototype) {
            obj = obj.parent.properties.prototype
        } else {
            // No parent, reached the top.
            break
        }
    }
    return this.UNDEFINED
}

// change break management not to remove root program node
Interpreter.prototype.stepBreakStatement = function() {
    let state = this.stateStack.shift()
    const node = state.node
    let label = null
    if (node.label) {
        label = node.label.name
    }
    state = this.stateStack.shift()
    while (state && state.node.type != 'CallExpression' && state.node.type != 'NewExpression' && state.node.type != 'Program') {
        if (label ? label == state.label : (state.isLoop || state.isSwitch)) {
            return
        }
        state = this.stateStack.shift()
    }
    if (state.node.type == 'Program'){
        // re-insert root node
        this.stateStack.push(state)
    } else {
        // Syntax error, do not allow this error to be trapped.
        throw SyntaxError('Illegal break statement')
    }
}

// handle interrupt statements
Interpreter.prototype.stepInterruptStatement = function() {
    let state = this.stateStack.shift()
    const node = state.node
    let label = null
    if (node.label) {
        label = node.label.name
    }
    // Find index at which search has to start
    let index = this.stateStack.length - 1
    while (index >= 0 && !this.stateStack[index].priority) {
        index--
    }
    index++

    state = this.stateStack.splice(index, 1)[0]
    while (state && state.node.type != 'Program') {
        if (label ? label == state.label : (state.isLoop || state.isSwitch)) {
            return
        }
        state = this.stateStack.splice(index, 1)[0]
    }
    if (state.node.type == 'Program'){
        // re-insert root node
        this.stateStack.push(state)
    } else {
        // Syntax error, do not allow this error to be trapped.
        throw SyntaxError('Illegal break statement')
    }
}

// handle interrupt statements
Interpreter.prototype.stepCallbackStatement = function() {
    const state = this.stateStack.shift()
    const node = state.node
    if (node.callback) {
        node.callback.apply(this)
    }
if (typeof state.value !== 'undefined' && state.value !== this.UNDEFINED && !this.stateStack[0].priority && this.stateStack[0].node.type === 'CallExpression') {
    this.stateStack[0].value = state.value
}
}

export default TInterpreter
