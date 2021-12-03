const Command = require('../../../core/classes/Command');

class XPInfo extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'xpinfo';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Information on XP';
        this.usage        = 'xpinfo (range)';
        this.expectedArgs = 0;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const table = [
            [ 'Level', 'XPForLevel', 'XPForLevel -> LevelForXP', 'Correct?' ]
        ];
        
        const authorLevelling = message.author.levelling;
        const range = !isNaN(parseFloat(args[0])) && parseFloat(args[0]) <= 30 ? parseFloat(args[0]) : 10;
        
        Array.from(Array(range + 1).keys())
        .forEach(level => {
            const XPForLevel = authorLevelling.getLevelXP(level);
            const LevelForXP = authorLevelling.getXPLevel(XPForLevel)
            const correct    = level == LevelForXP;
            
            table.push([ level, XPForLevel, LevelForXP, correct && 'Yes' || 'No' ])
        });
        
        return this.sendMessage(message.channel, {
            embed: {
                description: this.codeBlock(this.table(table)),
            }
        });
    }    
}

module.exports = XPInfo;
