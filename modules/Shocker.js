const shockPath = `https://do.pishock.com/api/apioperate/`;

const client = require('../modules/client');

function handleRandom(input) {
    let vars = input.split('-');
    let min = parseInt(vars[0]);
    let max = parseInt(vars[1]);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// hashmap
let shockJobs = new Map();

module.exports.newShockJob = function ({intensity, duration, notificationChannelID, timeBetweenShocks, repeats}) {
    let intervalId = crypto.randomUUID();
    let cnt = 0;
    let interval = setInterval(async () => {
        ++cnt;
        if(cnt > repeats) {
            clearInterval(interval);
            return;
        }
        await module.exports.shock({
            intensity,
            duration,
            notificationChannelID,
            intervalId
        });
    }, timeBetweenShocks);

    shockJobs.set(intervalId, interval);
    return intervalId;
}

module.exports.stopShockJob = function (intervalId) {
    if(intervalId === "all") {
        shockJobs.forEach((value, key) => {
            clearInterval(value);
            shockJobs.delete(key);
        });
        return true;
    }
    clearInterval(shockJobs.get(intervalId));
    return shockJobs.delete(intervalId);
}

module.exports.shock = async function ({intensity, duration, notificationChannelID, intervalId }) {
    if(typeof intensity === "string" && intensity.includes('-')) {
        intensity = handleRandom(intensity);
    }
    intensity = parseInt(intensity);

    if(typeof intensity === "string" && duration.includes('-')) {
        duration = handleRandom(duration);
    } duration = parseInt(duration);

    if(notificationChannelID) {
        let channel = await client.channels.fetch(notificationChannelID);
        let header = intervalId ? `[${intervalId}] - ` : '';
        channel.send(`${header}Shock ${intensity}% for ${duration}ms.`);
    }

    const response = await fetch(shockPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "Username": process.env.SHOCK_API_USERNAME,
            "Name": "job-enforcer",
            "Code": process.env.SHOCK_API_CODE,
            "Intensity": `${intensity}`,
            "Duration": `${duration}`,
            "Apikey": process.env.SHOCK_API_KEY,

            "Op": "0",
        })
    });
    if(!response.ok) {
        console.log(response.status);
        console.log(response.statusText);
        return false;
    }
    const data = await response.text();
    if(data !== 'Operation Attempted.') {
        console.log(data);
    }
    return true;
}