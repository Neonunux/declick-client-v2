import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import CommandManager from '@/utils/CommandManager'
import TUtils from '@/utils/TUtils'

/**
 * Defines Information, inherited from TObject.
 * It can display an alert window with a predefined text.
 * @param {String} label    Text displayed on the information
 * @exports Information
 */
class Information extends TObject {
 constructor(label) {
     super()
     this.label = label
     this.commands = new CommandManager()
 }

 /**
  * Set a label for Information.
  * @param {String} label    Label to be displayed
  */
 _setText(label) {
     label = TUtils.getString(label)
     this.label = label
 }

 /**
  * Associates a command to Information.
  * @param {String} command
  */
 _addCommand(command) {
     command = TUtils.getCommand(command)
     this.commands.addCommand(command)
     
 }

 /**
  * Removes all commands associated to information.
  */
 _removeCommands() {
     this.commands.removeCommands()
 }

 /**
  * Shows the alert window.
  */
 _show() {
     window.alert(this.label)
     this.commands.executeCommands()
 }
}

Information.prototype.className = 'Information'

export default Information
