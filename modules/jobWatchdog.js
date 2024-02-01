const {jobs, get_manager_by_maid, saveJobsToDisk} = require("./Storage");
const client = require("./client");

async function failedJob(jobId) {
    let job = jobs.get(jobId);
    if(!job) {
        return;
    }

    let guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`);
    if(!guild)
        return;
    let manager = await guild.members.cache.get(`${get_manager_by_maid(job.maidId)}`);
    if(!manager)
        return;

    let maid = await guild.members.cache.get(`${job.maidId}`);

    // manager.send(`Job '${job.title}' has failed.`);
    // maid.send(`Job '${job.title}' has failed.`);

    // job.status = 'done';
    await saveJobsToDisk();
}

function handleJobs() {
    for (const [jobId, jobData] of jobs) {
        if(!jobData.startTimestamp)
            console.log('Job not started.');
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
        console.log(`${timeLeft}ms`);

        if(timeLeft <= 0) {
            failedJob(jobId)
        }
    }
}
setInterval(handleJobs, 10000);
handleJobs();