import {
  CommandInteraction,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js"

const pingCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  async execute(interaction: CommandInteraction) {
    await interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral })
  }
}

export default pingCommand
