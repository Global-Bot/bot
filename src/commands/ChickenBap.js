const Command = require('../core/classes/Command');
const fs = require("fs");
const path = require("path");
const { MessageAttachment } = require("discord.js");

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

        this.bapBuffer    = fs.readFileSync(path.join(__dirname, "..", "assets", "chicken-bap.jpg"));
    }

    async execute({ message }) {
        return this.sendMessage(message.channel, {
            files: [
                new MessageAttachment(this.bapBuffer, "chicken-bap.jpg")
            ]
        });
    }
}

module.exports = ChickenBap;
