
module.exports = function messageCreate(dispatcher, message) {
    if (!dispatcher.global.isReady || !message) return Promise.reject();
    
    return new Promise((resolve) => {
        resolve({
            message,
            guild: message.guild
        })
    });
}
