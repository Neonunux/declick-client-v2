import Platform from '@/objects/platform/Platform'
import Robot from '@/objects/robot/Robot'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'

class Girl extends Robot {
    constructor(model) {
    if (model === void 0) {
        model = 'girl'
    }
        super(model)
    }

    _say(message) {
    let text = null
    try
    {
        text = `${TUtils.getInteger(message)}`
    }
    catch (exception)
    {
        text = TUtils.getString(message)
    }
        this.gObject.say(text)
    }

    _ifSay(command) {
    command = TUtils.getCommand(command)
    this.gObject.sayCommands.addCommand(command)
    }

    _ask(question) {
    question = TUtils.getString(question)
    this.gObject.ask(question)
    }

    _ifAsk(command) {
    command = TUtils.getCommand(command)
    this.gObject.askCommands.addCommand(command)
    }

    _disableCollisions(value) {
    if (value === void 0) {
        value = true
    } else {
        value = TUtils.getBoolean(value)
    }
    this.gObject.disableCollisions(value)
    }
}

Girl.prototype.className = 'Girl'

function drawBubble(context, X, Y, width, height, radius, direction)
{
Y += radius
height -= radius
if (typeof direction === 'undefined')
{
	direction = 'left'
}
const right = X + width
const bottom = Y + height
context.beginPath()
context.moveTo(X + radius, Y)
context.lineTo(right - radius, Y)
context.quadraticCurveTo(right, Y, right, Y + radius)
context.lineTo(right, bottom - radius)
context.quadraticCurveTo(right, bottom, right - radius, bottom)
if (direction === 'left')
{
    context.quadraticCurveTo(right - radius, bottom + radius, right - radius - radius, bottom + radius)
    context.quadraticCurveTo(right - (radius * 1.5), bottom + radius, right - (radius * 1.5), bottom)
    context.lineTo(X + radius, bottom)
}
else if (direction === 'right')
{
    context.lineTo(X + (radius * 1.5), bottom)
    context.quadraticCurveTo(X + (radius * 1.5), bottom + radius, X + radius + radius, bottom + radius)
    context.quadraticCurveTo(X + radius, bottom + radius, X + radius, bottom)
}
context.quadraticCurveTo(X, bottom, X, bottom - radius)
context.lineTo(X, Y + radius)
context.quadraticCurveTo(X, Y, X + radius, Y)
context.fillStyle = 'white'
context.fill()
context.strokeStyle = 'black'
context.lineWidth = '2'
context.stroke()
}

Girl.prototype.gClass = Girl.prototype.graphics.addClass('TRobot', 'Girl',
{
init(props, defaultProps) {
        this._super(props, defaultProps)
    this.collisionsDisabled = false
    this.timeoutIdentifier = null
    this.message = null
    this.sayCommands = new CommandManager()
    this.askCommands = new CommandManager()
    },
draw(context) {
    if (this.message !== null)
    {
	context.font = '12px Lucida Console'
	const padding = 6
	const height = 15
	const width = context.measureText(this.message).width
	const X = -(width / 2)
	const Y = -height - (padding * 3)
	drawBubble(context, X - padding, Y - height - padding, width + (padding * 2), height + (padding * 2), padding, 'left')
	context.fillStyle = 'black'
	context.fillText(this.message, X, Y)
    }
    this._super(context)
},
say(message, triggerEvent) {
    if (typeof triggerEvent === 'undefined') {
        triggerEvent = true
    }
    this.message = message
    this.synchronousManager.begin()
    const context = this
    this.timeoutIdentifier = window.setTimeout(() => {
        context.timeoutIdentifier = null
        context.message = null
        if (triggerEvent) {
            context.sayCommands.executeCommands({'parameters': [message]}, true)
        }
        context.synchronousManager.end()
    }, (message.length * 50) + 1500)
},
ask(question) {
    this.say(question, false)
    Platform.ask(this.getTObject(), question)
},
destroy() {
    if (this.timeoutIdentifier !== null)
    {
	window.clearTimeout(this.timeoutIdentifier)
    }
    this._super()
},
disableCollisions(value) {
    this.collisionsDisabled = value
},
checkCollisions() {
    if (!this.collisionsDisabled) {
	this._super()
    }
}
})

export default Girl
