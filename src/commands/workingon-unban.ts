import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { addBan, isBanned, removeBan } from '../mongodb.js';

const workingonUnbanCommand = {
    data: new SlashCommandBuilder()
        .setName('workingon-unban')
        .setDescription('Unbans the user from using the /workingon command.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who you want to unban')
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

        // Add to database
        if (await isBanned(bannedUserId)) {
            removeBan(bannedUserId);
        } else {
            await interaction.editReply(`<@${bannedUserId}> isn't banned.`);
            return;
        }

        // Success message
        await interaction.editReply(`Unbanned <@${bannedUserId}> from using \`/workingon\``);
    },
};

export default workingonUnbanCommand;