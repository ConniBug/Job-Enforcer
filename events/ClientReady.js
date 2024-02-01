const client = require("../modules/client");
const {Events, PermissionFlagsBits} = require("discord.js");

client.on(Events.ClientReady, async () => {
    console.log(`Bot is ready! ${client.user.tag}`);

    let link = client.generateInvite({
        scopes: ['bot', 'applications.commands'],
    });
    console.log(`Generated application invite link: ${link}`);

    link = client.generateInvite({
        permissions: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageGuild,
            PermissionFlagsBits.MentionEveryone,
        ],
        scopes: ['bot'],
    });
    console.log(`Generated bot invite link: ${link}`);
});