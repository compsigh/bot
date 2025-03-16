import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';

const API_URL = 'https://compsigh.club/api/marquee';

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
        await interaction.deferReply();

        // Get data from the interaction
        const userid = interaction.user.id;
        const usernick = interaction.member instanceof GuildMember && interaction.member.nickname
            ? (interaction.member.nickname)
            : interaction.user.username;
        const projectName = interaction.options.getString('project');

        // Send data to the API to update the user's project
        const response = await fetch(API_URL, {
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