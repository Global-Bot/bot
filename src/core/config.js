const pkg = require('../../package.json');
const { Intents } = require('discord.js');

const config = {
    clientOptions: {
        shards: 'auto',
        shardCount: 1,
        userAgentSuffix: [ 'Global', `v${pkg.version}`],
        presence: {
            status: 'online',
            activities: [
                { name: `Global bot v${pkg.version}`, type: 'WATCHING' }
            ]
        },
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
            Intents.FLAGS.GUILD_INTEGRATIONS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        ]
    },
    token: process.env.BOT_TOKEN,
    logger: {
        logLevel: 'INFO'
    },
    db: {
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host:     process.env.DB_HOST,
        dialect:  process.env.DB_DIALECT,
        port:     process.env.DB_PORT
    }
};

module.exports = config;
