function hasImageAttachment (session) {
    return session.message.attachments.length > 0 &&
        session.message.attachments[0].contentType.indexOf('image') !== -1;
};

var attachments = {
    hasImageAttachment: hasImageAttachment
};

module.exports = attachments;