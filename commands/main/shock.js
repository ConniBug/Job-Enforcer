const Shock = require('../../modules/Shocker');

const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('shock')
    .setDescription('Shocks!')
    .addStringOption(option =>
        option
            .setName('intensity')
            .setDescription('Strength of the shock as a percentage (Max 100%).')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('duration')
            .setDescription('Duration of the shock in milliseconds.')
            .setRequired(false)
    )
    .addIntegerOption(option =>
        option
            .setName('repeats')
            .setDescription('Number of times to repeat the shock job.')
            .setRequired(false)
            .setMaxValue(9999)
            .setMinValue(1)
    )
    .addStringOption(option =>
        option
            .setName('repeats-timespan')
            .setDescription('Max time the repeats can take.')
            .setRequired(false)
    )
;

const { newShockJob } = require('../../modules/Shocker');

async function execute(interaction) {
    let intensity = interaction.options.getString('intensity');
    let duration = interaction.options.getString('duration') || '100';

    const repeats = interaction.options.getInteger('repeats');
    if(repeats) {
        const repeatsTimespan = interaction.options.getString('repeats-timespan'); // in mins
        const totalTimeFrameMs = repeatsTimespan * 60 * 1000;

        const timeBetweenShocks = totalTimeFrameMs / repeats;
        console.log(`Time between shocks: ${timeBetweenShocks}ms`);

        const shocksPerMinute = 60 * 1000 / timeBetweenShocks;
        console.log(`Shocks per minute: ${shocksPerMinute}`);


        let jobId = newShockJob({
            intensity,
            duration,
            notificationChannelID: interaction.channel.id,
            timeBetweenShocks,
        });

        await interaction.reply(`[${jobId}] - Shock ${intensity}% for ${duration}ms ${repeats} times over ${repeatsTimespan} minutes. (${shocksPerMinute} spm)`);
        return;
    }

    await interaction.reply(`Shock ${intensity}% for ${duration}ms.`);

    await Shock.shock({
        intensity,
        duration,
    });
}
module.exports = {
    data,
    execute
}