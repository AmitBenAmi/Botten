// require('dotenv-extended').load();

// const captionService = require('./caption-service'),
// captionService = require('./index'),
//     needle = require('needle'),
//     url = require('url'),
//     validUrl = require('valid-url');

// var restify = require('restify');

// session
// const hasImageAttachment = session => {
//     return session.message.attachments.length > 0 &&
//         session.message.attachments[0].contentType.indexOf('image') !== -1;
// };

// const hasImageAttachment = session => {
//     return session.message.attachments.length > 0 &&
//         session.message.attachments[0].contentType.indexOf('image') !== -1;
// };
// (session)

var test = require('unit.js');

describe('Attachments', function() {
  var MainClass = require('../index.js');
  it('load', function() {
    var myModule  = require('my-module');
    test
      .function(myModule)
        .hasName('MyModule')
      .object(myModule())
        .isInstanceOf(MainClass)
    ;
  });
  describe('Main class', function() {
    it('emit() - emit an event', function() {
      var spy  = test.spy();
      var main = new MainClass();
      var listener = function(value) {
        spy();
        // test the value emitted
        test.string(value)
          .isIdenticalTo('value of any event');
      };
      test
        .given('add listener', function() {
          main.on('any.event', listener);
        })
        .when('emit an event', function() {
          main.emit('any.event', 'value of any event');
        })
        .then(function() {
          test
            .function(main.listeners('any.event'))
            .bool(spy.calledOnce)
              .isTrue()
          ;
        })
    });
  });
});