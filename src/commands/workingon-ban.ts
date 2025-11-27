import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js"
import { addBan, isBanned } from "../mongodb.js"

const workingonBanCommand = {
  data: new SlashCommandBuilder()
    .setName("workingon-ban")
    .setDescription("Bans the user from using the /workingon command.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user who you want to ban")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    // Get data from the interaction
    const bannedUser = interaction.options.getUser("user")
    if (!bannedUser) {
      await interaction.editReply("User does not exist.")
      return
    }
    const bannedUserId = bannedUser.id
    const bannedByUserId = interaction.user.id

    // Add to database
    if (await isBanned(bannedUserId)) {
      await interaction.editReply(`<@${bannedByUserId}> is already banned.`)
      return
    }
    addBan(bannedUserId, bannedByUserId)

    // Success message
    await interaction.editReply(
      `Banned <@${bannedUserId}> from using \`/workingon\``
    )
  }
}

export default workingonBanCommand
