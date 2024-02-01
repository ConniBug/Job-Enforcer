const { SlashCommandBuilder } = require('@discordjs/builders');
const { new_maid } = require('../../modules/Storage');

const data = new SlashCommandBuilder()
    .setName('setmaid')
    .setDescription('Sets the maid!')
    .addUserOption(option =>
        option
            .setName('maid')
            .setDescription('The maid to set.')
            .setRequired(true)
    )
    .addUserOption(option =>
        option
            .setName('manager')
            .setDescription('The manager to set.')
            .setRequired(false)
    )
;

async function execute(interaction) {
    const manager =
        interaction.options.getUser('manager') || interaction.user;
    const maid =
        interaction.options.getUser('maid');

    if(!new_maid(maid.id, manager.id))
        return await interaction.reply(`${maid.displayName} is already a maid for ${manager.displayName}.`);

    await interaction.reply(`Maid for ${manager.displayName} set to ${maid.displayName}.`);

    console.log(manager)

    await manager.send(`You have been set as the 'manager' for ${maid.displayName}.`);
    await maid.send(`You have been set as the maid for ${manager.displayName}.`);
}

module.exports = { data, execute };