const Base = require('../Base');

class PermissionsManager extends Base {
    constructor(global) {
        super(global);
    }

    isAdmin(user) {
        if (!user || !user.id) return false;

        if (this.config.admins.has(user.id)) {
            return true;
        }

        return false;
    }

    isServerAdmin(member, channel) {
        if (!member || channel.type != 'GUILD_TEXT') return false;

        if (this.isAdmin(member)) return true;

        return (
            member.id == channel.guild.ownerId ||
            (member.permissions &&
                (member.permissions.has('ADMINISTRATOR') || member.permissions.has('MANAGE_GUILD')))
        )
    }

    isServerMod(member, channel) {
        if (!member || channel.type != 'GUILD_TEXT') return false;

        if (this.isAdmin(member) || this.isServerAdmin(member, channel)) return true;

        return (
            member.id == channel.guild.ownerId ||
            (member.permissions &&
                (
                    member.permissions.has('KICK_MEMBERS') ||
                    member.permissions.has('BAN_MEMBERS') ||
                    member.permissions.has('MANAGE_MESSAGES')
                ))
        )
    }
}

module.exports = PermissionsManager;
