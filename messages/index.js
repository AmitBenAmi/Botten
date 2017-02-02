/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

require('dotenv-extended').load();

// rotem
const captionService = require('./caption-service'),
    needle = require('needle'),
    url = require('url'),
    validUrl = require('valid-url');

var restify = require('restify');
//

var connector = useEmulator ? new builder.ChatConnector({
    appId: null,
    appPassword: null
}) : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';


const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

var emojis = require('node-emoji');
var nudger = require('./nudger');
var trakttv = require('../SeriesAPI/Trakt.tv');
var messageNudger = new nudger();
var Forecast = require('forecast');
var fs = require('fs');
var util = require('util');
var path = require('path');

function getRealImageLocation(imageName) {
    return (path.resolve(__dirname + '/../Images', imageName));
};

function sendInline(session, filePath, contentType, attachmentFileName) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return session.send('Oops. Error reading file. Error: ' + err.message, session.message.text);
        }

        var base64 = Buffer.from(data).toString('base64');

        var msg = new builder.Message(session)
            .addAttachment({
                contentUrl: util.format('data:%s;base64,%s', contentType, base64),
                contentType: contentType,
                name: attachmentFileName
            });

        session.send(msg, session.message.text);
    });
};

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .matches('None', (session, args) => {
        session.send(emojis.get('question'), session.message.text);
        if (session.message.text.includes("?")) {
            messageNudger.setNewMessage(session, true);
        } else {
            messageNudger.cancelTimer(session);
        }
    })
    .matches('Limay', (session, args) => {
        sendInline(session, getRealImageLocation('Limay.jpg'), 'image/jpg', 'Limay.jpg')
    })
    .matches('Watch', (session, args) => {
        messageNudger.cancelTimer(session);

        for (var i = 0; i < args.entities.length; i++) {
            session.send('args\n\n' + (i + 1).toString() + ') ' + args.entities[i].entity + ', ' + args.entities[i].type + '\n\n', session.message.text);
        }

        for (var i = 0; i < session.message.entities.length; i++) {
            session.send('message\n\n' + (i + 1).toString() + ') ' + session.message.entities[i].entity + ', ' + session.message.entities[i].type + '\n\n', session.message.text);
        }

        var moviesCallback = function (movies) {

            var messageBack = 'When you have some free time you should go see \'';
            for (var i = 0; i < movies.length; i++) {
                messageBack += movies[i].title + '\'. It\'s a real great movie..\n\n';
                messageBack += movies[i].image;
            }

            session.send(messageBack, session.message.text);
        };

        var showsCallback = function (shows) {

            var messageBack = 'I\'ve heard about a real good show called \'';
            for (var i = 0; i < shows.length; i++) {
                messageBack += shows[i].title + '\'.\n\n';
                messageBack += shows[i].image;
            }

            session.send(messageBack, session.message.text);
        };

        // Checking for Movies entities
        var entity = builder.EntityRecognizer.findEntity(args.entities, 'Movies');

        if (entity) {
            trakttv.FindPopularMovies(moviesCallback);
        }
        else {
            // Checking for Shows entities
            entity = builder.EntityRecognizer.findEntity(args.entities, 'Shows');

            if (entity) {
                trakttv.FindPopularShows(showsCallback);
            }
        }
    })
    .matches('Weather', (session, args) => {
        messageNudger.cancelTimer(session);
        try {


            // Initialize 
            var forecast = new Forecast({
                service: 'darksky',
                key: '6deb2af77d2dce8586af8ca9928faadf',
                units: 'celcius',
                cache: true,      // Cache API requests 
                ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
                    minutes: 27,
                    seconds: 45
                }
            });

            forecast.get([32.055614, 34.858787], function (err, weather) {
                session.send("currently weather " + "at timezone " + weather.timezone + " is:" + weather.daily.data[0].summary, session.message.text);
            });
        }
        catch (ex) { session.send("Weather error", session.message.text); }

    })
    .matches('surf', (session, args) => {
        messageNudger.cancelTimer(session);
        var user = session.message.address.user.name;
        session.send(`${user} you asked about surfing !`, session.message.text);

        messageNudger.cancelTimer(session);
        try {


            var forecast = new Forecast({
                service: 'darksky',
                key: '6deb2af77d2dce8586af8ca9928faadf',
                units: 'celcius',
                cache: true,      // Cache API requests 
                ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
                    // Initialize 
                    minutes: 27,
                    seconds: 45
                }
            });

            forecast.get([32.055614, 34.858787], function (err, weather) {
                session.send("currently weather " + "at timezone " + weather.timezone + " is:" + weather.daily.data[0].summary, session.message.text);
            });
        }
        catch (ex) { session.send("Weather error", session.message.text); }
        var strNextDays;

        weather.daily.data.forEach(function (element) {
            strNextDays += element;
        }, this);

        session.send("text");;
    })
    .matches('shani', (session, args) => {
        messageNudger.cancelTimer(session);
        session.send('is the best', session.message.text);
    })
    .onDefault((session) => {
        try {


            var forecast = new Forecast({
                service: 'darksky',
                key: '6deb2af77d2dce8586af8ca9928faadf',
                units: 'celcius',
                cache: true,      // Cache API requests 
                ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
                    // Initialize 
                    minutes: 27,
                    seconds: 45
                }
            });

            forecast.get([32.055614, 34.858787], function (err, weather) {
                var strNextDays;

                weather.daily.data.forEach(function (element) {
                    strNextDays += element;
                }, this);
            });

            // rotem
            if (hasImageAttachment(session)) {
                var stream = getImageStreamFromUrl(session.message.attachments[0]);
                captionService
                    .getCaptionFromStream(stream)
                    .then(caption => handleSuccessResponse(session, caption))
                    .catch(error => handleErrorResponse(session, error));

                var oxfordEmotion = require("node-oxford-emotion")("fbe5dde1aecc4b52aab90285d2dcb2c2");
                var emotions = [];
                oxfordEmotion.recognize(
                    "url", 
                    "http://www.canadianpharmacymeds.com/blog/wp-content/uploads/2014/06/bipolar-disorder-woman-with-different-emotions.jpg", 
                    function (emotions) {
                        var emotionMessage = '';

                        for (var i = 0; i < emotions.length; i++) {
                            var maxEmotion = -Infinity;
                            var emotionDescription;
                            for (var emotion in emotions[i].scores) {
                                if (emotions[i].scores[emotion] > maxEmotion) {
                                    maxEmotion = emotions[i].scores[emotion];
                                    emotionDescription = emotion;
                                }
                            }
                            
                            emotionMessage += `The ${ i + 1 } person is feeling ${ emotionDescription }\n\n`;
                        }

                        session.send(emotionMessage, session.message.text);  
                    });


                /*   var req = Request(
                   {
                       url: 'https://westus.api.cognitive.microsoft.com/emotion/v1.0',//url de la api 
                       method: 'POST',
                       headers: {
                           'Content-Type': 'application/octet-stream',//formato de envío de la imagen al api
                           'Ocp-Apim-Subscription-Key': 'fbe5dde1aecc4b52aab90285d2dcb2c2',//suscription API KEY
                       }
                   }, function (error, response, body) {
                       if (error) {
                           reply(error); //en caso de que se algo salga mal, retornamos al cliente dicho error 
                       } else {
                           // si todo sale bien, devolvemos al cliente la respuesta del API
                           reply({ 'uri' : Util.format('/public/upload/%s', fileName), 'info': body }).code(200);
                       }
                   });*/
            }
            else {
                session.send('Sorry, I did not understand \'%s\'.', session.message.text);
            }
        }
        catch (ex) { session.send("Weather error", session.message.text); }

    });

bot.dialog('/', intents);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

/// rotem from here

//=========================================================
// Utilities
//=========================================================
const hasImageAttachment = session => {
    return session.message.attachments.length > 0 &&
        session.message.attachments[0].contentType.indexOf('image') !== -1;
};

const getImageStreamFromUrl = attachment => {
    var headers = {};
    if (isSkypeAttachment(attachment)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken((error, token) => {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }

    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
};



const isSkypeAttachment = attachment => {
    return url.parse(attachment.contentUrl).hostname.substr(-'skype.com'.length) === 'skype.com';
};

/**
 * Gets the href value in an anchor element.
 * Skype transforms raw urls to html. Here we extract the href value from the url
 * @param {string} input Anchor Tag
 * @return {string} Url matched or null
 */
const parseAnchorTag = input => {
    var match = input.match('^<a href=\"([^\"]*)\">[^<]*</a>$');
    if (match && match[1]) {
        return match[1];
    }

    return null;
};

//=========================================================
// Response Handling
//=========================================================
const handleSuccessResponse = (session, caption) => {
    if (caption) {
        session.send('I think it\'s ' + caption);


        // var stream = getImageStreamFromUrl(session.message.attachments[0]);


        /*
            var oxfordEemotion = require("node-oxford-emotion")("fbe5dde1aecc4b52aab90285d2dcb2c2");
                  var emotion = oxfordEemotion.recognize("image", stream, function(cb) {
                                console.log(cb);
                        });   */

    }
    else {
        session.send('Couldn\'t find a caption for this one');
    }

};

const handleErrorResponse = (session, error) => {
    session.send('Oops! Something went wrong. Try again later.');
    console.error(error);
}; 