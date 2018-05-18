import $ from 'jquery'
import 'platform-pr'

const Task = function(aFrame) {
    
    const frame = aFrame
    const views = {task:{}}
    
    this.addViews = value => {
        $.extend(views, value)
    }
    
    this.showViews = ({task, solution}, callback) => {
        if (typeof task !== 'undefined' && task) {
            // show task view
            frame.displaySolution(false)
        } else if (typeof solution !== 'undefined' && solution) {
            // show solution
            frame.displaySolution(true)
        }
        callback()
    }
    
    this.getViews = callback => {
        const views = {
            task: {},
            solution: {}
/*                , hint: {requires: "task"},
            forum: {requires: "task"},
            editor: {requires: "task"}*/
        }
        callback(views)
    }
    
    this.updateToken = (token, callback) => {
        // do nothing
        callback()
    }


    this.getHeight = callback => {
        callback($('html').outerHeight(true))
    }

    this.getState = callback => {
        callback(frame.getAnswer())
    }
    
    this.reloadState = (state, callback) => {
        frame.setAnswer(state)
        callback()
    }
    
    this.getAnswer = callback => {
        const res = JSON.stringify(
            {score : frame.getScore(),
            value : frame.getLastSubmission()})
        callback(res)
    }
    
    this.reloadAnswer = (strAnswer, callback) => {
        if(strAnswer !== '') {
            try {
                const answer = JSON.parse(strAnswer)
                frame.setScore(answer.score)
                frame.setAnswer(answer.value)
            } catch(e) {
                window.console.log(e)
            }
        }
        else {
            frame.setScore(0)
            frame.setAnswer('')
        }
        callback()
    }

    this.load = (views, callback) => {
        frame.load(callback)
    }

    this.unload = callback => {
        callback()
    }
    
    this.getMetaData = callback => {
        const link = document.location.href
        const metaData = {
            id : link.substring(0, link.lastIndexOf('#')),
            language : 'fr',
            version : 1.0,
            title : 'title',
            authors : ['Colombbus - France-IOI'],
            license : 'license',
            minWidth : 'auto',
            fullFeedback : true,
            autoHeight : true
        }
        callback(metaData)
    }
}

export default Task
