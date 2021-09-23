const pkg = require('../../package.json');
const { Intents } = require('discord.js');
const path = require('path');
const populateMap = require('./utils/populateMap');


const config = {
    name: 'Global'
};

config.allowedGuilds = populateMap([
    '719706716962422806', // Global
    '878759943661027408', // Global | Bot Rework
    '888480577550975026', // Global | Logs
    '888478366540365835', // Global | Lzz Testing
])

config.admins = populateMap([
    '199109802281009152', // Not_Chris
    '394594679221518336', // IXZ
    '373965085283975171', // Lzz
    '140790683341422592', // Sam*
])

config.webhooks = populateMap([
    // Roles
    { key: 'logPingRole',       value: '889193688310382642'                                                                                                       },
    // Loggers
    { key: 'errors',            value: 'https://discord.com/api/webhooks/888801681926651925/gdwNCdkPtkfc5rOEkNnxUZ8qIZvoEKe-CjaZbKWUO5LIBCQLagieu8MUbsLE555g8CDT' },
    { key: 'warns',             value: 'https://discord.com/api/webhooks/888883632293416970/uvj5at3I22E10-vtwBjJxpKRWE4ZHFI8VEuCn333N0HXQuynCzkCorQdt96dgfM33wmX' },
    // Errors
    { key: 'rejections',        value: 'https://discord.com/api/webhooks/888884936130572288/Ml369brO44sNl_qvXhXDQJFEcRGdvf-TFzbbSrTc5sVhy4-JJ7oTAcGV9xzzL_EjbSuB' },
    { key: 'exceptions',        value: 'https://discord.com/api/webhooks/888885008138395679/VNqMzt45DDBD8oRGiinTTpii9XaiTFl6orKTOaK8BLY_MRffGF1nBhwXxYZAMR8Vxhnh' },
    // Modules
    { key: 'guildManager',      value: 'https://discord.com/api/webhooks/888801759114428446/hkaDngEeNl5bB6Gy2RiEmZwCs5TZIKy3Q4K9hqQcvzC1o9na7xgaTXRAKrOhNWZSGPTo' },
    // Collections
    { key: 'commandCollection', value: 'https://discord.com/api/webhooks/889079325440233483/bHldPzbtayMasfLiIpVZycAFCsof0383r33vcKL131FF1PyGB74XuJyLTyvcBHIFniZq' },
    { key: 'moduleCollection',  value: 'https://discord.com/api/webhooks/890286155147395122/_zEF-DHq-CuWhi3tlrwQHJ5jlsQcw7gyGdne6w7I6o8T_S_nLJOcl2RJDhPbWV4QYXQl' },
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
    ],
    modules: [
        'GuildManager',
        'CommandHandler'
    ]
}

config.token = process.env.BOT_TOKEN;

config.prefix = '-';

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
    events:   path.join(basePath, 'events'),
    commands: path.join(basePath, 'commands'),
    modules:  path.join(basePath, 'modules')
}

config.emojis = populateMap([
    { key: 'success', value: '<:GlobalTick:748713755348697191>'  },
    { key: 'error',   value: '<:GlobalCross:748712663626022940>' },
])


module.exports = config;
