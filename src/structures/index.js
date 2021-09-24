class Structures {
    static load() {
        require('./User');
        require("./GuildMember")
        return true;
    }
}

module.exports = Structures;
