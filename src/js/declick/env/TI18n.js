import $ from 'jquery'

import TResource from '@/data/TResource'
import TEnvironment from '@/env/TEnvironment'

class TI18n {
    constructor() {
        const processedFiles = {}
        const hiddenMethods = {}
        const waiting = {}
        const translatedClasses = []
        let self
        /**
         * If the function is called for the first time for "aClass", load
         * tranlation file.
         * Translate each method which isn't into "hideMethods".
         * @param {String} aClass
         * @param {String} file
         * @param {String} language
         * @param {String[]} hideMethods
         * @param {Function} callback
         */
        const addTranslatedMethods = (file, language, hideMethods, callback) => {
            const translatedMethods = {}
            if (typeof processedFiles[file] !== 'undefined') {
                hideMethods = hideMethods.concat(hiddenMethods[file])
                // translation already loaded: we use it
                $.each(processedFiles[file], (name, value) => {
                    if (!hideMethods.includes(name)) {
                        translatedMethods[name] = value
                    }
                })
                if (typeof (callback !== 'undefined')) {
                    callback.call(null, translatedMethods, hideMethods)
                }
            }
            else {
                // load translation file
                TResource.get(file, [language, 'hide'], data => {
                    processedFiles[file] = {}
                    if (typeof data.hide !== 'undefined') {
                        // there are methods to hide
                        hiddenMethods[file] = data.hide
                        hideMethods = hideMethods.concat(data.hide)
                    }
                    else {
                        hiddenMethods[file] = []
                    }
                    if (typeof data[language] !== 'undefined') {
                        $.each(data[language]['methods'], (key, { name, translated, displayed }) => {
                            if (!hideMethods.includes(name)) {
                                const value = { translated: translated, displayed: displayed }
                                processedFiles[file][name] = value
                                translatedMethods[name] = value
                            }
                        })
                    }
                    else {
                        TEnvironment.error(`Error loading translated methods (${file}): `)
                    }
                    if (typeof callback !== 'undefined') {
                        callback.call(self, translatedMethods, hideMethods)
                    }
                })
            }
        }
        /**
         * If the function is called for the first time for "aClass", load
         * message file.
         * Translate each messages.
         * @param {String} aClass
         * @param {String} file
         * @param {String} language
         * @param {Function} callback
         */
        const addTranslatedMessages = (aClass, file, language, callback) => {
            if (typeof aClass.messages === 'undefined') {
                aClass.messages = {}
            }
            if (typeof processedFiles[file] !== 'undefined') {
                // file has already been processed
                $.each(processedFiles[file], (name, value) => {
                    if (typeof aClass.messages[name] === 'undefined') {
                        // only set message if not already set
                        aClass.messages[name] = value
                    }
                })
                if (typeof (callback !== 'undefined')) {
                    callback.call(self)
                }
            }
            else {
                // load message file
                TResource.get(file, [language], data => {
                    processedFiles[file] = {}
                    if (typeof data[language] !== 'undefined') {
                        $.each(data[language], (name, value) => {
                            if (typeof aClass.messages[name] === 'undefined') {
                                // only set message if not already set
                                aClass.messages[name] = value
                                processedFiles[file][name] = value
                            }
                        })
                        TEnvironment.log(`found messages in language: ${language}`)
                    }
                    else {
                        TEnvironment.log(`found no messages for language: ${language}`)
                    }
                    if (typeof callback !== 'undefined') {
                        callback.call(self)
                    }
                })
            }
        }
        /**
         * Tranlates Methods, then Messages of "aClass", and recall himself
         * with ParentPrototype.
         * @param {String} aClass
         * @param {String} prototype
         * @param {Boolean} parents
         * @param {String} language
         * @param {String[]} translated
         * @param {String[]} hidden
         * @param {Function} callback
         */
        const i18nClass = (aClass, prototype, parents, language, translated, hidden, callback) => {
            const translationFile = prototype.getResource('i18n.json')
            const messageFile = prototype.getResource('messages.json')
            // 1st load translated methods
            addTranslatedMethods(translationFile, language, hidden, (newTranslated, hidden) => {
                $.extend(translated, newTranslated)
                addTranslatedMessages(aClass, messageFile, language, () => {
                    if (parents) {
                        const parentPrototype = Object.getPrototypeOf(prototype)
                        if (parentPrototype !== Object.prototype) {
                            // Check if parent has been translated
                            const parentClassName = parentPrototype.className
                            if (translatedClasses.includes(parentClassName)) {
                                i18nClass(aClass, parentPrototype, parents, language, translated, hidden, callback)
                            }
                            else {
                                // not translated yet: wait for translation
                                if (typeof waiting[parentClassName] === 'undefined') {
                                    waiting[parentClassName] = []
                                }
                                waiting[parentClassName].push(() => {
                                    i18nClass(aClass, parentPrototype, parents, language, translated, hidden, callback)
                                })
                            }
                        }
                        else {
                            if (typeof callback !== 'undefined') {
                                callback.call(self, translated)
                            }
                        }
                    }
                    else if (typeof callback !== 'undefined') {
                        callback.call(self, translated)
                    }
                })
            })
        }
        /**
         * Internationalize both Methods and Message of "initialClass".
         * @param {String} initialClass
         * @param {Boolean} parents
         * @param {String} language
         * @param {Function} callback
         */
        this.internationalize = function (initialClass, parents, language, callback) {
            self = this
            i18nClass(initialClass, initialClass.prototype, parents, language, {}, [], function (translated) {
                // declare translated methods in object prototype
                const translatedMethods = {}
                const translatedMethodsDisplay = {}
                for (const name in translated) {
                    const value = translated[name]
                    translatedMethods[name] = value.translated
                    translatedMethodsDisplay[value.translated] = value.displayed
                }
                initialClass.prototype.translatedMethods = translatedMethods
                initialClass.prototype.translatedMethodsDisplay = translatedMethodsDisplay
                const className = initialClass.prototype.className
                translatedClasses.push(className)
                if (typeof waiting[className] !== 'undefined') {
                    for (let i = 0; i < waiting[className].length; i++) {
                        const f = waiting[className][i]
                        f.call(this)
                    }
                    delete waiting[className]
                }
                if (typeof callback !== 'undefined') {
                    callback.call(self)
                }
            })
        }
    }
}

const TI18nInstance = new TI18n()

export default TI18nInstance
