function splitMessage(message, length) {
    const msgArray = [];

    if (!message) return msgArray;

    if (Array.isArray(message)) {
        message = message.join('\n');
    }

    if (message.length > length) {
        let str = '',
            pos;

        while (message.length > 0) {
            let index = message.lastIndexOf('\n', length);
            if (index == -1) {
                index = message.lastIndexOf(' ', length);
            }

            pos = (message.length >= length && index != 0) ? index : message.length;

            if (pos > length) {
                pos = length;
            }

            str = message.substr(0, pos);
            message = message.substr(pos);

            msgArray.push(str);
        }
    } else {
        msgArray.push(message);
    }

    return msgArray;
}

module.exports = splitMessage;
