const Module = require('../core/classes/Module');
const { MessageActionRow } = require('discord.js');

class CommandHandler extends Module {
    constructor(global) {
        super(global);
        
        this.module      = 'CommandHandler';
        this.description = 'Handles commands for Global bot';
        this.core        = true;
        this.enabled     = true;

        this.helpCommands = [ 'help', 'commands' ];
        
        this.global.commands.on('command', this.onCommand.bind(this));
        this.global.commands.on('error', this.onCommandFail.bind(this));
        
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
        
        const handleXPMessage = this.global.modules.get("Levelling").handleXPMessage;

        let content = message.content,
            command = content,
            prefixes = [
                this.config.prefix,
                `<@${this.client.user.id}>`,
                `<@!${this.client.user.id}>`
            ],
            startsWithPrefix = prefixes.filter(prefix => message.content.startsWith(prefix));
        
        if (!startsWithPrefix.length) return handleXPMessage(event);

        for (const prefix of prefixes) {
            command = command.replace(prefix, '');
			content = content.replace(prefix, '');
        }
        
        command = command.split(' ')[0].toLowerCase();
        if (!command) return handleXPMessage(event);

        if (this.isCooldown(message)) return handleXPMessage(event);

        const commands = this.global.commands;

        if (!this.helpCommands.includes(command) && !commands.has(command)) return handleXPMessage(event);

		const args = content.replace(/ {2,}/g, ' ').split(' ').slice(1);

        if (this.helpCommands.includes(command)) {
            if (args.length && commands.has(args[0])) {
                const cmd = commands.get(args[0]);
                if (cmd.permissions == 'admin' && !event.isAdmin) return handleXPMessage(event);
                if (cmd.hide) return handleXPMessage(event);

                return cmd.help(message);
            }

            return this.helpMenu(message, args[0] || null);
        }

        const cmd = commands.get(command);

        if (!this.canExecute(cmd, event)) {
            handleXPMessage(event)
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

    helpMenu(message, category) {
        const author = message.author.id;
        let help;

        if (this.isCategory(category, author)) {
            help = this.helpEmbed(author, category);
        } else {
            help = this.helpEmbed(author);
        }
        this.sendMessage(message.channel, help);
    }

    isCategory(category, author) {
        if (!category) return false;
        return this.categories(author).map(category => category.toLowerCase()).includes(category.toLowerCase());
    }

    commands(author) {
        const isAdmin = this.isAdmin({ id: author });
        
        let commands = Array.from(this.global.commands.values())
        commands = commands.filter((item, index) => commands.indexOf(item) == index) // Remove alias duplicates
        .map(command => {
            if (command.permissions == 'admin' && !isAdmin) return;
            if (command.hide) return;

            return {
                name: command.name,
                group: command.group.toLowerCase(),
                description: command.description
            };

        })
        .filter(command => !!command);

        return commands
    }

    commandsFromGroup(author, group) {
        group = group.toLowerCase();
        
        const groupedCommands = this.utils.groupArray(this.commands(author), 'group');
        return groupedCommands && groupedCommands[group] ? groupedCommands[group] : [];
    }

    categories(author) {
        const categories = this.commands(author).map(command => command.group);
        return this.removeDuplicates(categories).sort();
    }

    buttons(author) {
        let buttons = this.categories(author).map(category => this.button(category, 'help', this.utils.firstUppercase(category), { author }));
        return this.utils.chunkArray(buttons, 5);
    }

    rows(author) {
        const buttons = this.buttons(author).map(buttonChunk => new MessageActionRow().addComponents(buttonChunk));
        return buttons;
    }
    
    helpEmbed(author, category) {
        return !category ?
        this.mainPage(author) :
        this.categoryPage(author, this.utils.firstUppercase(category.toLowerCase()));
    }

    mainPage(author) {
        const mainPage = {};

        const categories = this.categories(author).map(category => {
            const categoryCommands = this.commandsFromGroup(author, category);

            return {
                name  : `${this.utils.firstUppercase(category)} [${categoryCommands.length}]`,
                value : this.utils.backTick(`${this.config.prefix}help ${category.toLowerCase()}`),
                inline: true
            }
        });

        mainPage.embeds = [
            {
                title: 'Commands List',
                fields: categories,
                color: 'PURPLE'
            }
        ]
        
        mainPage.components = this.rows(author);
        
        return mainPage;
    }

    categoryPage(author, category) {
        const categoryPage = {};

        let categoryInfo = `You can do \`${this.config.prefix}help <cmd>\` for more info on how to use them.\n\n**Commands**\n`;
        categoryInfo += this.commandsFromGroup(author, category).map(command => `${this.utils.backTick(`${this.config.prefix}${command.name}`)} - ${command.description}`).join('\n')

        categoryPage.embeds = [
            {
                title: `${this.utils.firstUppercase(category)} Commands`,
                description: categoryInfo,
                color: 'PURPLE'
            }
        ]

        return categoryPage;
    }

    async interactionCreate({ interaction, data }) {
        if (!this.validate(interaction)) return;
        const { identifier, command } = await this.resolve(interaction);

        if (command != 'help') return;
        if (interaction.user.id != data.author) return;

        try {
            await interaction.deferUpdate();
            await interaction.editReply(this.helpEmbed(data.author, identifier));
        } catch (err) {}
    }
}

module.exports = CommandHandler;
