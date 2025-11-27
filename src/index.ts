import "dotenv/config"
import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js"
import { getCommand, registerGlobalCommands } from "./commands.js"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
if (!DISCORD_CLIENT_ID)
  throw new Error("Missing DISCORD_CLIENT_ID environment variable!")

const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
if (!DISCORD_CLIENT_SECRET)
  throw new Error("Missing DISCORD_CLIENT_SECRET environment variable!")

// Register commands
await registerGlobalCommands(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET)

// Guild Whitelist
const whitelistedGuilds = new Set<string>()
whitelistedGuilds.add("849685154543960085") // compsigh
whitelistedGuilds.add("1307981513656369153") // compsigh bot testing

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// On client ready (ran only once).
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

// On guild join
client.on("guildCreate", (guild) => {
  const guildId = guild.id
  console.log(`Joined guild ${guildId}`)
  if (!whitelistedGuilds.has(guildId)) {
    console.log(`Leaving guild ${guildId}; not in the whitelist.`)
    guild.systemChannel?.send("The bot is not enabled for this guild. 👋")
    guild.leave()
  }
})

// On command interaction
client.on(Events.InteractionCreate, async (interaction) => {
  // Ignore interactions that aren't slash commands
  if (!interaction.isChatInputCommand()) return

  // Ignore interactions from guilds not in the whitelist
  const guildId = interaction.guildId
  if (!guildId || !whitelistedGuilds.has(guildId)) {
    return await interaction.reply({
      content: `This bot is not enabled for this guild`,
      flags: MessageFlags.Ephemeral
    })
  }

  // Get the command
  const command = getCommand(interaction.commandName)

  // Error if we don't recognize the command
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  // Handle the command
  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral
      })
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral
      })
    }
  }
})

client.login(DISCORD_CLIENT_SECRET)
