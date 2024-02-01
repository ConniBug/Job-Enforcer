// JSON Storage
let fs = require('fs');

const jobsData = require('../jobs.json');
const jobs = new Map();
for (const job of jobsData) {
    let jobId = job.jobId;
    delete job.jobId;
    jobs.set(jobId, job);
}

// fs.copyFile('../jobs.json', '../jobs.json.bak', (err) => {
//     if(err) {
//         console.log(err);
//     }
// });

module.exports.saveJobsToDisk = async () => {
    let jobsArray = [];
    for (const [jobId, jobData] of jobs) {
        jobData.jobId = jobId;
        jobsArray.push(jobData);
    }
    const fs = require('fs');
    fs.writeFile('./jobs.json', JSON.stringify(jobsArray), (err) => {
        if(err) {
            console.log(err);
        }
    });
}
module.exports.jobs = jobs;


let maids = require('../maids.json');
module.exports.new_maid = function (maidId, managerId) {
    const exists = maids.find(maid => maid.managerId === managerId && maid.maidId === maidId);
    if(exists) {
        return false;
    }
    maids.push({
        managerId,
        maidId
    });

    // save to file
    fs.writeFile('./maids.json', JSON.stringify(maids), (err) => {
        if(err)
            console.log(err);

    });

    return true;
}
module.exports.get_maid_by_manager = function (managerId) {
    let found = maids.find(manager => manager.managerId === managerId);
    return found ? found.maidId : false;
}
module.exports.get_manager_by_maid = function (maidId) {
    let found = maids.find(maid => maid.maidId === maidId);
    return found ? found.managerId : false;
}

