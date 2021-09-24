class Structures {
    static load() {
        require('./User');
        require('./Array');
        require("./GuildMember");
        
        return true;
    }
}

module.exports = Structures;
