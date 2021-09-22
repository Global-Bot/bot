const Collection = require('./Collection');
const utils = require('../../utils');
const config = require('../../config');
const Base = require('../Base');

class ModuleCollection extends Collection {
    constructor(global) {
        super();

        this.global = global;
        this._client = global.client;
		this._config = config;

        this._base = new Base(global);
        this.logger = this._base.logger;

        this.modules = this._config.clientOptions.modules || [];

        this.loadModules();
    }

    async loadModules() {
		const modules = await utils.readdir(this._config.paths.modules);
        modules.forEach(file => {
            if (!file.endsWith('.js')) return;
            
            const module = require(file);
            if (!module) return;

            this.register(module);
        });
        
        this.logger.info(`Registered ${this.size} modules`);
    }

    register(Module) {
        this.logger.debug(`Registering module ${Module.name}`);

        let module = new Module(this.global);
        if (!module.enabled) return;

        if (!this.ensureModule(module)) return;

        if (!this.modules.includes(Module.name)) return;

        if (module.commands) {
            const commands = Array.isArray(module.commands) ? module.commands : Object.values(module.commands);
            commands.forEach(this.global.commands.register);
        }
        
        if (module.models) {
            const models = Array.isArray(module.models) ? module.models : Object.values(module.models);
            this.registerModels(models);
        }

        this.set(Module.name, module);

        const events = this.global.dispatcher.events;
        events.forEach(event => {
            if (!module[event]) return;

            module.registerHandler(event, module[event]);
        });

        this.get(Module.name)._init(this.global);
    }

    registerModels(models) {
        if (!models || !models.length) return;

        models.forEach(model => {
            if (typeof model != 'object' || !model.name || !model.schema) return;
            
            this.global.db.registerModel({
                name: model.name,
                schema: model.schema,
                doNotSync: typeof model.doNotSync == 'boolean' ? model.doNotSync : false
            });
            
            this.logger.debug(`Registered database model ${model.name}`);
        });
    }

    ensureModule(module) {
		try {
			return module.ensure();
		} catch (err) {
			const error = JSON.parse(err.message);
			this.logger.error(error.err);

			const fields = [
				{ name: 'Name',        value: module.constructor.name,                                               inline: true },
				{ name: 'Description', value: typeof module.description == 'string'? module.description : 'Invalid', inline: true },
				{ name: '\u200b',      value: '\u200b',                                                              inline: true }
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

			this._base.logWebhook(`Module "Test" failed ensurement`, fields, {
				webhook: 'moduleCollection',
				username: 'Ensurement Error',
				text: error.err,
                logMethod: 'warn'
			});

            return false;
		}
	}
}

module.exports = ModuleCollection;
