const Module = require('../core/classes/Module');

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
		this.logger.error(`${summary({ message, args, command, time })} Failed to run: "${err.message}"`, 'Failure');
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
            cmd._execute({
                message,
                args,
                command,
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
        this.sendMessage(message.channel, 'main help menu here. isadmin=' + isAdmin)
    }
}

module.exports = CommandHandler;
