var timers = require('timers');

var timeInSeconds = 10;

class messageWatingForAnswer {
    constructor() {
    }

    setNewMessage(session) {
        if (!this.gotMessage) {
            this.gotMessage = true;
            this.session = session;
            this.timeout = timers.setTimeout(this.sendMessage(this),timeInSeconds*1000);
        }
        else {
            timers.clearTimeout(this.timeout);
            this.session = undefined;
            this.gotMessage = false;
        }
    }

    sendMessage(thisObject) {
        return function() {
            if (thisObject.session != undefined) {
                thisObject.session.send("נשאלה שאלה, מה עם תשובה?!");
                thisObject.session = undefined;
                thisObject.gotMessage = false;
            }
        }
    }

}

module.exports = messageWatingForAnswer;