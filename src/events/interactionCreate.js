module.exports = async function interactionCreate(dispatcher, interaction) {
    if (!dispatcher.global.isReady || !interaction) return Promise.resolve();

    if (await interaction.user.blacklist.get()) return Promise.resolve();

    let data = null;
    const hasData = await dispatcher.global.hasData(interaction.customId);
    if (hasData) {
        data = await dispatcher.global.getData(interaction.customId);
    }

    return new Promise((resolve) => {
        resolve({
            interaction,
            data,
            isAdmin: dispatcher.global.permissions.isAdmin(interaction.user)
        })
    });
}
