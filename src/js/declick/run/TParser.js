import acorn from 'acorn'

/**
 * TParser parses the code into statements, using the parser acorn.
 * @exports TParser
 */
function TParser() {
    const options = {locations: true, forbidReserved: 'everywhere'}
    
    this.setRepeatKeyword = name => {
        acorn.setRepeatKeyword(name)
    }        

    /**
     * Parse code to statements.
     * @param {String} code
     * @returns {String[]}
     */
    this.parse = (input, programName) => {
        if (programName) {
            options['sourceFile'] = programName
        } else {
            options['sourceFile'] = null
        }
        
        const result = acorn.parse(input, options)
        // return statements
        return result
    }
}

const parserInstance = new TParser()

export default parserInstance
