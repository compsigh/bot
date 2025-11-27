import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandOptionsOnlyBuilder
} from "discord.js"
import pingCommand from "./commands/ping.js"
import petfaadilCommand from "./commands/petfaadil.js"
import workingonCommand from "./commands/workingon.js"
import workingonBanCommand from "./commands/workingon-ban.js"
import workingonRemoveCommand from "./commands/workingon-remove.js"
import workingonUnbanCommand from "./commands/workingon-unban.js"
import contribs from "./commands/contribs.js"

export type Command = {
  data: SlashCommandOptionsOnlyBuilder
  execute(interaction: any): Promise<void>
}

// Commands in basic array
export const commands = [
  pingCommand,
  petfaadilCommand,
  workingonCommand,
  workingonBanCommand,
  workingonRemoveCommand,
  workingonUnbanCommand,
  contribs
]

// Commands in a map from command name -> Command
const nameToCommandMap = new Map<string, Command>()
commands.forEach((command) => {
  nameToCommandMap.set(command.data.name, command)
})

// Commands in data JSON format to register them
let commandsData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
commands.forEach((command) => {
  commandsData.push(command.data.toJSON())
})

export function getCommand(name: string) {
  return nameToCommandMap.get(name)
}

export async function registerGlobalCommands(clientId: string, token: string) {
  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token)

  // and deploy your commands!
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands globally.`
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commandsData
    })

    console.log("Successfully registered application (/) commands globally.")
  } catch (error) {
    console.error("Error registering application (/) commands globally.")
    console.error(error)
  }
}

export async function registerGuildCommands(
  token: string,
  clientId: string,
  guildId: string
) {
  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token)

  // and deploy your commands!
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands in guild ${guildId}.`
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commandsData }
    )

    console.log(
      `Successfully registered application (/) commands in guild ${guildId}.`
    )
  } catch (error) {
    console.error(
      `Error registering application (/) commands in guild ${guildId}.`
    )
    console.error(error)
  }
}
