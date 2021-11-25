const Module = require('../core/classes/Module');

class RoleManager extends Module {
    constructor(global) {
        super(global);
        
        this.module      = 'RoleManager';
        this.description = 'Manage user roles - event based';
        this.core        = true;
        this.enabled     = true;

        globalEvents.on('addRole', this.addRole.bind(this));
        globalEvents.on('removeRole', this.removeRole.bind(this));
    }

    static get name() {
        return 'RoleManager';
    }


    async addRole(role_id, user_id) {
        let role  = null;
        let user  = null;
        let guild = null

        for (const [ id, g ] of this.client.guilds.cache) {
            const r = g.roles.cache.get(role_id);
            if (r) {
                role = r;
                
                const u = g.members.cache.get(user_id);
                if (u) {
                    user = u;
                    guild = g;
                }
            }
        }

        if (!role) this.logWebhook("Role Not Found", null, {
            webhook: 'errors',
            username: "Role Not Found",
            text: `Role \`${role_id}\` not found when trying to add it to user \`${user}\``,
            suppress: true
        });

        if (!user) this.logWebhook("User Not Found", null, {
            webhook: 'errors',
            username: "User Not Found",
            text: `User \`${user_id}\` not found when trying to add role \`${role_id}\``,
            suppress: true
        });

        if (!role || !user || !guild) return;

        if(role.position > guild.me.roles.highest.position) return this.logger.warn(`Trying to target higher role when adding role \`${role_id}\` to user \`${user_id}\``, 'addRole');

        try {
            await user.roles.add(role, 'addRole event: inventory use');
        } catch (err) {
            this.logger.error(`Error adding role \`${role_id}\` to user \`${user_id}\` because: ${err.message}`, 'addRole');
            this.logWebhook("Error Adding Role", null, {
                webhook: 'errors',
                username: "Error Adding Role",
                text: `Error adding role \`${role_id}\` to user \`${user_id}\` because: ${err.message}`,
                suppress: true
            });
        }
    }
    
    async removeRole(role_id, user_id) {
        let role  = null;
        let user  = null;
        let guild = null

        for (const [ id, g ] of this.client.guilds.cache) {
            const r = g.roles.cache.get(role_id);
            if (r) {
                role = r;
                
                const u = g.members.cache.get(user_id);
                if (u) {
                    user = u;
                    guild = g;
                }
            }
        }

        if (!role) this.logWebhook("Role Not Found", null, {
            webhook: 'errors',
            username: "Role Not Found",
            text: `Role \`${role_id}\` not found when trying to remove it from user \`${user_id}\``,
            suppress: true
        });

        if (!user) this.logWebhook("User Not Found", null, {
            webhook: 'errors',
            username: "User Not Found",
            text: `User \`${user_id}\` not found when trying to remove role \`${role_id}\``,
            suppress: true
        });

        if (!role || !user || !guild) return;

        if(role.position > guild.me.roles.highest.position) return this.logger.warn(`Trying to target higher role when removing role \`${role_id}\` from user \`${user_id}\``, 'removeRole');

        try {
            await user.roles.remove(role, 'removeRole event: inventory use');
        } catch (err) {
            this.logger.error(`Error removing role \`${role_id}\` to user \`${user_id}\` because: ${err.message}`, 'removeRole');
            this.logWebhook("Error Removing Role", null, {
                webhook: 'errors',
                username: "Error Removing Role",
                text: `Error removing role \`${role_id}\` from user \`${user_id}\` because: ${err.message}`,
                suppress: true
            });
        }
    }
}

module.exports = RoleManager;