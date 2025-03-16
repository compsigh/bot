import 'dotenv/config';
import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { getCommand, registerGlobalCommands } from './commands.js';

// Check for env variables
const token = process.env.DISCORD_TOKEN;
const appId = process.env.APP_ID;
const testGuildId = process.env.TEST_GUILD_ID;
if (!token)
    throw new Error('Missing env variable DISCORD_TOKEN');
if (!appId)
    throw new Error('Missing env variable APP_ID');
if (!testGuildId)
    throw new Error('Missing env variable TEST_GUILD_ID');

// Register commands
await registerGlobalCommands(token, appId);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// On client ready (ran only once).
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// On command interaction
client.on(Events.InteractionCreate, async interaction => {
    // Ignore interactions that aren't slash commands
    if (!interaction.isChatInputCommand()) return;

    // // Ignore interactions from guilds not in the whitelist
    // const guildId = interaction.guildId;
    // if (!guildId || !guildWhitelist.includes(guildId)) {
    // 	return await interaction.reply({ content: `This bot is not enabled for this guild`, flags: MessageFlags.Ephemeral });
    // }

    // Get the command
    const command = getCommand(interaction.commandName);

    // Error if we don't recognize the command
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    // Handle the command
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

// Log in to Discord with token
client.login(process.env.DISCORD_TOKEN);