const EventCollection = require('./EventCollection');
const utils = require('../../utils');
const config = require('../../config');
const Base = require('../Base');

class CommandCollection extends EventCollection {
    constructor(global) {
        super();

        this.global = global;
        this._client = global.client;
		this._config = config;

        this._base = new Base(global);
        this.logger = this._base.logger;

        this.registerCommands();
    }

    async registerCommands() {
        let registered = 0;

		const commands = await utils.readdir(this._config.paths.commands);
        commands.forEach(file => {
            if (!file.endsWith('.js')) return;
            
            const command = require(file);
            if (!command) return;

            if (this.register(command)) {
                registered++;
            }
        });

		this.logger.info(`Registered ${registered} commands`);
    }

    register(Command) {
        let command = new Command(this.global);

        if (!this.ensureCommand(command)) return false;

        this.set(command.name, command);
		this.logger.debug(`Registered command ${command.name}`);

        if (command.aliases && command.aliases.length) {
            for (const alias of command.aliases) {
                this.set(alias, command);
                this.logger.debug(`Registered command ${command.name} -> ${alias}`);
            }
        }

        return true;
    }

    ensureCommand(command) {
		try {
			return command.ensure();
		} catch (err) {
			const error = JSON.parse(err.message);
			this.logger.error(error.err);

			const fields = [
				{ name: 'Name',        value: command.constructor.name,                                                inline: true },
				{ name: 'Description', value: typeof command.description == 'string'? command.description : 'Invalid', inline: true },
				{ name: '\u200b',      value: '\u200b',                                                                inline: true }
			];

			if (!error.exists) {
				fields.push({ name: 'Prop',    value: error.prop,                  inline: true });
				fields.push({ name: 'Exists',  value: error.exists ? 'Yes' : 'NO', inline: true });
				fields.push({ name: 'Def OK?', value: error.exists ? 'OK' : 'NO',  inline: true });
			}

			if (error.received != error.type) {
				fields.push({ name: 'Should Be', value: error.type,                                 inline: true });
				fields.push({ name: 'Received',  value: error.received,                             inline: true });
				fields.push({ name: 'Type OK?',  value: error.received == error.type ? 'OK' : 'NO', inline: true });
			}

			this._base.logWebhook(`Command "Test" failed ensurement`, fields, {
				webhook: 'commandCollection',
				username: 'Ensurement Error',
				text: error.err,
                logMethod: 'warn'
			});

            return false;
		}
	}
}

module.exports = CommandCollection;
