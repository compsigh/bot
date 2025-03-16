# Compsigh Bot

Compsigh Bot is a Discord bot for the [compsigh](https://compsigh.club/) discord server. This bot is built using Discord.js and TypeScript.

## Table of Contents

- [Compsigh Bot](#compsigh-bot)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Contributing](#contributing)
    - [Getting Setup](#getting-setup)
    - [Adding Commands](#adding-commands)

## Features

- **/ping**: Replies with "Pong!".
- **/petfaadil**: Pets Faadil and returns a random image of him.
- **/workingon**: Sets the project that you are working on to be displayed on the compsigh website's community page.

## Contributing

Contributions welcome! Feel free to make issues or pull requests. If you want to make your own feature, I would recommending messaging a leadership member first to make sure it's something that could get merged.

### Getting Setup

1. Fork the repo and clone.

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory with your own variables:
    ```env
    DISCORD_TOKEN=""
    MONGO_URI=""
    MARQUEE_API_KEY=""
    ```

4. Make a testing server with your version of the bot.

5. In `src/index.ts`, update the applicationId and add your server to the whitelist.

6. Run the bot
    ```sh
    npm run dev
    ```

### Adding Commands

To add more commands, follow these steps:

1. Create a new file in the `src/commands` directory, e.g., `newcommand.ts`.
2. Define your command using the [`SlashCommandBuilder`](https://discord.js.org/docs/packages/discord.js/14.18.0/SlashCommandBuilder:Class) and implement the `execute` function. The ping is a good example to get started.<br>
See also: https://discordjs.guide/creating-your-bot/slash-commands.html#individual-command-files
3. Import and add your command to the `commands` array in `src/commands.ts`.