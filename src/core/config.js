const pkg = require('../../package.json');
const { Intents } = require('discord.js');
const path = require('path');
const populateMap = require('./utils/populateMap');


const config = {};

config.allowedGuilds = populateMap([
    '719706716962422806', // Global
    '878759943661027408', // Global | Bot Rework
    '888480577550975026', // Global | Logs
    '888478366540365835', // Global | Lzz Testing
])

config.clientOptions = {
    shards: 'auto',
    shardCount: 1,
    userAgentSuffix: [ 'GlobalBot', `v${pkg.version}`],
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
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ]
}

config.token = process.env.BOT_TOKEN;

config.logger = {
    logLevel: 'INFO'
}

config.db = {
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host:     process.env.DB_HOST,
    dialect:  process.env.DB_DIALECT,
    port:     process.env.DB_PORT
}

const basePath = path.resolve(path.join(__dirname, '..'));
config.paths = {
    basePath,
    events: path.join(basePath, 'events')
}


module.exports = config;
