var expect = require('chai').expect;
var messageAttacher = require('../messages/Attachments.js');

describe("Checking Attachments", function () {
    describe("No attached image", function () {
        it("Checks weather a message has no image attached to it", function () {
            var session = {
                message: {
                    attachments: []
                }
            };
            expect(messageAttacher.hasImageAttachment(session)).to.equal(false);
        });
    });

    describe("Attached image", function () {
        it("Checks weather a message has image attached to it", function () {
            var session = {
                message: {
                    attachments: [{
                        contentType: 'image'
                    }]
                }
            };
            expect(messageAttacher.hasImageAttachment(session)).to.equal(true);
        });

        it("Checks weather a message has multiple images attached to it", function () {
            var session = {
                message: {
                    attachments: [{
                        contentType: 'image'
                    }, {
                        contentType: 'image'
                    }]
                }
            };
            expect(messageAttacher.hasImageAttachment(session)).to.equal(true);
        });
    }); 

    describe("Fail Test", function() {
        it("Showing some failing test for preiew", function () {
            expect(1).to.equal(2);
        });
    });
});