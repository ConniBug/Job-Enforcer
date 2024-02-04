const { SlashCommandBuilder } = require('@discordjs/builders');
const { jobs} = require("../../modules/Storage");

const data = new SlashCommandBuilder()
    .setName('jobs')
    .setDescription('Lists all of your jobs!')
;

async function execute(interaction) {
    let maidJobs = [];
    for (const [jobId, jobData] of jobs) {
        jobData.jobId = jobId;
        if(jobData.maidId === interaction.user.id) {
            maidJobs.push(jobData);
        }
    }

    if(maidJobs.length === 0) {
        return await interaction.reply('You have no jobs!');
    }

    let jobList = maidJobs.map(job => {
        return `**ID:** ${job.jobId}\n**Title:** ${job.title}\n**Status:** ${job.status}\n\n`;
    });

    await interaction.reply(jobList.join('\n'));
}

module.exports = { data, execute };
