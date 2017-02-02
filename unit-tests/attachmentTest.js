var expect = require('chai').expect;
var messageAttacher = require('../messages/index.js');

describe("Checking Attachments", function () {
    describe("No attached image", function () {
        it("Checks weather a message has no image attached to it", function () {
            var session = {
                message: {
                    attachments: []
                }
            };
            expect(messageAttacher.hasImageAttachment(session).to.equal(false));
        });
    });

    describe("Attached image", function () {
        it("Checks weather a message has image attached to it", function () {
            var session = {
                message: {
                    attachments: [{}]
                }
            };
            expect(messageAttacher.hasImageAttachment(session).to.equal(true));
        });
    });
});