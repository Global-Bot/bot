const regex = {
    escape:      str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
    
    userMention: '<@!?([0-9]+)>',
    userID:      /^([0-9]+)$/,
    
    roleMention: '<@&([0-9]+)>',
    roleID:      /^([0-9]+)$/,
    
    channelMention: '<#([0-9]+)',
    channelID: /^([0-9]+)$/
};

class Resolver {
	static user(guild, user, context) {
        if (!user) {
            return null;
        }

        let users = [];

        if (context) {
            users = context;
        } else {
            users = guild ? [ ...guild.members.cache.values() ] : [];
        }

        if (!users || !users.length) {
            return null;
        }

        const mentionID = new RegExp(regex.userMention, 'g').exec(user);
        if (mentionID && mentionID.length > 1) {
            const userIdMention = users.find(u => u.user.id == mentionID[1]);
            if (userIdMention) {
                return userIdMention;
            }
        }

        if (user.includes('#')) {
            const [ name, discrim ] = user.split('#');
            const nameDiscrimSearch = users.find(u => u.user.username == name && u.user.discriminator == discrim);
            if (nameDiscrimSearch) {
                return nameDiscrimSearch;
            }
        }

        if (user.match(regex.userID)) {
            const userIdSearch = users.find(u => u.user.id == user);
            if (userIdSearch) {
                return userIdSearch;
            }
        }

        return null;
    }

    static role(guild, role) {
        if (!role) {
            return null;
        }

        const roles = guild.roles.cache;

        const mention = new RegExp(regex.roleMention, 'g').exec(role);
        if (mention && mention.length > 1) {
            const roleMention = roles.get(mention[1]);
            if (roleMention) {
                return roleMention;
            }
        }

        if (role.match(regex.roleID)) {
            const roleIdSearch = roles.get(role);
            if (roleIdSearch) {
                return roleIdSearch;
            }
        }

        const escapedRole = regex.escape(role);
        const roleNameSearch = roles.find(r => r.name.match(new RegExp(`^${escapedRole}.*`, 'i')));
        if (roleNameSearch) {
            return roleNameSearch;
        }

        return null;
    }

    static channel(guild, channel) {
        if (!channel) {
            return null;
        }

        const channels = guild.channels.cache;
        
        const mention = new RegExp(regex.channelMention, 'g').exec(channel);
        if (mention && mention.length > 1) {
            const channelMention = channels.get(mention[1]);
            if (channelMention) {
                return channelMention;
            }
        }

        if (channel.match(regex.channelID)) {
            const channelIdSearch = channels.get(channel);
            if (channelIdSearch) {
                return channelIdSearch;
            }
        }

        const channelNameSearch = channels.find(c => c.name == channel);
        if (channelNameSearch) {
            return channelNameSearch;
        }

        return null;
    }
}

module.exports = Resolver;
