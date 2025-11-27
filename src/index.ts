import "dotenv/config"
import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js"
import { getCommand, registerGuildCommands } from "./commands.js"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
if (!DISCORD_CLIENT_ID)
  throw new Error("Missing DISCORD_CLIENT_ID environment variable!")

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
if (!DISCORD_BOT_TOKEN)
  throw new Error("Missing DISCORD_BOT_TOKEN environment variable!")

const DEV_SERVER_IDS = process.env.DEV_SERVER_IDS
if (!DEV_SERVER_IDS)
  console.warn(
    "Missing DEV_SERVER_IDS environment variable; won't register guild commands!"
  )

const whitelistedGuilds = new Set<string>()
if (DEV_SERVER_IDS) {
  const serverIds = DEV_SERVER_IDS.split(", ")
  for (const serverId of serverIds) whitelistedGuilds.add(serverId)
}

for (const serverId of whitelistedGuilds)
  await registerGuildCommands(DISCORD_CLIENT_ID, DISCORD_BOT_TOKEN, serverId)

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

client.login(DISCORD_BOT_TOKEN)
