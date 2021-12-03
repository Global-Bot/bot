module.exports = async function messageCreate(dispatcher, message) {
    if (!dispatcher.global.isReady || !message) return Promise.resolve();

    if (await message.author.blacklist.get()) return Promise.resolve();

    return new Promise((resolve) => {
        resolve({
            message,
            guild: message.guild,
            isAdmin: dispatcher.global.permissions.isAdmin(message.author)
        })
    });
}
