const { Constants } = require('discord.js');
const Base = require('../Base');

class EventManager extends Base {
	constructor(global) {
		super(global);

		this._handlers = new Map();
		this._listeners = new Map();
		this._events = Object.values(Constants.Events);

		this.registerListeners();
	}
    
	async registerListeners() {
		const listeners = await this.utils.readdir(this.config.paths.events);
		listeners.forEach(file => {
			const listener = require(file);
			if (!listener || !listener.name) return this.logger.warn(`Invalid listener`, file);
			
			this._listeners.set(listener.name, listener);
			this.logger.debug(`Registered ${listener.name} listener`);
		});
		
		this.logger.info(`Registered ${this._listeners.size} listeners`)
	}
	
	bindListeners() {
		let bounded = 0;
		for (const event of this._events) {
			this.client.on(event, this.createListener.bind(this, event));
			bounded++;
		}
		
		this.logger.info(`Bound ${bounded} listeners`);
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
				.catch(err => this.logger.error(err, `${event}Handler`));
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
		this.logger.debug(`Registered ${event} handler`);
	}
}

module.exports = EventManager;
