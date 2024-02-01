const { SlashCommandBuilder } = require('@discordjs/builders');
const {getJobs} = require("../../JobHandler");

const data = new SlashCommandBuilder()
    .setName('jobs')
    .setDescription('Lists all of your jobs!')
;

async function execute(interaction) {
    let jobs = getJobs(interaction.user.id);
    if(jobs.length === 0) {
        return await interaction.reply('You have no jobs!');
    }
    let jobList = jobs.map(job => {
        return `**ID:** ${job.jobId}\n**Title:** ${job.title}\n**Status:** ${job.status}\n\n`;
    });

    await interaction.reply(jobList.join('\n'));
}

module.exports = { data, execute };
