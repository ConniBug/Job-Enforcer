const client = require("../modules/client");
const {Events} = require("discord.js");
const {
    handeModelMaidEnquiry,
    handleMaidDoneButton,
    handleMaidEnquiryButton,
    handeMaidJobAcknowledged,
    handleImageApproval,
    handleImageDenial
} = require("../JobHandler");

async function handleCommand(interaction) {
    console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
    console.log(`Command: ${interaction.commandName}`);

    const command = client.commands.get(interaction.commandName);
    if (!command)
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    try {
        command.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isModalSubmit()) {
        console.log('Modal submit');
        console.log(interaction.customId);

        let split = interaction.customId.split('_');
        let modelId = split[0];
        let jobId = split[1];

        if(modelId === 'jobEnquiryModal') {
            return handeModelMaidEnquiry(jobId, interaction);
        }
    }

    if (interaction.isCommand())
        return handleCommand(interaction);

    if (interaction.isButton()) {
        let split = interaction.customId.split('_');
        let buttonId = split[0];
        let jobId = split[1];

        if(buttonId === 'maidDone') {
            return handleMaidDoneButton(jobId, interaction);
        } else if (buttonId === 'maidEnquiry') {
            return handleMaidEnquiryButton(jobId, interaction);
        } else if (buttonId === 'maidAcknowledged') {
            return handeMaidJobAcknowledged(jobId, interaction);
        } else if (buttonId === 'imageApproval') {
            return handleImageApproval(jobId, interaction);
        } else if (buttonId === 'imageDenial') {
            return handleImageDenial(jobId, interaction);
        } else {
            console.log('Error: Unknown button pressed. ' + interaction.customId);
        }
    }
});
