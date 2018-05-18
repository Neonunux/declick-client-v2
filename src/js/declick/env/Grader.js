import 'platform-pr'

function Grader() {

    /*this.gradeTask = function (answer, answerToken, callback) {
        var acceptedAnswers = this.getAcceptedAnswers();
        var taskParams = platform.getTaskParams();
        var score = taskParams.noScore;
        if (acceptedAnswers && acceptedAnswers[0]) {
            if ($.inArray("" + answer, acceptedAnswers) > -1) {
                score = taskParams.maxScore;
            } else {
                score = taskParams.minScore;
            }
        }
        callback(score, "");
    }*/

    this.gradeTask = (strAnswer, token, callback) => {
        const answer = JSON.parse(strAnswer)
        platform.getTaskParams('maxScore', 100, maxScore => {
           const score = answer.score * maxScore
           callback(score, answer.message)
        })
    }           
    
}

export default Grader
