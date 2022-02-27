const pkg = require('../../package.json');
const { Intents } = require('discord.js');
const path = require('path');
const populateMap = require('./utils/populateMap');


const config = {
    name:      'Global',
    stateName: process.env.STATE_NAME || '',
    itemTypes: [ 'item', 'role', 'crate', 'upgrade' ]
};

config.base_guild = "878759943661027408" // Global | Bot Rework

config.allowedGuilds = populateMap([
    config.base_guild,
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
        'CommandHandler',
        'ButtonHandler',
        'BoostReaction',
        'DropHandler',
        'RoleManager',
        'Levelling'
    ]
}

config.token = process.env.BOT_TOKEN;

config.prefix = '.';

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
    events:   path.join(basePath, 'events'   ),
    commands: path.join(basePath, 'commands' ),
    modules:  path.join(basePath, 'modules'  ),
}

config.emojis = populateMap([
    { key: 'success',  value: '<:GlobalTick:898234247083618365>'   },
    { key: 'error',    value: '<:GlobalCross:898234247184253008>'  },
    { key: 'star',     value: '<:TestingGStar:890759402133544993>' },
    { key: 'kipHeart', value: '<:KipHeart:897095652100685855>'     },
    { key: 'loading',  value: '<a:loading:916486845561466900>'     },
])

config.dropSettings = {
    chanceOfDrop: 30, // 30 -> 30%
    chanceOfFailButton: 25, // 25 -> 25%
    dropChannel: "878759944135016500",
    starRange: [1,7],
    messagesPerDrop: 30
}

config.economySettings = {
    workStarRange:             [ 7, 32 ],
    weeklyBonus:               175,
    dailyBonus:                25,
    coinflipWinningPercentage: 49,
    rollLowestBet:             10,
    leaderboardChannel: ""
}

config.leaderboardSettings = {
    defaultChannel: "902279317906669621"
}

config.boostReactionSettings = {
    minChars:    4,
    maxChars:    20,
    boosterRole: "878760379587653653" // "Tester" role on "Global | Bot Rework"
}

config.rollMultipliers = {
    // If above: multiplier
    0:   0,
    69:  0,
    80:  1.1,
    89:  1.3,
    99:  1.4,
    100: 2
}

config.lottery = {
    ticketPrice: 250,
    channel:     "880550889256009768"
}

config.levelling = {
    XPMessage: {
        min: 3,
        max: 6,
        cooldown: 60000,
        ignoreCommands: true,
        excludedChannels: [
            "802364859891187772", // bots
        ]
    },
    LevelAnnounce: {
        rewardRoleMessage: `Congrats {user}! You are now {role}!`,
        levelMessage: `Congrats {user}! You are now **level {level}**!`
    },
    LevelRewards: {
        5:   '867461762450325515',
        10:  '867461758725914705',
        20:  '867461756069347338',
        40:  '867461752572477481',
        60:  '867462054948110346',
        80:  '867462052540317698',
        100: '867462050602156082',
    },
    Limits: {
        level: 100,
        AboutLength: 255
    },
    GenderOptions: [
        "Male",
        "Female",
        "Other"
    ],
    CountryAPI: "https://restcountries.com/v3.1/all"
}

config.eightball = {
    answers: [
        "It is certain", 
        "It is decidedly so", 
        "Without a doubt", 
        "Yes - definitely",
        "You may rely on it", 
        "As I see it, yes", 
        "Most likely", 
        "Outlook good", 
        "Yes", "Signs point to yes",
        "Don't count on it", 
        "My reply is no",
        "My sources say no", 
        "Outlook not so good",
        "Very doubtful", 
        "Reply hazy, try again", 
        "Ask again later", 
        "Better not tell you now",
        "Cannot predict now", 
        "Concentrate and ask again"
    ]
}

config.wyr = {
    questions: [
        "Would you rather eat a bug or a fly?",
        "Would you rather lick the floor or a broom?",
        "Would you rather eat ice cream or cake?",
        "Would you rather clean a toliet or a babys diaper",
        "Would you rather lick your keyboard or mouse?",
        "Would you rather wash your hair with mash potatoes or cranberry sauce?",
        "Would you rather team up with Wonder Woman or Captain Marvel?",
        "Would you rather want to find true love or win lottery next month?",
        "Would you rather be forced to sing along or dance to every song you hear?",
        "Would you rather have everyone you know be able to read your thoughts or for everyone you know to have access to your Internet history?",
        "Would you rather be chronically under-dressed or overdressed?",
        "Would you rather lose your sight or your memories?",
        "Would you rather have universal respect or unlimited power?",
        "Would you rather give up air conditioning and heating for the rest of your life or give up the Internet for the rest of your life?",
        "Would you rather swim in a pool full of Nutella or a pool full of maple syrup?",
        "Would you rather labor under a hot sun or extreme cold?",
        "Would you rather stay in during a snow day or build a fort?",
        "Would you rather buy 10 things you don’t need every time you go shopping or always forget the one thing that you need when you go to the store?",
        "Would you rather never be able to go out during the day or never be able to go out at night?",
        "Would you rather have a personal maid or a personal chef?",
        "Would you rather have beyoncé’s talent or Jay-Z‘s business acumen?",
        "Would you rather be an extra in an Oscar-winning movie or the lead in a box office bomb?",
        "Would you rather vomit on your hero or have your hero vomit on you?",
        "Would you rather communicate only in emoji or never be able to text at all ever again?",
        "Would you rather be royalty 1,000 years ago or an average person today?",
        "Would you rather lounge by the pool or on the beach?",
        "Would you rather wear the same socks for a month or the same underwear for a week?",
        "Would you rather work an overtime shift with your annoying boss or spend full day with your mother-in-law?",
        "Would you rather cuddle a koala or pal around with a panda?",
        "Would you rather have a sing-off with Ariana Grande or a dance-off with Rihanna?",
        "Would you rather watch nothing but Hallmark Christmas movies or nothing but horror movies?",
        "Would you rather always be 10 minutes late or always be 20 minutes early?",
        "Would you rather have a pause or a rewind button in your life?",
        "Would you rather lose all your teeth or lose a day of your life every time you kissed someone?",
        "Would you rather drink from a toilet or pee in a litter box?",
        "Would you rather be forced to live the same day over and over again for a full year,or take 3 years off the end of your life?",
        "Would you rather never eat watermelon ever again or be forced to eat watermelon with every meal?",
        "Would you rather go to Harvard but graduate and be jobless,or graduate from another college and work for Harvard",
        "Would you rather the aliens that make first contact be robotic or organic?",
        "Would you rather lose the ability to read or lose the ability to speak?",
        "Would you rather have a golden voice or a silver tongue?",
        "Would you rather be covered in fur or covered in scales?",
        "Would you rather be in jail for a year or lose a year off your life?",
        "Would you rather have one real get out of jail free card or a key that opens any door?",
        "Would you rather know the history of every object you touched or be able to talk to animals?",
        "Would you rather be married to a 10 with a bad personality or a 6 with an amazing personality?",
        "Would you rather be able to talk to land animals,animals that fly,or animals that live under the water?",
        "Would you rather have all traffic lights you approach be green or never have to stand in line again?",
        "Would you rather spend the rest of your life with a sailboat as your home or an RV as your home?",
        "Would you rather marry someone pretty but stupid or clever but ugly?",
        "Would you rather give up all drinks except for water or give up eating anything that was cooked in an oven?",
        "Would you rather be able to see 10 minutes into your own future or 10 minutes into the future of anyone but yourself?",
        "Would you rather have to fart loudly every time you have a serious conversation or have to burp after every kiss?",
        "Would you rather become twice as strong when both of your fingers are stuck in your ears or crawl twice as fast as you can run?",
        "Would you rather have everything you draw become real but be permanently terrible at drawing or be able to fly but only as fast as you can walk?",
        "Would you rather thirty butterflies instantly appear from nowhere every time you sneeze or one very angry squirrel appear from nowhere every time you cough?",
        "Would you rather vomit uncontrollably for one minute every time you hear the happy birthday song or get a headache that lasts for the rest of the day every time you see a bird (including in pictures or a video)?",
        "Would you rather eat a sandwich made from 4 ingredients in your fridge chosen at random or eat a sandwich made by a group of your friends from 4 ingredients in your fridge?",
        "Would you rather everyone be required to wear identical silver jumpsuits or any time two people meet and are wearing an identical article of clothing they must fight to the death?",
        "Would you rather have to read aloud every word you read or sing everything you say out loud?",
        "Would you rather wear a wedding dress/tuxedo every single day or wear a bathing suit every single day?",
        "Would you rather be unable to move your body every time it rains or not be able to stop moving while the sun is out?",
        "Would you rather have all dogs try to attack you when they see you or all birds try to attack you when they see you?",
        "Would you rather be compelled to high five everyone you meet or be compelled to give wedgies to anyone in a green shirt?",
        "Would you rather have skin that changes color based on your emotions or tattoos appear all over your body depicting what you did yesterday?",
        "Would you rather randomly time travel +/- 20 years every time you fart or teleport to a different place on earth (on land,not water) every time you sneeze?",
        "Would you rather there be a perpetual water balloon war going on in your city/town or a perpetual food fight?",
        "Would you rather have a dog with a cat’s personality or a cat with a dog’s personality?",
        "If you were reborn in a new life,would you rather be alive in the past or future?",
        "Would you rather eat no candy at Halloween or no turkey at Thanksgiving?",
        "Would you rather date someone you love or date someone who loves you?",
        "Would you rather lose the ability to lie or believe everything you’re told?",
        "Would you rather be free or be totally safe?",
        "Would you rather eat poop that tasted like chocolate,or eat chocolate that tasted like crap?",
        "Would you rather Look 10 years older from the neck up,or the neck down?",
        "Would you rather be extremely underweight or extremely overweight?",
        "Would you rather Experience the beginning of planet earth or the end of planet earth?",
        "Would you rather have three kids and no money, or no kids with three million dollars?",
        "Would you rather be the funniest person in the room or the most intelligent?",
        "Would you rather have a Lamborghini in your garage or a bookcase with 9000 books and infinite knowledge?",
        "Would you rather Reverse one decision you make every day or be able to stop time for 10 seconds every day?",
        "Would you rather win $50,000 or let your best friend win $500,000?",
        "Would you rather Run at 100 mph or fly at ten mph?",
        "Would you rather Continue with your life or restart it?",
        "Would you rather be able to talk your way out of any situation,or punch your way out of any situation?",
        "Would you rather have free Wi-Fi wherever you go or have free coffee where/whenever you want?",
        "Would you rather have seven fingers on each hand or have seven toes on each foot?",
        "Would you rather live low life with your loved one or rich life all alone?",
        "Would you rather have no one to show up for your wedding or your funeral?",
        "Would you rather Rule the world or live in a world with absolutely no problems at all?",
        "Would you rather go back to the past and meet your loved ones who passed away or go to the future to meet your children or grandchildren to be?",
        "Would you rather Speak your mind or never speak again?",
        "Would you rather live the life of a king with no family or friends or live like a vagabond with your friends or family?",
        "Would you rather know how you will die or when you will die?",
        "Would you rather Speak all languages or be able to speak to all animals?",
        "Would you rather get away with lying every time or always know that someone is lying?",
        "Would you rather Eat your dead friend or kill your dog and eat it when you are marooned on a lonely island?",
        "Would you rather have a billion dollars to your name or spend $1000 for each hungry and homeless person?",
        "Would you rather end death due to car accidents or end terrorism?",
        "Would you rather end the life a single human being or 100 cute baby animals?",
        "Would you rather end hunger or end your hunger?",
        "Would you rather give up your love life or work life?",
        "Would you rather live in an amusement park or a zoo?",
        "Would you rather be a millionaire by winning the lottery or by working 100 hours a week?",
        "Would you rather read minds or accurately predict future?",
        "Would you rather eat only pizza for 1 year or eat no pizza for 1 year?",
        "Would you rather visit 100 years in the past or 100 years in the future?",
        "Would you rather be invisible or be fast?",
        "Would you rather Look like a fish or smell like a fish?",
        "Would you rather Play on Minecraft or play FIFA?",
        "Would you rather Fight 100 duck-sized horses or 1 horse-sized duck?",
        "Would you rather have a grapefruit-sized head or a head the size of a watermelon?",
        "Would you rather be a tree or have to live in a tree for the rest of your life?",
        "Would you rather live in space or under the sea?",
        "Would you rather lose your sense of touch or your sense of smell?",
        "Would you rather be Donald Trump or George Bush?",
        "Would you rather have no hair or be completely hairy?",
        "Would you rather wake up in the morning looking like a giraffe or a kangaroo?",
        "Would you rather have a booger hanging from your nose for the rest of your life or earwax planted on your earlobes?",
        "Would you rather have a sumo wrestler on top of you or yourself on top of him?"
    ]
}

config.topics = {
    questions: [
        "What's your guy's favourite video game?", 
        "What's your guy's favourite food?",
        "What do you do in your free time?",
        "What kind of music are you into?",
        "Do you like reading books?",
        "Do you play any sports?", 
        "How do you like your neighborhood?",
        "What type of movies do you like?",
        "What shows do you watch?",
        "Where have you been on vacation?",
        "Are you a cat person or a dog person?",
        "What are some current trends you just can’t get behind?",
        "What kinds of things do you pick up easily?",
        "What do you think would be the most useful thing you could do with virtual reality?",
        "Apple or Android?",
        "What games did you play as a child?",
        "Do you live close to your family?",
        "What kind of jobs have you worked at?",
        "What car would you like to have?",
        "Do you like coffee or Tea?", 
        "How comfortable are you with change?",
        "What do you wish you were better at?",
        "What is something you've never done but would like to try to do?",
        "What is something you've tried but would never do again?",
        "Are you a hoarder or saver?",
        "Are you usually early, late, or on time?",
        "What is your best skill/talent?",
        "What do you like least about living in your city/town?",
        "What do you like most about living in your city/town?",
        "Do you usually break the rules or follow them?",
        "Are you a leader or a follower?",
        "Do you wake up by yourself, to an alarm, music, or have someone else wake you up?",
        "Are you more of a spontaneous or structured person?",
        "How would your friends and family describe you?",
        "How have your goals changed as you've gotten older?",
        "Describe your dream house to me",
        "What's the best thing to do on a hot summer day?",
        "What's the best thing to do on a cold winter day?",
        "What is your favorite smell?",
        "Do you prefer to receive money or an actual gift?",
        "What is your favorite day of the year?",
        "Are you messy or organized?",
        "Are you a heavy or a light sleeper?",
        "Do you smile for pictures?",
        "Do you wear slippers at home?",
        "Do you remember the last dream you had?",
        "How have you changed since you were a kid?",
        "Do you untie your sneakers before taking them off?"
    ]
}

// Creates if not exists and puts them into the shop
config.shopDefaults = {
    upgrade: [
        {
            id: "SENIOR_WORKER",
            displayName: "Senior Worker",
            XPMultiplier: 0,
            starMultiplier: 0.02,
            price: 5000
        },
        {
            id: "WORK_SUPERVISOR",
            displayName: "Work Supervisor",
            XPMultiplier: 0,
            starMultiplier: 0.04,
            price: 10000,
            requiredLevel: 20
        },
        {
            id: "WORK_MANAGER",
            displayName: "Work Manager",
            XPMultiplier: 0,
            starMultiplier: 0.06,
            price: 20000,
            requiredLevel: 40
        }
    ],
    role: [
        {
            id: "INTERN",
            role: "810277574495174686",
            displayName: "Intern",
            price: 5000
        },
        {
            id: "FLEX",
            role: "810277882898677801",
            displayName: "Flex",
            price: 10000
        },
        {
            id: "BIG_FLEX",
            role: "810278147849191424",
            displayName: "Big Flex",
            price: 20000
        },
        {
            id: "BUSINESSMAN",
            role: "810278373750210580",
            displayName: "Businessman",
            price: 50000
        },
        {
            id: "ASTRONAUT",
            role: "810278584592891924",
            displayName: "Astronaut",
            price: 75000
        },
        {
            id: "SPECIALIST",
            role: "810278862708670484",
            displayName: "Specialist",
            price: 125000
        },
        {
            id: "PAYLOAD_SPECIALIST",
            role: "810279059299893308",
            displayName: "Payload Specialist",
            price: 500000
        },
        {
            id: "COMMAND_PILOT",
            role: "810279411261767801",
            displayName: "Command Pilot",
            price: 750000
        },
        {
            id: "MILLIONAIRE",
            role: "810279590425526292",
            displayName: "Millionaire",
            price: 1000000
        },
        {
            id: "SENIOR_WORKER",
            role: "810275802893647872",
            displayName: "Senior Worker",
            price: 5000
        },
        {
            id: "WORK_SUPERVISOR",
            role: "810276675631710249",
            displayName: "Work Supervisor",
            price: 10000
        },
        {
            id: "WORK_MANAGER",
            role: "810276955789983785",
            displayName: "Work Manager",
            price: 20000
        },

        {
            id: "EMOJI_MOON",
            role: "880631049930043422",
            displayName: "🌙 (moon)",
            price: 150
        },
        {
            id: "EMOJI_ROCKET",
            role: "880631476885000202",
            displayName: "🚀 (rocket)",
            price: 250
        },
        {
            id: "EMOJI_UFO",
            role: "880631731374395413",
            displayName: "🛸 (ufo)",
            price: 460
        },
        {
            id: "EMOJI_SATELLITE",
            role: "889868171153145856",
            displayName: "📡 (satellite)",
            price: 1240
        },
        {
            id: "EMOJI_COMET",
            role: "880632042377863188",
            displayName: "☄️ (comet)",
            price: 3350
        },
        {
            id: "EMOJI_GALAXY",
            role: "880632346360053762",
            displayName: "🌌 (galaxy)",
            price: 5000
        }
    ]
}


module.exports = config;
