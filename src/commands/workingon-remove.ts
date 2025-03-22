import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { WORKINGON_API_URL } from './workingon.js';

const workingonRemoveCommand = {
    data: new SlashCommandBuilder()
        .setName('workingon-remove')
        .setDescription('Removes the /workingon entry made by the user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who made the entry you want to remove.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        // Get data from the interaction
        const user = interaction.options.getUser('user');
        if (!user) {
            await interaction.editReply(`Something went wrong`);
            console.error(`User is null. \`/workingon-remove\``);
            return;
        }
        const userId = user.id;

        // Send data to the API to remove the user's project
        const response = await fetch(WORKINGON_API_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MARQUEE_API_KEY} `
            },
            body: JSON.stringify({
                id: userId
            })
        });

        // Handle HTTP errors
        if (!response.ok) {
            await interaction.editReply(`Something went wrong`);
            console.error(`HTTP error! ${response.status}: ${response.statusText} `);
            return;
        }

        // Interpret the response
        const responseData = await response.json();
        const numDeleted: number = responseData.count;

        // Success message
        if (numDeleted === 0) {
            await interaction.editReply(`No entries found by <@${userId}>.`);
        } else {
            await interaction.editReply(`Removed entry by <@${userId}>.`);
        }
    },
};

export default workingonRemoveCommand;