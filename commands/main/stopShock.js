const { SlashCommandBuilder } = require('@discordjs/builders');
const { stopShockJob } = require('../../modules/Shocker');

const data = new SlashCommandBuilder()
    .setName('stop-shock')
    .setDescription('Stops a shock job!')
    .addStringOption(option =>
        option
            .setName('interval-id')
            .setDescription('Interval ID of the shock job.')
            .setRequired(true)
    )
;

async function execute(interaction) {
    let intervalId = interaction.options.getString('interval-id');
    if(intervalId === "all" || intervalId === "*") {
        intervalId = "all";
    }

    if(!stopShockJob(intervalId)) {
        return await interaction.reply(`No shock job with ID ${intervalId} found.`);
    }

    await interaction.reply(`Shock job with ID ${intervalId} stopped.`);
}

module.exports = { data, execute };
