const client = require('./modules/client');

const {
    EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle
} = require("discord.js");

const {
    get_manager_by_maid,
    saveJobsToDisk,
    jobs,
} = require("./modules/Storage");

const Shocker = require("./modules/Shocker");

const pendingImageConfirmations = new Map();

async function displayJob(jobId) {
    let jobData = jobs.get(jobId);
    if(!jobData) {
        return false;
    }
    let guild = await client.guilds.cache.get(process.env.GUILD_ID);
    let maid = await guild.members.cache.get(`${jobData.maidId}`);
    if(!maid) {
        console.log('Error: Maid not found.');
        return false;
    }

    const row = new ActionRowBuilder()
    if(jobData.status !== 'done') {

        if (jobData.startTimestamp) {
            const doneButton = new ButtonBuilder()
                .setCustomId('maidDone_' + jobId)
                .setLabel('Done')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false)
            ;

            const enquiryButton = new ButtonBuilder()
                .setCustomId('maidEnquiry_' + jobId)
                .setLabel('Enquiry')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)
            ;

            row.addComponents(doneButton, enquiryButton)
        } else {
            const acknowledgeButton = new ButtonBuilder()
                .setCustomId('maidAcknowledged_' + jobId)
                .setLabel('Acknowledge')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false)
            ;

            row.addComponents(acknowledgeButton)
        }
    }

    let confirmationTypeNice;
    switch (jobData.confirmationType) {
        case 'maidConfirmed':
            confirmationTypeNice = 'Maid Confirmation';
            break;
        case 'assigneeConfirmed':
            confirmationTypeNice = 'Manager Confirmation';
            break;
    }
    let embed = {
        "type": "rich",
        "title": jobData.title,
        "description": jobData.description,
        "color": 0xea75ff,
    }
    if(jobData.status === 'done') {
        jobData.status = 'done';
        embed.color = 0x00ff00;
    } else if(jobData.status === 'active') {
        jobData.status = 'Currently Active';
    } else if(jobData.status === 'pendingAcknowledgement') {
        embed.color = 0x00ffff;
    }
    // embed.fields.push({
    //         "name": `Time limit`,
    //         "value": jobData.deadline === 'infinte mins' ? 'infinite' : jobData.deadline,
    //         "inline": true
    //     }, {
    //         "name": `Confirmation Type`,
    //         "value": confirmationTypeNice,
    //         "inline": true
    //     },
    // );
    embed.fields = [{
            "name": `Shock Params`,
            "value": ""
        }, {
            "name": `Intensity`,
            "value": jobData.shockIntensity + "%",
            "inline": true
        }, {
            "name": `Duration`,
            "value": jobData.shockDuration + "ms",
            "inline": true
        }, {
            "name": `Task deadline`,
            "value": `${jobData.deadline}`,
            "inline": false
        }, {
            "name": `Reminder`,
            "value": "\u200B"
        }, {
            "name": `Final shock warning`,
            "value": jobData.warning,
            "inline": true
        }, {
            "name": `Reminder Shock Multiplier`,
            "value": `N/A x`,
            "inline": false
        }, {
            "name": `Reminder Spacing`,
            "value": `Every 10%`,
            "inline": true
        }, {
            "name": `Status`,
            "value": jobData.status,
            "inline": false
        }
    ]

    embed = EmbedBuilder.from(embed);


    let options = {
        embeds: [embed],
    }
    if(jobData.status !== 'done') {
        options.components = [row];
    }
    const response = await maid.send(options);

    try {
        const confirmation = await response.awaitMessageComponent({dispose: true, time: 60000});
        let pressed = confirmation.customId;
        if(pressed === 'maidDoneButton') {

        } else if(pressed === 'maidEnquiryButton') {

        } else {
            console.log('Error: Unknown button pressed.');
        }
    } catch (error) {
        console.log('Error: No button pressed.');
    }

    response.edit({
        components: [],
    });

    return response;
}
module.exports.displayJob = displayJob;

// Called when a maid acknowledges a task/job and starts working on it
module.exports.handeMaidJobAcknowledged = async (jobId, interaction) => {
    const job = jobs.get(jobId);
    if(!job) {
        return await interaction.reply({
            content: `Error: No job with ID ${jobId} found.`,
            ephemeral: true
        });
    }
    let guild = await client.guilds.cache.get(process.env.GUILD_ID);

    let managerId = get_manager_by_maid(job.maidId);
    console.log(managerId);
    let manager = await guild.members.cache.get(`${get_manager_by_maid(job.maidId)}`);
    let maid = await guild.members.cache.get(`${job.maidId}`);

    await interaction.reply({
        content: `Job ${jobId} acknowledged.`,
        ephemeral: true,
    });


    manager.send(`Maid ${maid.displayName} has acknowledged job '${job.title}'.`);

    job.status = 'active';
    job.startTimestamp = Date.now();
    await saveJobsToDisk();

    displayJob(jobId);
}
// Called when the maid presses the done button on a task/job
module.exports.handleMaidDoneButton = async (jobId, interaction) => {
    const job = jobs.get(jobId);
    if(!job) {
        return await interaction.reply({
            content: `Error: No job with ID ${jobId} found.`,
            ephemeral: true
        });
    }

    let guild = await client.guilds.cache.get(process.env.GUILD_ID);
    let manager = await guild.members.cache.get(`${get_manager_by_maid(job.maidId)}`);
    let maid = await guild.members.cache.get(`${job.maidId}`);

    if(job.confirmationType === 'maidConfirmed') {
        await interaction.reply({
            content: `You have completed job '${job.title}'.`,
            ephemeral: true
        });

        manager.send(`Maid ${maid.displayName} has completed job '${job.title}'.`);

        job.status = 'done';
        await saveJobsToDisk();

    } else if(job.confirmationType === 'imageConfirmed') {
        await interaction.reply({
            content: `Please send an image of the completed job '${job.title}' within the next 5 Minutes.`,
            ephemeral: true
        });

        pendingImageConfirmations.set(maid.id, {
            jobId: jobId,
            timestamp: Date.now(),
        });
    } else {
        await interaction.reply({
            content: `Unknown confirmation type '${job.confirmationType}' for job '${job.title}'.`,
            ephemeral: true
        });
    }
}
// Called when the maid presses the enquiry button on a task/job
module.exports.handleMaidEnquiryButton = async (jobId, interaction) => {
    const modal = new ModalBuilder()
        .setCustomId('jobEnquiryModal_' + jobId)
        .setTitle('Task Enquiry');

    const issueTextInput = new TextInputBuilder()
        .setCustomId('issueTextInput')
        .setLabel("What's the issue?")
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(issueTextInput);
    modal.addComponents(firstActionRow);

    return interaction.showModal(modal);
}



// Called when a maid asks a question about a task/job
module.exports.handeModelMaidEnquiry = async (jobId, interaction) => {
    const job = jobs.get(jobId);
    if(!job) {
        return await interaction.reply({
            content: `Error: No job with ID ${jobId} found.`,
            ephemeral: true
        });
    }
    let guild = await client.guilds.cache.get(process.env.GUILD_ID);

    let manager = await guild.members.cache.get(`${get_manager_by_maid(interaction.user.id)}`);
    if(!manager) {
        console.log(`Error: Manager not found.`);
        return;
    }
    let maid = await guild.members.cache.get(`${job.maidId}`);


    const issueText = interaction.fields.getTextInputValue('issueTextInput');

    console.log(issueText);
    manager.send(`Maid ${maid.displayName} has an issue with job '${job.title}': ${issueText}`);

    await interaction.reply({
        content: `Manager ${manager.displayName} has been notified.\n Issue Text: ${issueText}`,
        ephemeral: true,
    });
}

// Called when a maid submits an image for a task/job
module.exports.handleImageConfirmation = async (message) => {
    let maidId = message.author.id;
    let pendingImageConfirmation = pendingImageConfirmations.get(maidId);
    if(!pendingImageConfirmation) {
        return;
    }
    let jobId = pendingImageConfirmation.jobId;
    let job = jobs.get(jobId);
    if(!job) {
        return;
    }

    let guild = await client.guilds.cache.get(process.env.GUILD_ID);
    let managerId = get_manager_by_maid(job.maidId);
    // console.log(managerId);
    // console.log(guild.members);
    let manager = await guild.members.cache.get(`${managerId}`);
    if(!manager) {
        console.log('Error: Manager not found.');
        await guild.members.fetch();
        await message.reply('Error: Manager not found.');
        return;
    }
    await manager.fetch();

    let maid = await guild.members.cache.get(`${job.maidId}`);

    // console.log(message.attachments.first().contentType);
    if(!message.attachments.first().contentType && !message.attachments.first().contentType.includes('image')) {
        maid.send(`Error: Image received for job '${job.title}' was not an image, please try again.`);
        return;
    }
    maid.send(`Image received for job '${job.title}', please wait for approval`);
    manager.send(`Maid ${maid.displayName} has submitted an image for job '${job.title}'.`);


    const embed = new EmbedBuilder()
        .setTitle('Image Confirmation')
        .setDescription(`Maid ${maid.displayName} has submitted an image for job '${job.title}'.`)
        .setImage(message.attachments.first().url)
        .setColor(0x00ff00)
    ;

    const approvalButton = new ButtonBuilder()
        .setCustomId('imageApproval_' + jobId)
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success)
        .setDisabled(false)
    ;

    const rejectionButton = new ButtonBuilder()
        .setCustomId('imageDenial_' + jobId)
        .setLabel('Reject')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false)
    ;

    const row = new ActionRowBuilder().addComponents(approvalButton, rejectionButton);

    manager.send({
        embeds: [embed],
        components: [row]
    });

    job.status = 'pendingReview';
    await saveJobsToDisk();

    pendingImageConfirmations.delete(maidId);
}


// Called when a manager approves an image for a task/job
module.exports.handleImageApproval = async (jobId, interaction) => {
    const job = jobs.get(jobId);
    if(!job) {
        return await interaction.reply({
            content: `Error: No job with ID ${jobId} found.`,
            ephemeral: true
        });
    }
    let guild = await client.guilds.cache.get(process.env.GUILD_ID);

    let manager = await guild.members.cache.get(`${get_manager_by_maid(job.maidId)}`);
    let maid = await guild.members.cache.get(`${job.maidId}`);

    await interaction.reply({
        content: `You have approved ${maid.displayName}'s proof for job ${job.title}.`,
        ephemeral: true,
    });

    maid.send(`Manager ${manager.displayName} has approved job your proof for '${job.title}'.`);

    job.status = 'done';
    await saveJobsToDisk();

    displayJob(jobId);
}
// Called when a manager denies an image for a task/job
module.exports.handleImageDenial = async (jobId, interaction) => {
    const job = jobs.get(jobId);
    if(!job) {
        return await interaction.reply({
            content: `Error: No job with ID ${jobId} found.`,
            ephemeral: true
        });
    }
    let guild = await client.guilds.cache.get(process.env.GUILD_ID);

    let manager = await guild.members.cache.get(`${get_manager_by_maid(job.maidId)}`);
    let maid = await guild.members.cache.get(`${job.maidId}`);
    if(!maid || !manager) {
        console.log('Error: Maid or Manager not found.');
        return;
    }

    await interaction.reply({
        content: `Job ${jobId} denied.`,
        ephemeral: true,
    });

    maid.send(`Manager ${manager.displayName} has denied provided proof '${job.title}'.`);

    displayJob(jobId);

    // TODO: Add warning logic etc

    job.status = 'active';
    await saveJobsToDisk();

    await Shocker.shock({
        intensity: job.shockIntensity,
        duration: job.shockDuration,
    });
}

async function newJob(jobData) {
    let jobId = crypto.randomUUID();
    jobData.startTimestamp = jobData.startMethod !== 'onAck' ? Date.now() : null;
    jobs.set(jobId, jobData);

    displayJob(jobId);

    await saveJobsToDisk();

    return jobId;
}

module.exports.newJob = newJob;

require('./modules/jobWatchdog')