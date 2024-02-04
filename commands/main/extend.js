const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('extend')
    .setDescription('Extends a jobs deadline!')
    .addStringOption(option =>
        option
            .setName('job-id')
            .setDescription('ID of the job.')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('time')
            .setDescription('Time to extend the job by. (Specify units: 1s 1m 1h 1d. Default: 1h)')
            .setRequired(true)
    )
;

const { jobs } = require('../../modules/Storage');

async function execute(interaction) {
    const jobId = interaction.options.getString('job-id');
    if(!jobs.has(jobId))
        return await interaction.reply(`Job with ID ${jobId} does not exist!`);

    const job = jobs.get(jobId);
    if(job.maidId === interaction.user.id) {
        return await interaction.reply(`The maid does not have permission to extend job ${jobId}`);
    }

    const timeStr = interaction.options.getString('time');

    let units = ['s', 'm', 'h', 'd'];
    if(units.indexOf(timeStr.substr(timeStr.length - 1, 1)) === -1) {
        await interaction.reply('Invalid deadline unit.');
        return;
    }

    let unit = timeStr.substr(timeStr.length - 1, 1);
    let extensionMs = timeStr.substr(0, timeStr.length - 1);

    switch (unit) {
        case 'ms':
            extensionMs = parseInt(extensionMs);
            break;
        case 's':
            extensionMs = parseInt(extensionMs) * 1000;
            break;
        case 'm':
            extensionMs = parseInt(extensionMs) * 1000 * 60;
            break;
        case 'h':
            extensionMs = parseInt(extensionMs) * 1000 * 60 * 60;
            break;
        case 'd':
            extensionMs = parseInt(extensionMs) * 1000 * 60 * 60 * 24;
            break;
    }

    job.extensionMs = extensionMs;

    return await interaction.reply(`Extended job ${jobId} by ${extensionMs}ms`);
}

module.exports = { data, execute };
