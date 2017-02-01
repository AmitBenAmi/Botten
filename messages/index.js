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
 const   captionService = require('./caption-service'),
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


// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('None', (session, args) => {
    session.send(emojis.get('coffee'), session.message.text);
    if (session.message.text.includes("?")) {
         messageNudger.setNewMessage(session,true);
    } else {
        messageNudger.cancelTimer(session);
    }
})
.matches('Watch', (session, args) => {
    messageNudger.cancelTimer(session);
    var moviesCallback = function (movies) {

        var messageBack = 'I can suggest you few very popular movies:\n\n';
        for (var i = 0; i < movies.length / 2; i++) {
            messageBack += (i + 1).toString() + ': ' + movies[i].title + '\n\n';
        }

        session.send(messageBack, session.message.text);
    };

    var showsCallback = function (shows) {

        var messageBack = 'I can suggest you few very popular shows:\n\n';
        for (var i = 0; i < shows.length / 2; i++) {
            messageBack += (i + 1).toString() + ': ' + shows[i].title + '\n\n';
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
    try{

 
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

forecast.get([32.055614, 34.858787], function(err, weather) {
         session.send("currently weather " + "at timezone " + weather.timezone +" is:" + weather.daily.data[0].summary , session.message.text);
});
} 
    catch(ex){session.send("Weather error", session.message.text);}

})
.matches('surf', (session, args) => {
    messageNudger.cancelTimer(session);
    var user =  session.message.address.user.name;
    session.send(`${ user } you asked about surfing !`, session.message.text);
    
      messageNudger.cancelTimer(session);
    try{

    
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

    forecast.get([32.055614, 34.858787], function(err, weather) {
            session.send("currently weather " + "at timezone " + weather.timezone +" is:" + weather.daily.data[0].summary , session.message.text);
    });
    } 
    catch(ex){session.send("Weather error", session.message.text);}
    var strNextDays;
    
    weather.daily.data.forEach(function(element) {
        strNextDays += element;
    }, this);

    session.send("text");;
})
.matches('shani', (session, args) => {
    messageNudger.cancelTimer(session);
    session.send('is the best', session.message.text);
})
.onDefault((session) => {
 try{

    
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

    forecast.get([32.055614, 34.858787], function(err, weather) {
    var strNextDays;
    
    weather.daily.data.forEach(function(element) {
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
    }
 else{
         session.send('Sorry, I did not understand \'%s\'.', session.message.text);
 }
 }
    catch(ex){session.send("Weather error", session.message.text);}
  
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
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
    }
    else {
        session.send('Couldn\'t find a caption for this one');
    }

};

const handleErrorResponse = (session, error) => {
    session.send('Oops! Something went wrong. Try again later.');
    console.error(error);
};