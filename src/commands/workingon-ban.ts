import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { addBannedUser } from '../mongodb.js';

const workingonBanCommand = {
    data: new SlashCommandBuilder()
        .setName('workingon-ban')
        .setDescription('Bans the user from using the /workingon command.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who you want to ban')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        // Get data from the interaction
        const bannedUser = interaction.options.getUser('user');
        if (!bannedUser) {
            await interaction.editReply('User does not exist.');
            return;
        }
        const bannedUserId = bannedUser.id;
        const bannedByUserId = interaction.user.id;

        // Add to database
        try {
            addBannedUser(bannedUserId, bannedByUserId);
        } catch (error) {
            await interaction.editReply(`Something went wrong`);
            console.error(error);
            return;
        }

        // Success message
        await interaction.editReply(`Banned <@${bannedUserId}> from using \`/workingon\``);
    },
};

export default workingonBanCommand;