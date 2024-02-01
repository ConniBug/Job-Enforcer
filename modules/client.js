if(!process.env.DISCORD_TOKEN)
    throw new Error('No discord token provided!');

const {Client, GatewayIntentBits, Partials} = require("discord.js");
const client = new Client({
    fetchAllMembers: true,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;