import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TUtils from '@/utils/TUtils'

class TArray extends TObject {
    constructor(name) {
        super(name)
        if (name instanceof TArray) {
        };
        this.element = new Array()
    }

    _addValue(value) {
        this.element.push(value)
    }

    _setValueAt(position, value) {
        const checkPosition = TUtils.checkInteger(position)
        const checkValue = TUtils.checkInteger(value)
        
        if (checkPosition && checkValue)
            this.element[position - 1] = value
    }

    _getValue(position) {
        return this.element[position - 1]
    }

    _getLength() {
        return this.element.length
    }
}

TArray.prototype.className = 'TArray'


export default TArray
