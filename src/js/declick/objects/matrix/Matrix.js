import TObject from '@/objects/tobject/TObject'

// TODO Add documentation.
// TODO Improve performances ?
//	    Seems complicated while keeping OOP cohesion.
// TODO Add 'propager' method.
// TODO Add pivot position choice support for the 'rotate' method ?
// TODO Add boundaries check.

class Matrix extends TObject {
    constructor(data, width, height) {
        this.data = data || []
        let dimensions
        if (this.data && (width === undefined || height === undefined))
            {dimensions = Matrix.measure(this.data)}
        this.width = (width !== undefined) ? width : dimensions.width
        this.height = (height !== undefined) ? height : dimensions.height
    }

    //	Matrix.prototype._count = function () {
    //		var result = 0;
    //		for (var YIndex = 0; YIndex < this.height; YIndex++)
    //			for (var Index = 0; XIndex < this.width; XIndex++)
    //				if (this._get(XIndex, YIndex) !== undefined)
    //					result += 1;
    //		return result;
    //	};

    _scan(direction, task) {
        if (direction == Matrix.Direction.TOP) {
            for (let XIndex = 0; XIndex < this.width; XIndex++)
                {for (let YIndex = this.height - 1; YIndex >= 0; YIndex--) {
                    this._edit(XIndex, YIndex, task)
                }}
        }
    }

    // TODO Remove recursion.
    // TODO Shorten.
    // TODO Kill it with fire.
    _propagate(XPosition, YPosition, callback, Mask) {
        if (Mask === undefined) {
            filtrer = new Matrix([])
            filtrer.width = this.width
            filtrer.height = this.height
            Mask = new Matrix.Mask(this, filtrer)
        }

        const value = this._get(XPosition, YPosition)
        if (XPosition >= 0 && XPosition < this.width
                && YPosition >= 0 && YPosition < this.height) {
            Mask.filtrer._set(XPosition, YPosition, true)
        }

        if ((XPosition - 1) >= 0 && (XPosition - 1) < this.width
                && YPosition >= 0 && YPosition < this.height)
            {if (!Mask.filtrer._get(XPosition - 1, YPosition)) {
                var result = callback(value, this._get(XPosition - 1, YPosition))
                Mask.filtrer._set(XPosition - 1, YPosition, result)
                if (result === true) {
                    this._propagate(XPosition - 1, YPosition, callback, Mask)
                }
            }}

        if ((XPosition + 1) >= 0 && (XPosition + 1) < this.width
                && YPosition >= 0 && YPosition < this.height)
            {if (!Mask.filtrer._get(XPosition + 1, YPosition)) {
                var result = callback(value, this._get(XPosition + 1, YPosition))
                Mask.filtrer._set(XPosition + 1, YPosition, result)
                if (result === true)
                    {this._propagate(XPosition + 1, YPosition, callback, Mask)}
            }}


        if (XPosition >= 0 && XPosition < this.width
                && (YPosition - 1) >= 0 && (YPosition - 1) < this.height)
            {if (!Mask.filtrer._get(XPosition, YPosition - 1)) {
                var result = callback(value, this._get(XPosition, YPosition - 1))
                Mask.filtrer._set(XPosition, YPosition - 1, result)
                if (result === true)
                    {this._propagate(XPosition, YPosition - 1, callback, Mask)}
            }}

        if (XPosition >= 0 && XPosition < this.width
                && (YPosition + 1) >= 0 && (YPosition + 1) < this.height)
            {if (!Mask.filtrer._get(XPosition, YPosition + 1)) {
                var result = callback(value, this._get(XPosition, YPosition + 1))
                Mask.filtrer._set(XPosition, YPosition + 1, result)
                if (result === true)
                    {this._propagate(XPosition, YPosition + 1, callback, Mask)}
            }}

        return Mask
    }

    _count() {
        let compteur = 0
        for (let YIndex = 0; YIndex < this.height; YIndex++)
            {for (const Index = 0; XIndex < this.width; XIndex++)
                {if (this._get(XIndex, YIndex) !== undefined)
                    {compteur++}}}
        return compteur
    }

    _reset() {
        this.data = []
        return this
    }

    _get(XPosition, YPosition) {
        if (!this.data[YPosition])
            {return undefined}
        return this.data[YPosition][XPosition]
    }

    _set(XPosition, YPosition, value) {
        if (!this.data[YPosition])
            {this.data[YPosition] = []}
        this.data[YPosition][XPosition] = value
        return this
    }

    _edit(XPosition, YPosition, task) {
        this._set(XPosition, YPosition, task(this._get(XPosition, YPosition),
                XPosition, YPosition))
        return this
    }

    _select(XOffset, YOffset, width, height) {
        return new Matrix.Selection(this, XOffset, YOffset, width, height)
    }

    _filter(filter) {
        return new Matrix.Mask(this, new Matrix(filter))
    }

    _copy() {
        const copy = []
        for (let YIndex = 0; YIndex < this.height; YIndex++)
            {for (let XIndex = 0; XIndex < this.width; XIndex++) {
                const value = this._get(XIndex, YIndex)
                if (value !== undefined) {
                    if (copy[YIndex] === undefined)
                        {copy[YIndex] = []}
                    copy[YIndex][XIndex] = value
                }
            }}
        return new Matrix(copy, this.width, this.height)
    }

    _transform(task) {
        for (let YIndex = 0; YIndex < this.height; YIndex++)
            {for (let XIndex = 0; XIndex < this.width; XIndex++)
                {this._edit(XIndex, YIndex, task)}}
        return this
    }

    _apply(task) {
        const callback = (element, x, y) => {
            if (element !== undefined)
                {return task(element, x, y)}
            return element
        }
        for (let YIndex = 0; YIndex < this.height; YIndex++)
            {for (let XIndex = 0; XIndex < this.width; XIndex++)
                {this._edit(XIndex, YIndex, callback)}}
        return this
    }

    _replace(Matrix) {
        const XLimit = Math.min(this.width, Matrix.width)
        const YLimit = Math.min(this.height, Matrix.height)
        for (YIndex = 0; YIndex < YLimit; YIndex++)
            {for (XIndex = 0; XIndex < XLimit; XIndex++)
                {this._set(XIndex, YIndex, Matrix._get(XIndex, YIndex))}}
        return this
    }

    _insert(Matrix) {
        const XLimit = Math.min(this.width, Matrix.width)
        const YLimit = Math.min(this.height, Matrix.height)
        for (YIndex = 0; YIndex < YLimit; YIndex++)
            {for (XIndex = 0; XIndex < XLimit; XIndex++)
                {if (this._get(XIndex, YIndex) === undefined) {
                    const value = Matrix._get(XIndex, YIndex)
                    if (value !== undefined)
                        {this._set(XIndex, YIndex, value)}
                }}}
        return this
    }

    _extract() {
        const value = this._copy()
        this._reset()
        return value
    }

    _shift(direction, intensity) {
        if (intensity === undefined)
            {intensity = 1}
        if (intensity < 0) {
            intensity = -intensity
            if (direction === Matrix.Direction.TOP)
                {direction = Matrix.Direction.BOTTOM}
            else if (direction === Matrix.Direction.BOTTOM)
                {direction = Matrix.Direction.TOP}
            else if (direction === Matrix.Direction.LEFT)
                {direction = Matrix.Direction.RIGHT}
            else if (direction === Matrix.Direction.RIGHT)
                {direction = Matrix.Direction.LEFT}
        }
        switch (direction) {
            case Matrix.Direction.TOP:
                this._replace(this._select(0, intensity)._copy())
                this._select(0, this.height - intensity)._reset()
                break
            case Matrix.Direction.BOTTOM:
                this._select(0, intensity)._replace(this._copy())
                this._select(0, 0, this.width, intensity)._reset()
                break
            case Matrix.Direction.LEFT:
                this._replace(this._select(intensity, 0)._copy())
                this._select(this.width - intensity, 0)._reset()
                break
            case Matrix.Direction.RIGHT:
                this._select(intensity, 0)._replace(this._copy())
                this._select(0, 0, intensity, this.height)._reset()
                break
        }
        return this
    }

    _rotate(direction) {
        const copy = this._copy()
        this._reset()
        for (XIndexA = 0; XIndexA < this.width; XIndexA++) {
            const XIndexB = (direction === Matrix.Direction.CLOCKWISE) ?
                    XIndexA : this.width - 1 - XIndexA
            for (YIndexA = 0; YIndexA < this.height; YIndexA++) {
                const YIndexB = (direction === Matrix.Direction.ANTICLOCKWISE) ?
                        YIndexA : this.height - 1 - YIndexA
                this._set(YIndexB, XIndexB, copy._get(XIndexA, YIndexA))
            }
        }
        this.width = copy.height
        this.height = copy.width
        return this
    }

    _reverse() {
        const copy = this._copy()
        for (YIndex = 0; YIndex < this.height; YIndex++)
            {for (XIndex = 0; XIndex < this.width; XIndex++)
                {this._set(this.width - 1 - XIndex, this.height - 1 - YIndex,
                        copy._get(XIndex, YIndex))}}
        return this
    }

    _print() {
        for (let YIndex = 0; YIndex < this.height; YIndex++) {
            let line = ''
            for (let XIndex = 0; XIndex < this.width; XIndex++) {
                const value = this._get(XIndex, YIndex)
                if (value === undefined)
                    {line += 'undef\t'}
                else
                    {line += `${value}\t`}
            }
            console.log(line)
        }
    }

    _cover(Matrix) {
        if (Matrix instanceof Matrix.Selection)
            {return this.width >= (Matrix.width + Matrix.XOffset)
                    && this.height >= (Matrix.height + Matrix.YOffset)}
        return this.width >= Matrix.width && this.height >= Matrix.height
    }

    static Selection(Matrix, XOffset, YOffset, width, height) {
        this.Matrix = Matrix
        this.XOffset = XOffset
        this.YOffset = YOffset
        this.width = (width !== undefined) ? width : Matrix.width - XOffset
        this.height = (height !== undefined) ? height :
                Matrix.height - YOffset
    }

    static Mask(Matrix, filter) {
        this.Matrix = Matrix
        this._filter = filter
        this.width = filter.width
        this.height = filter.height
    }
}

Matrix.measure = data => {
    const dimensions = {}
    for (let YIndex = 0; YIndex < data.length; YIndex++)
        {if (data[YIndex] && (dimensions.width === undefined ||
                data[YIndex].length > dimensions.width))
            {dimensions.width = data[YIndex].length}}
    if (dimensions.width === undefined)
        {dimensions.width = 0}
    dimensions.height = data.length
    return dimensions
}

Matrix.conflit = (MatrixA, MatrixB) => {
    const XLimit = Math.min(MatrixA.width, MatrixB.width)
    const YLimit = Math.min(MatrixA.height, MatrixB.height)
    for (let YIndex = 0; YIndex < YLimit; YIndex++)
        {for (let XIndex = 0; XIndex < XLimit; XIndex++)
            {if (MatrixA._get(XIndex, YIndex) !== undefined &&
                    MatrixB._get(XIndex, YIndex) !== undefined)
                {return true}}}
    return false
}

Matrix.Selection.prototype = Object.create(Matrix.prototype)
Matrix.Selection.prototype.constructor = Matrix.Selection

Matrix.Selection.prototype._reset = function () {
    for (let YIndex = 0; YIndex < this.height; YIndex++)
        {for (let XIndex = 0; XIndex < this.width; XIndex++)
            {this.Matrix._set(this.XOffset + XIndex, this.YOffset + YIndex,
                    undefined)}}
    return this
}

Matrix.Selection.prototype._get = function (XPosition, YPosition) {
    return this.Matrix._get(this.XOffset + XPosition,
            this.YOffset + YPosition)
}

Matrix.Selection.prototype._set = function (XPosition, YPosition, value) {
    this.Matrix._set(this.XOffset + XPosition, this.YOffset + YPosition,
            value)
    return this
}

Matrix.Selection.prototype._edit = function (XPosition, YPosition, task) {
    this._set(XPosition, YPosition, task(this._get(XPosition, YPosition),
            XPosition + this.XOffset, YPosition + this.YOffset))
    return this
}

Matrix.Mask.prototype = Object.create(Matrix.prototype)
Matrix.Mask.prototype.constructor = Matrix.Mask

// TODO Remove loop behaviours.
Matrix.Mask.prototype._reset = function () {
    for (let YIndex = 0; YIndex < this.height; YIndex++)
        {for (let XIndex = 0; XIndex < this.width; XIndex++)
            {if (this._filter._get(XIndex, YIndex))
                {this.Matrix._set(XIndex, YIndex, undefined)}}}
    return this
}

Matrix.Mask.prototype._get = function (XPosition, YPosition) {
    if (this._filter._get(XPosition, YPosition))
        {return this.Matrix._get(XPosition, YPosition)}
    return undefined
}

Matrix.Mask.prototype._set = function (XPosition, YPosition, value) {
    if (this._filter._get(XPosition, YPosition))
        {this.Matrix._set(XPosition, YPosition, value)}
    return this
}

Matrix.Direction = {
    TOP: 0,
    BOTTOM: 1,
    LEFT: 2,
    RIGHT: 3,
    CLOCKWISE: 4,
    ANTICLOCKWISE: 5
}

export default Matrix
