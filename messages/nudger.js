var timers = require('timers');

var timeInSeconds = 10;

class messageWatingForAnswer {
    constructor() {
    }

    setNewMessage(session, isQuestion) {
        if (!this.gotMessage || (this.gotMessage && isQuestion)) {
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

    cancelTimer() {
        if (this.timeout != undefined) {
            timers.clearTimeout(this.timeout);
        }
    }

    sendMessage(thisObject) {
        return function() {
            if (thisObject.session != undefined) {
                thisObject.session.send("נשאלה שאלה, עברו 10 שניות, מה עם תשובה?!");
                thisObject.session = undefined;
                thisObject.gotMessage = false;
            }
        }
    }

}

module.exports = messageWatingForAnswer;