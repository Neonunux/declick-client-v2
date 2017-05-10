define([], function() {

    const ipcRenderer = nodeRequire('electron').ipcRenderer;

    var TPlatformOffline = function() {
        
        var frame;
        var callbacks = [];
        var callbackCount = 0;

        ipcRenderer.on('declick', (event, message) => {
            switch (message.type) {
                case "callback":
                    callback(message.callback);
                    break;
                case "getAnswer":
                    var res = JSON.stringify(
                        {score : frame.getScore(),
                        value : frame.getLastSubmission()});
                    send({type:'callback', callback:message.callback, data:res});
                    break;
                case "reloadAnswer":
                    var answer = JSON.parse(message.data);
                    frame.setScore(answer.score);
                    frame.setAnswer(answer.value);
                    break;
            }
        })

        function callback(id) {
            if (typeof callbacks[id] !== 'undefined') {
                callbacks[id]();
                delete callbacks[id];
            }
         }

        function send(message) {
            ipcRenderer.sendToHost("declick", message);
        }

        this.setFrame = function(aFrame) {
            frame = aFrame;
        }

        this.validate = function(mode) {
            send({type:"validate", mode: mode});
        }

        this.showView = function(data, callback) {
            window.console.log("sending show view")
            callbacks[callbackCount]= callback;
            send({type:"showView", data: data, callback:callbackCount});
            callbackCount++;
        }

    }

    var instance = new TPlatformOffline();



    return instance;
});

