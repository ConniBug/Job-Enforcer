const client = require("../modules/client");
const {Events} = require("discord.js");
const {handleImageConfirmation} = require("../JobHandler");

client.on(Events.MessageCreate, async message => {
    const guildId = message.guildId;

    let guild = await client.guilds.cache.get(guildId);
    if(guild)
        await guild.members.fetch();

    if (message.author.bot) return;

    if (message.attachments.size > 0) {
        return handleImageConfirmation(message);
    }
})