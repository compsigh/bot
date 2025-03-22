import { ChatInputCommandInteraction, GuildMember, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { isBanned } from '../mongodb.js';

export const WORKINGON_API_URL = 'https://compsigh.club/api/marquee';

const workingonCommand = {
    data: new SlashCommandBuilder()
        .setName('workingon')
        .setDescription('Sets the project that you are working on to be displayed on the compsigh website\'s community page')
        .addStringOption(option =>
            option.setName('project')
                .setDescription('Your project\'s name')
                .setRequired(true)
                .setMaxLength(20)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // Get data from the interaction
        const userid = interaction.user.id;
        const usernick = interaction.member instanceof GuildMember && interaction.member.nickname
            ? (interaction.member.nickname)
            : interaction.user.displayName;
        const projectName = interaction.options.getString('project');

        if (!projectName) {
            await interaction.editReply(`Something went wrong`);
            console.error(`Project name is null. \`/workingon\` userid:${userid} usernick:${usernick}`);
            return;
        }

        // Make sure the user isn't banned
        if (await isBanned(userid)) {
            await interaction.editReply('Sorry, you are banned from using the `/workingon` command.');
            return;
        }

        // Send data to the API to update the user's project
        const response = await fetch(WORKINGON_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MARQUEE_API_KEY} `
            },
            body: JSON.stringify({
                id: userid,
                nickname: usernick,
                project: projectName,
            })
        });

        // Handle HTTP errors
        if (!response.ok) {
            await interaction.editReply(`Something went wrong`);
            console.error(`HTTP error! ${response.status}: ${response.statusText} `);
            return;
        }

        // Success message
        await interaction.editReply(`${usernick} is now working on ${projectName}!`);
    },
};

export default workingonCommand;