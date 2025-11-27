import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js"
import { isBanned } from "../mongodb.js"

export const WORKINGON_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://compsigh.club/api/marquee"
    : "http://localhost:3000/api/marquee"

const cooldown = new Map<string, number>() // userIds that have used the command in the last minute
const COOLDOWN_SECONDS = 60

const workingonCommand = {
  data: new SlashCommandBuilder()
    .setName("workingon")
    .setDescription(
      "Sets the project that you are working on to be displayed on the compsigh website's community page"
    )
    .addStringOption((option) =>
      option
        .setName("project")
        .setDescription("Your project's name")
        .setRequired(true)
        .setMaxLength(20)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    // Get data from the interaction
    const userid = interaction.user.id
    const usernick =
      interaction.member instanceof GuildMember && interaction.member.nickname
        ? interaction.member.nickname
        : interaction.user.displayName
    const projectName = interaction.options.getString("project")

    if (!projectName) {
      await interaction.editReply(`Something went wrong`)
      console.error(
        `Project name is null. \`/workingon\` userid:${userid} usernick:${usernick}`
      )
      return
    }

    // Make sure the user isn't banned
    if (await isBanned(userid)) {
      await interaction.editReply(
        "Sorry, you are banned from using the `/workingon` command."
      )
      return
    }

    // Make sure the user isn't on cooldown
    const lastUsed = cooldown.get(userid)
    if (lastUsed) {
      const timeLeftMs = lastUsed + COOLDOWN_SECONDS * 1000 - Date.now()
      await interaction.editReply(
        `You are on cooldown. Please wait ${Math.floor(timeLeftMs / 1000)} seconds before using this command again.`
      )
      return
    }

    // Add the user to the cooldown set
    cooldown.set(userid, Date.now())
    setTimeout(() => {
      cooldown.delete(userid)
    }, COOLDOWN_SECONDS * 1000)

    // Send data to the API to update the user's project
    const response = await fetch(WORKINGON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MARQUEE_API_KEY} `
      },
      body: JSON.stringify({
        id: userid,
        nickname: usernick,
        project: projectName
      })
    })

    // Handle HTTP errors
    if (!response.ok) {
      await interaction.editReply(`Something went wrong`)
      console.error(`HTTP error! ${response.status}: ${response.statusText} `)
      return
    }

    // Success message
    await interaction.editReply(`${usernick} is now working on ${projectName}!`)
  }
}

export default workingonCommand
