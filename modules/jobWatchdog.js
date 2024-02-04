const {jobs, get_manager_by_maid, saveJobsToDisk} = require("./Storage");
const client = require("./client");
const { shock } = require("./Shocker");

async function failedJob(jobId) {
    let job = jobs.get(jobId);
    if(!job) {
        return;
    }
    console.log(`Job '${job.title}' has failed.`);

    let guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`);
    if(!guild)
        return;
    let manager = await guild.members.cache.get(`${get_manager_by_maid(job.maidId)}`);
    if(!manager)
        return;

    job.status = 'done';

    saveJobsToDisk();

    let maid = await guild.members.cache.get(`${job.maidId}`);

    manager.send(`Job '${job.title}' has failed.`);
    maid.send(`Job '${job.title}' has failed.`);


    if(job.warning === 'lightShock') {
        for(let i = 0; i < 10; ++i) {
            await shock({
                intensity: 2.5,
                duration: 100,
                notificationChannelID: process.env.NOTIFICATION_CHANNEL_ID
            });
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    }
    await new Promise(resolve => setTimeout(resolve, 5000));

    await shock({
        intensity: job.shockIntensity,
        duration: job.shockDuration,
        notificationChannelID: process.env.NOTIFICATION_CHANNEL_ID
    });
}

function handleJobs() {
    for (const [jobId, jobData] of jobs) {
        if(!jobData.startTimestamp) {
            continue;
        }
        if(jobData.status === 'done')
            continue;
        if(jobData.deadline === 'infinite')
            continue;

        console.log(jobData.deadline);

        let unit = jobData.deadline.substr(jobData.deadline.length - 1, 1);
        let deadlineMs = jobData.deadline.substr(0, jobData.deadline.length - 1);

        switch (unit) {
            case 'ms':
                deadlineMs = parseInt(deadlineMs);
                break;
            case 's':
                deadlineMs = parseInt(deadlineMs) * 1000;
                break;
            case 'm':
                deadlineMs = parseInt(deadlineMs) * 1000 * 60;
                break;
            case 'h':
                deadlineMs = parseInt(deadlineMs) * 1000 * 60 * 60;
                break;
            case 'd':
                deadlineMs = parseInt(deadlineMs) * 1000 * 60 * 60 * 24;
                break;
        }
        let timeLeft = deadlineMs - (Date.now() - jobData.startTimestamp);
        timeLeft += jobData.extensionMs || 0;

        console.log(`${timeLeft / 1000}s with ${jobData.extensionMs / 1000}s extension`);

        if(timeLeft <= 0) {
            failedJob(jobId)
        }
    }
}
setInterval(handleJobs, 1000);
handleJobs();