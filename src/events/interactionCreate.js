module.exports = async function interactionCreate(dispatcher, interaction) {
    if (!dispatcher.global.isReady || !interaction) return Promise.reject();

    return new Promise((resolve) => {
        resolve({
            interaction,
            isAdmin: dispatcher.global.permissions.isAdmin(interaction.user)
        })
    });
}
