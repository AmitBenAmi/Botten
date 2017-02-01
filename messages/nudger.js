var timers = require('timers');

var timeInSeconds = 2;

class messageWatingForAnswer {
    constructor() {
    }

    setNewMessage(session) {
        if (!this.gotMessage) {
            this.gotMessage = true;
            this.session = session;
            this.session.send("from nudger");
            this.timeout = timers.setTimeout(this.sendMessage,timeInSeconds);
        }
        else {
            timers.clearTimeout(this.timeout);
            this.session = undefined;
            this.gotMessage = false;
        }
    }

    sendMessage(session) {
        if (this.session != undefined) {
            this.session.send("נשאלה שאלה, מה עם תשובה?!");
             this.session = undefined;
             this.gotMessage = false;
        }
    }

}

module.exports = messageWatingForAnswer;