const Module = require('../core/classes/Module');
const { MessageButton, MessageActionRow } = require('discord.js');

class CommandHandler extends Module {
    constructor(global) {
        super(global);
        
        this.module      = 'CommandHandler';
        this.description = 'Handles commands for Global bot';
        this.core        = true;
        this.enabled     = true;

        this.helpCommands = [ 'help', 'commands' ];
        
        this.global.commands.on('command', this.onCommand);
        this.global.commands.on('error', this.onCommandFail);
        
        this.init()
    }

    static get name() {
        return 'CommandHandler';
    }

    init() {
        this.cooldowns = new Map();
		this.cooldown = 1000;

		this.schedule('*/1 * * * * *', this.clearCooldowns.bind(this));
    }

    clearCooldowns() {
        for (const [ id, time ] of this.cooldowns.entries()) {
            const cooldownOver = (Date.now() - time) >= this.cooldown;
            if (!cooldownOver) return;

            this.cooldowns.delete(id);
        }
    }

    isCooldown(message) {
        const cooldown = this.cooldowns.get(message.author.id);
		if (cooldown && (Date.now() - cooldown) <= this.cooldown) return true;

		this.cooldowns.set(message.author.id, Date.now());
		return false;
    }

    onCommand({ message, args, command, time, summary }) {
		this.logger.info(`${summary({ message, args, command, time })} Successfully ran for ${message.author.username}`, 'Success');
    }

    onCommandFail({ message, args, command, time, summary, err }) {
		this.logger.error(`${summary({ message, args, command, time })} Failed to run: "${err.message || err}"`, 'Failure');
    }
    
    canExecute(command, event) {
        const { message, isAdmin } = event;

        const isServerAdmin = this.isServerAdmin(message.member, message.channel);
        const isServerMod = this.isServerMod(message.member, message.channel);

        let hasPermission = true;

        if (isAdmin) return true;

        // serverAdmin
        if (command.permissions == 'serverAdmin' && !isServerAdmin) hasPermission = false;

        // serverMod
        if (command.permissions == 'serverMod' && !isServerMod) hasPermission = false;

        // admin
        if (command.permissions == 'admin' && !isAdmin) hasPermission = false;

        // permCheck
        if (command.permCheck && command.permCheck({ message, isAdmin, isServerAdmin, isServerMod })) return true;
        
        return hasPermission;
    }

    async messageCreate(event) {
        const { message, guild, isAdmin } = event;
        if (!message || message.author.bot || !guild) return;

        let content = message.content,
            command = content,
            prefixes = [
                this.config.prefix,
                `<@${this.client.user.id}>`,
                `<@!${this.client.user.id}>`
            ],
            startsWithPrefix = prefixes.filter(prefix => message.content.startsWith(prefix));
        
        if (!startsWithPrefix.length) return;

        for (const prefix of prefixes) {
            command = command.replace(prefix, '');
			content = content.replace(prefix, '');
        }
        
        command = command.split(' ')[0].toLowerCase();
        if (!command) return;

        if (this.isCooldown(message)) return;

        const commands = this.global.commands;

        if (!this.helpCommands.includes(command) && !commands.has(command)) return;

		const args = content.replace(/ {2,}/g, ' ').split(' ').slice(1);

        if (this.helpCommands.includes(command)) {
            if (args.length && commands.has(args[0])) {
                const cmd = commands.get(args[0]);
                if (cmd.permissions == 'admin' && !event.isAdmin) return;
                if (cmd.hide) return;

                return cmd.help(message);
            }

            return this.helpMenu({ message, isAdmin });
        }

        const cmd = commands.get(command);

        if (!this.canExecute(cmd, event)) {
            if (cmd.permissions == 'admin' && !event.isAdmin) return;

            return this.sendMessage(message.channel, 'author no perms');
        }

        const executeStart = Date.now();
        
        try {
            await cmd._execute({
                message,
                args,
                command,
                guild,
                isAdmin
            })
            .then(() => {
                const time = Date.now() - executeStart;
                commands.emit('command', { message, args, command, time, summary: cmd.summary } );
            })
            .catch(err => {
                const time = Date.now() - executeStart;
                commands.emit('error', { message, args, command, time, summary: cmd.summary, err } );
            })
        } catch (err) {
            this.logger.error(err);
        }
    }

    helpMenu({ message, isAdmin }) {
        this.sendMessage(message.channel, this.helpPage({
            author: message.author.id,
            isAdmin
        }));
    }

    helpPage({ author, category, isAdmin }) {
        const help = {};

        if (category && category.toLowerCase() == 'admin' && !isAdmin) return;

        const categorizedCommands = this.utils.groupArray(Array.from(this.global.commands.values()), 'group');
        if (category && !categorizedCommands[category]) return;
        
        Object.keys(categorizedCommands).map(cat => {
            let commands = categorizedCommands[cat];
            commands = commands.filter((item,index) => commands.indexOf(item) == index);

            categorizedCommands[cat] = commands;
        });

        let embed;
        const prefix = this.config.prefix;

        if (!category) {
            const mainHelpPage = [];

            for (const [ cat, commands ] of Object.entries(categorizedCommands)) {
                if (cat && cat.toLowerCase() == 'admin' && !isAdmin) continue;

                mainHelpPage.push({
                    name: `${cat} [${commands.length}]`,
                    value: `\`${prefix}help ${cat.toLowerCase()}\``,
                    inline: true
                });
            }

            embed = {
                title: 'Commands List',
                fields: mainHelpPage
            }
        } else {
            let categoryPage = `You can do \`${prefix}help <cmd>\` for more info on how to use them.\n\n**Commands**\n`;

            for (const command of Object.values(categorizedCommands[category])) {
                if (command.permissions == 'admin' && !isAdmin) continue;

                categoryPage += `\`${prefix}${command.name}\` - ${command.description}\n`;
            }

            embed = {
                title: `${category} Commands`,
                description: categoryPage
            }
        }

        help.embed  = embed;
        help.embeds = [ embed ];

        if (!category) {
            const categoryButtons = Object.keys(categorizedCommands).map(cat => {
                if (cat && cat.toLowerCase() == 'admin' && !isAdmin) return null;
    
                return this.button(cat, 'help', this.utils.firstUppercase(cat), { author })
            })
            .filter(button => !!button) // Remove invalid buttons (admin button if user isn't admin)
    
            const row = new MessageActionRow()
            .addComponents(categoryButtons);
            
            help.components = [ row ];
        }


        return help;
    }

    async interactionCreate({ interaction, data, isAdmin }) {
        if (!this.validate(interaction)) return;
        const { identifier, command } = await this.resolve(interaction);

        if (command != 'help') return;
        if (interaction.user.id != data.author) return;

        await interaction.deferUpdate();
        await interaction.editReply(this.helpPage({
            category: identifier,
            author: data.author,
            isAdmin
        }));
    }
}

module.exports = CommandHandler;
