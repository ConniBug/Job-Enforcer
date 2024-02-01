const { get_maid_by_manager } = require('../../modules/Storage');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { newJob } = require('../../JobHandler');

const data = new SlashCommandBuilder()
    .setName('task')
    .setDescription('Creates a task!')
    .addStringOption(option =>
        option
            .setName('title')
            .setDescription('Title of the task.')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('shock-intensity')
            .setDescription('Intensity of the shock as a percentage (Max 100%).')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('shock-duration')
            .setDescription('Duration of the shock in milliseconds.')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('desc')
            .setDescription('Description of the task.')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('task-deadline')
            .setDescription('Duration of the task in mins. (Default: `-1` for unlimited)')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('start-method')
            .setDescription('When the task should start. (Default: `On Acknowledgement`)')
            .setRequired(false)
            .setChoices(
                { name: 'On Creation', value: 'onCreation' },
                { name: 'On Acknowledgement', value: 'onAck' },
            )
    )
    .addStringOption(option =>
        option
            .setName('warning')
            .setDescription('Warning method before shocking. (Default: `lightShock`)')
            .setRequired(false)
            .setChoices(
                { name: 'None', value: 'none' },
                { name: 'Light Shock', value: 'lightShock' },
            )
    )
    .addStringOption(option =>
        option
            .setName('confirmation-type')
            .setDescription('When the task should start. (Default: `maidConfirmed`)')
            .setRequired(false)
            .setChoices(
                { name: 'Maid Confirmation', value: 'maidConfirmed' },
                { name: 'Manager Confirmation', value: 'managerConfirmed' },
                { name: 'Proof Confirmation', value: 'imageConfirmed' },
            )
    )
    .addStringOption(option =>
        option
            .setName('notification-frequency')
            .setDescription('Time between job reminders in minutes. (Default 30mins)')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('reminder')
            .setDescription('Time between reminder shocks in minutes. (Default 10mins)')
            .setRequired(false)
    )
;

async function execute(interaction) {
    let maidId = get_maid_by_manager(interaction.user.id);
    if(!maidId) {
        await interaction.reply('You do not have a maid.');
        return;
    }
    let task = {
        title: interaction.options.getString('title'),
        description: interaction.options.getString('desc') || '',
        deadline: interaction.options.getString('task-deadline') || '-1',
        startMethod: interaction.options.getString('start-method') || 'onAck',
        warning: interaction.options.getString('warning') || 'lightShock',
        confirmationType: interaction.options.getString('confirmation-type') || 'maidConfirmed',
        shockIntensity: interaction.options.getString('shock-intensity'),
        shockDuration: interaction.options.getString('shock-duration'),
        notificationFrequency: interaction.options.getString('notification-frequency') || '30',
        reminder: interaction.options.getString('reminder') || '10',
        maidId,
    }
    task.status = task.startMethod === 'onCreation' ? 'active' : 'pendingAcknowledgement';

    if(task.deadline === '-1')
        task.deadline = 'infinte';

    let message = `Task created with the following parameters:\n`;
    message += `Title: ${task.title}\n`;
    message += `Description: ${task.description}\n`;
    message += `Task deadline: ${task.deadline}\n`;
    message += `Start Method: ${task.startMethod}\n`;
    message += `Warning: ${task.warning}\n`;
    message += `Confirmation Type: ${task.confirmationType}\n`;
    message += `Shock Intensity: ${task.shockIntensity}\n`;
    message += `Shock Duration: ${task.shockDuration}\n`;
    message += `Notification Frequency: ${task.notificationFrequency}\n`;
    message += `Reminder: ${task.reminder}\n`;
    message += `Maid: ${maidId.maidId}\n`;
    await interaction.reply(message);

    newJob(task);
}

module.exports = { data, execute };
