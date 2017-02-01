var timers = require('timers');

var timeInSeconds = 2;

class messageWatingForAnswer {
    constructor(session) {
        this.session = session
        this.setNewMessage(session)
    }

    setNewMessage(session) {
        if (!this.gotMessage) {
            this.gotMessage = true;
            this.session = session;
            this.timeout = timers.setTimeout(this.sendMessage,timeInSeconds * 1000);
        }
        else {
            timers.clearTimeout(this.timeout);
            this.session = undefined;
            this.gotMessage = false;
        }
    }

    sendMessage() {
        if (this.session != undefined) {
            this.session.send("נשאלה שאלה, מה עם תשובה?!", session.message.text);
             this.session = undefined;
             this.gotMessage = false;
        }
    }

}

module.exports = messageWatingForAnswer;