# Compsigh Bot

Discord bot for [compsigh](https://compsigh.club/), the social computer science club at the University of San Francisco.

This bot is built using Discord.js and TypeScript. Deployed using [Railway](http://railway.com/).

## Table of Contents

- [Commands](#commands)
- [Contributing](#contributing)
  - [Getting Setup](#getting-setup)
  - [Adding Commands](#adding-commands)

## Commands

- **/ping**: Replies with "Pong!".
- **/petfaadil**: Pets Faadil and returns a random image of him.
- **/contribs**: Replies with the contribution graph for the given GitHub account.
- **/workingon**: Sets the project that you are working on to be displayed on the [compsigh website's community page](https://compsigh.club/community).
- Leadership Only
  - **/workingon-ban**: Bans the user from using the /workingon command.
  - **/workingon-remove**: Removes the /workingon entry made by the user.
  - **/workingon-unban**: Unbans the user from using the /workingon command.

## Contributing

Contributions welcome! Feel free to make issues or pull requests. If you want to make your own feature, I would recommending messaging a leadership member first to make sure it's something that could get merged.

### Getting Setup

1. Fork the repo and clone.

2. Install dependencies (install pnpm first if you don't have it):
    ```sh
    pnpm install
    ```

3. Create a `.env` file in the root directory with your own variables:
    ```env
    DISCORD_TOKEN=""
    GITHUB_TOKEN=""
    MARQUEE_API_KEY=""
    MONGO_URI=""
    ```

4. Make a testing server with your version of the bot.

5. In `src/index.ts`, update the applicationId and add your server to the whitelist.

6. Run the bot
    ```sh
    pnpm run dev
    ```

### Adding Commands

To add more commands, follow these steps:

1. Create a new file in the `src/commands` directory, e.g., `newcommand.ts`.
2. Define your command using the [`SlashCommandBuilder`](https://discord.js.org/docs/packages/discord.js/14.18.0/SlashCommandBuilder:Class) and implement the `execute` function. The ping is a good example to get started. The discord.js guide may also be useful, see: https://discordjs.guide/creating-your-bot/slash-commands.html#individual-command-files
3. In `src/commands.ts`, import your command and add it to the `commands` array.
