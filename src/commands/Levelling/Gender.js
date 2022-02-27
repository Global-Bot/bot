const Command = require('../../core/classes/Command');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

class Gender extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'gender';
        this.group        = 'Levelling';
        this.aliases      = [];
        this.description  = 'Set your gender';
        this.usage        = 'gender';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }

    async execute({ message }) {
        const customID = this.customID('gender_select', 'gender');

        const genderList = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId(customID)
            .setPlaceholder('Select a gender')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(this.config.levelling.GenderOptions.map(gender => ({ label: gender, value: gender })))
        );
        
        const msg = await this.sendMessage(message.channel, { embed: { description: "Select a fllowing gender:" }, components: [ genderList ] });

        const filter = (interaction) => interaction.customId == customID && interaction.user.id == message.author.id;
        const gender = await this.createInteractionCollector(msg, { filter, time: 60000, max: 1 });

        if (!gender || !gender?.values[0] || !this.config.levelling.GenderOptions.includes(gender?.values[0])) {
            return msg.delete().catch(e => e);
        }

        const choice = gender.values[0];
        const authorGender = message.author.gender;
        const setAuthorGender = await authorGender.set(choice);

        this.success(message.channel, `Your gender has been set to ${this.utils.backTick(setAuthorGender)}`)
        .then(() => msg.delete().catch(e => e));
    }
}

module.exports = Gender;
