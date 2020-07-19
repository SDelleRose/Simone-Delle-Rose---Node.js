const moment = require('moment');

//message content
function contentChatMessage(username, text, id) {
    return {
        username,
        text,
        id,
        time: moment().format('H:mm')
    }
}

module.exports = contentChatMessage;