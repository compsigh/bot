import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

// Number of weeks to show in the contribution graph
const NUM_SELECTED_WEEKS = 10;

/**
 * Fetches contribution data for a given GitHub username using the GitHub GraphQL API.
 * @param githubUsername - The GitHub username to fetch contributions for.
 * @returns The API response.
 */
async function getContributionData(githubUsername: string) {
    const headers = {
        'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
    };

    // Relevant Docs: https://docs.github.com/en/graphql/guides/forming-calls-with-graphql#about-queries

    const body = {
        query: `query {
            user(login: "${githubUsername}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                    }
                  }
                }
              }
            }
        }`,
    };

    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers,
    });

    return response;
}

/**
 * Maps a contribution count to a corresponding emoji based on frequency.
 * @param contributionCount - The number of contributions on a given day.
 * @returns The emoji representing the contribution frequency.
 */
function getEmojiByFrequency(contributionCount: number): string {
    if (contributionCount === 0) return '<:c0:1363011305593897074>';
    if (contributionCount < 5) return '<:c1:1363011326275747991>';
    if (contributionCount < 10) return '<:c2:1363011342620954644>';
    if (contributionCount < 20) return '<:c3:1363011360337825895>';
    if (contributionCount < 30) return '<:c4:1363011377685598229>';
    return '<:c5:1363011377685598229>';
}

/**
 * Generates a contribution graph for a given GitHub username.
 * @param username - The GitHub username to generate the graph for.
 * @returns A string representation of the contribution graph or null if data is unavailable.
 */
async function makeContributionGraph(username: string): Promise<string | null> {
    const response = await getContributionData(username);
    if (!response.ok) {
        throw new Error(`Error fetching contributions: ${response.statusText}`);
    }

    const data = (await response.json()).data;
    if (!data || !data.user || !data.user.contributionsCollection) {
        return null;
    }

    // Relevant Docs: https://docs.github.com/en/graphql/reference/objects#contributioncalendar

    const contributionCalendar = data.user.contributionsCollection.contributionCalendar;
    const contributionCalendarWeeks = contributionCalendar.weeks;
    const selectedWeeks = contributionCalendarWeeks.slice(-NUM_SELECTED_WEEKS);     // Select the last NUM_SELECTED_WEEKS weeks
    let contribGraph = '';

    // Build the graph using emojis
    // Each row represents a day of the week (Sunday to Saturday), each column represents a week
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        for (const week of selectedWeeks) {
            if (dayOfWeek >= week.contributionDays.length)
                break;   // finish if the week doesn't have enough days (for example, if the week starts on Sunday and current day is Tuesday, it won't have 7 days)
            contribGraph += getEmojiByFrequency(week.contributionDays[dayOfWeek].contributionCount);
        }
        contribGraph += '\n';
    }

    return `${username}: ${contributionCalendar.totalContributions} contributions this year\n${contribGraph}`;
}

const contribsCommand = {
    data: new SlashCommandBuilder()
        .setName('contribs')
        .setDescription('Replies with your GitHub contribution graph!')
        .addStringOption(option =>
            option.setName('github_username')
                .setDescription('Your GitHub username, without the @')
                .setRequired(true)
                .setMaxLength(39)
        ),

    /**
     * Executes the /contribs command.
     * @param interaction - The command interaction object.
     */
    async execute(interaction: ChatInputCommandInteraction) {
        const githubUsername = interaction.options.getString('github_username');
        if (!githubUsername) {
            await interaction.reply('Please provide a GitHub username.');
            return;
        }

        try {
            const contributionGraph = await makeContributionGraph(githubUsername);
            if (!contributionGraph) {
                await interaction.reply({ content: `Couldn't find GitHub account "${githubUsername}", please double-check the username.`, flags: MessageFlags.Ephemeral });
                return;
            }

            await interaction.reply({ content: contributionGraph });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while fetching the contribution graph. Please try again later.', flags: MessageFlags.Ephemeral });
        }
    },
};

export default contribsCommand;