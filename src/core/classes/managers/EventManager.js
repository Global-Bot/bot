const utils = require('../../utils');
const logger = require('../../logger').get('EventManager');
const { Constants } = require('discord.js');

class EventManager {
	constructor(global) {
		this.global = global;
		this._client = global.client;
		this._config = global.config;

		this._handlers = new Map();
		this._listeners = new Map();
		this._events = Object.values(Constants.Events);

		this.registerListeners();
	}

	get client() {
		return this._client;
	}

	get config() {
		return this._config;
	}
    
	async registerListeners() {
		const listeners = await utils.readdir(this._config.paths.events);
		listeners.forEach(file => {
			const listener = require(file);
			if (!listener || !listener.name) return logger.warn(`Invalid listener`, file);
			
			this._listeners.set(listener.name, listener);
			logger.debug(`Registered ${listener.name} listener`);
		});
		
		logger.info(`Registered ${this._listeners.size} listeners`)
	}
	
	bindListeners() {
		let bounded = 0;
		for (const event of this._events) {
			this.client.on(event, this.createListener.bind(this, event));
			bounded++;
		}
		
		logger.info(`Bound ${bounded} listeners`);
	}

	createListener(event, ...args) {
		const listener = this._listeners.get(event);
		const eventHandlers = this._handlers.get(event);
		
		if (listener) {
			return listener(this, ...args)
				.then(async data => {
					if (!data) return;
					
					if (!eventHandlers) return;
					eventHandlers.forEach(handler => handler(data));
				})
				.catch(err => logger.error(err, `${event}Handler`));
		} else {
			if (!eventHandlers) return;
			eventHandlers.forEach(handler => handler(...args));
		}
	}

	registerHandler(event, handler) {
		let eventHandlers = this._handlers.get(event);
		if (!eventHandlers) {
			this._handlers.set(event, []);
			eventHandlers = [];
		}
		
		eventHandlers.push(handler);
		
		this._handlers.set(event, eventHandlers);
		logger.debug(`Registered ${event} handler`);
	}
}

module.exports = EventManager;
