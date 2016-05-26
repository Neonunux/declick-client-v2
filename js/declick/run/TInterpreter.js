define(['TError', 'TUtils', 'acorn', 'js-interpreter'], function(TError, TUtils, acorn, Interpreter) {
    function TInterpreter() {
        var runtimeFrame, log, errorHandler;
        var classes = {};
        var instances = {};
        
        var interpreter;
        var running = false;
        
        this.initialize = function() {
            var initFunc = function(interpreter, scope) {

                // #1 Declare translated Instances
                var getInstanceMethodWrapper = function(className, methodName) {
                    return function() {
                        // transform data from interpreter into actual data
                        var args = [];
                        for (var i=0; i<arguments.length;i++) {
                            args.push(arguments[i].data);
                        }
                        instances[className][methodName].apply(this.data, args);
                    };
                };
                
                var getInstance = function(name) {
                    var object = interpreter.createObject(interpreter.FUNCTION);
                    object.data = instances[name];
                    var constructor = instances[name].constructor;
                    if (typeof constructor.prototype !== 'undefined' && typeof constructor.prototype.translatedMethods !== 'undefined') {
                        var translated = constructor.prototype.translatedMethods;
                        for (var methodName in translated) {
                            interpreter.setProperty(object, translated[methodName], interpreter.createNativeFunction(getInstanceMethodWrapper(name, methodName)));
                        }
                    }
                    return object;
                };
                for (var name in instances) {
                    var object = getInstance(name);
                    interpreter.setProperty(scope, name, object, true);
                }
                
                // #2 Declare translated Classes
                // generate wrapper for translated methods
                var getClassMethodWrapper = function(className, methodName) {
                    return function() {
                        // transform data from interpreter into actual data
                        var args = [];
                        for (var i=0; i<arguments.length;i++) {
                            args.push(arguments[i].data);
                        }
                        classes[className].prototype[methodName].apply(this.data, args);
                    };
                };
                
                var getObject = function(name) {
                    var parent = interpreter.createObject(interpreter.FUNCTION);
                    if (typeof classes[name].prototype !== 'undefined' && typeof classes[name].prototype.translatedMethods !== 'undefined') {
                        var translated = classes[name].prototype.translatedMethods;
                        for (var methodName in translated) {
                            interpreter.setProperty(parent.properties.prototype, translated[methodName], interpreter.createNativeFunction(getClassMethodWrapper(name, methodName)));
                        }
                    }
                    var wrapper = function() {
                        var obj = interpreter.createObject(parent);
                        var declickObj = Object.create(classes[name].prototype);
                        // transform data from interpreter into actual data
                        var args = [];
                        for (var i=0; i<arguments.length;i++) {
                            args.push(arguments[i].data);
                        }
                        classes[name].apply(declickObj, args);
                        obj.data = declickObj;
                        return obj;
                    };
                    var obj = interpreter.createNativeFunction(wrapper);
                    return obj;
                };
                for (var name in classes) {
                    var object = getObject(name);
                    interpreter.setProperty(scope, name, object, true);
                }
            };
            interpreter =  new Interpreter("", initFunc);
        };
        
        this.setRuntimeFrame = function(frame) {
            runtimeFrame = frame;
        };

        this.setLog = function(element) {
            log = element;
        };

        this.setErrorHandler = function(handler) {
            errorHandler = handler;
        };
        
        /* Lifecycle management */

        var clear = function() {
            stop();
        };

        this.clear = function() {
            clear();
        };

        this.suspend = function() {
            interpreter.paused_ = true;
        };

        this.resume = function() {
            if (interpreter.paused_) {
                interpreter.paused_ = false;
                run();
            }
        };

        this.stop = function() {
            stop();
        };

        var logCommand = function(command) {
            if (typeof log !== 'undefined') {
                log.addCommand(command);
            }
        };

        var stop = function(scope) {
            running = false;
            var emptyAST = acorn.parse("");
            if (!scope) {
                scope = interpreter.createScope(emptyAST, null);
            }
            interpreter.stateStack = [{
              node: emptyAST,
              scope: scope,
              thisExpression: scope,
              done: false
            }];            
            interpreter.paused_ = false;
        };
        
        var nextStep = function() {
            try {
                if (interpreter.step()) {
                    if (!interpreter.paused_) {
                        window.setTimeout(nextStep, 0);
                    }
                } else {
                    running = false;
                }
                //logCommand(interpreter.stateStack);
            } catch (err) {
                if (!(err instanceof TError)) {
                    var error = new TError(err);
                    if (interpreter.stateStack.length>0) {
                        var state = interpreter.stateStack[0];
                        error.setLines([state.node.loc.start.line, state.node.loc.end.line]);
                    }
                    error.detectError();
                } else {
                    error = err;
                }
                if (interpreter.stateStack.length>0) {
                    var state = interpreter.stateStack[0];
                    if (!state.node.loc.source) {
                        // no program associated: remove lines if any
                        error.setLines([]);
                    } else {
                        error.setProgramName(state.node.loc.source);
                    }
                }
                var baseState = interpreter.stateStack.pop();
                stop(baseState.scope);

                if (typeof errorHandler !== 'undefined') {
                    errorHandler(error);
                } else {
                    throw error;
                }
            }
        };
        
        var run = function() {
            running = true;
            nextStep();
        };

        this.start = function() {
            if (!running) {
                run();
            }
        };

        this.addStatement = function(statement) {
            interpreter.appendCode(statement);
            if (!running) {
                this.start();
            }
        };

        this.addStatements = function(statements) {
            interpreter.appendCode(statements);
            if (!running) {
                this.start();
            }
        };

        this.addPriorityStatements = function(statements, parameter, log) {
            this.addStatements(statements);
            if (!running) {
                this.start();
            }
        };

        this.addClass = function(func, name) {
            classes[name] = func;
        };

        this.addInstance = function(func, name) {
            instances[name] = func;
        };
        
    }


    // Modify Interpreter to handle function declaration
    Interpreter.prototype['stepFunctionDeclaration'] = function() {
        var state = this.stateStack.shift();
        this.setValue(this.createPrimitive(state.node.id.name), this.createFunction(state.node));
    };

    // Modify Interpreter to throw exception when trying to redefining fixed property
    Interpreter.prototype.setValueToScope = function(name, value) {
        var scope = this.getScope();
        var strict = scope.strict;
        var nameStr = name.toString();
        while (scope) {
          if ((nameStr in scope.properties) || (!strict && !scope.parentScope)) {
            if (!scope.fixed[nameStr]) {
              scope.properties[nameStr] = value;
            } else {
                this.throwException(this.REFERENCE_ERROR, nameStr + ' is alderady defined');                    
            }
            return;
          }
          scope = scope.parentScope;
        }
        this.throwException(this.REFERENCE_ERROR, nameStr + ' is not defined');
    };

    // Modify Interpreter to not delete statements when looking for a try
    Interpreter.prototype.throwException = function(errorClass, opt_message) {
      if (this.stateStack[0].interpreter) {
        // This is the wrong interpreter, we are spinning on an eval.
        try {
          this.stateStack[0].interpreter.throwException(errorClass, opt_message);
          return;
        } catch (e) {
          // The eval threw an error and did not catch it.
          // Continue to see if this level can catch it.
        }
      }
      if (opt_message === undefined) {
        var error = errorClass;
      } else {
        var error = this.createObject(errorClass);
        this.setProperty(error, 'message',
            this.createPrimitive(opt_message), false, true);
      }
      // Search for a try statement.
      var i = 0;
      var state;
      var length = this.stateStack.length;
      do {
        state = this.stateStack[i];
        i++;
      } while (i<length && state.node.type !== 'TryStatement');
      if (state.node.type === 'TryStatement') {
            for (var j=0; j<i; j++) {
                this.stateStack.shift();
            }
            // Error is being trapped.
            this.stateStack.unshift({
              node: state.node.handler,
              throwValue: error
            });
      } else {
        // Throw a real error.
        var realError;
        if (this.isa(error, this.ERROR)) {
          var errorTable = {
            'EvalError': EvalError,
            'RangeError': RangeError,
            'ReferenceError': ReferenceError,
            'SyntaxError': SyntaxError,
            'TypeError': TypeError,
            'URIError': URIError
          };
          var type = errorTable[this.getProperty(error, 'name')] || Error;
          realError = type(this.getProperty(error, 'message'));
        } else {
          realError = error.toString();
        }
        throw realError;
      }
    };

    return TInterpreter;
});


