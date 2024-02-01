const { SlashCommandBuilder } = require('@discordjs/builders');
const { displayJob, jobExists } = require('../../JobHandler');

const data = new SlashCommandBuilder()
    .setName('show-job')
    .setDescription('Shows a job!')
    .addStringOption(option =>
        option
            .setName('job-id')
            .setDescription('ID of the job.')
            .setRequired(true)
    )
;

async function execute(interaction) {
    const jobId = interaction.options.getString('job-id');
    if(!jobExists(jobId))
        return await interaction.reply(`Job with ID ${jobId} does not exist!`);

    displayJob(jobId);

    return await interaction.reply(`Sent job info for ${jobId} to the maid.`);
}

module.exports = { data, execute };
