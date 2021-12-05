const Command = require('../core/classes/Command');

class ChickenBap extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'chicken-bap';
        this.group        = 'Baps';
        this.aliases      = [];
        this.description  = 'Guess you\'ll never know';
        this.usage        = 'chicken-bap';
        this.expectedArgs = 0;
        this.cooldown     = 1000;
        this.hide         = true;
    }

    async execute({ message }) {
        return this.sendMessage(message.channel, 'https://timlawrencedotme.files.wordpress.com/2014/05/chicken-roll-cut_sm.jpg');
    }
}

module.exports = ChickenBap;
