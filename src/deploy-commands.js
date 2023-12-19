/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

// https://v13.discordjs.guide/creating-your-bot/creating-commands.html#registering-commands

require('dotenv/config');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Describe bot commands
const commands = [

  // /pole name emoji [discordChannel]
  new SlashCommandBuilder()
    .setName('pole')
    .setDescription('Create a pole and the associated channels if needed.')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('The pole name.')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('The pole emoji (used in channel names).')
      .setRequired(true))
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('(Only if the pole channel already exists) The pole reaction channel.')
      .setRequired(false)),

  // /thematic pole name emoji [discordChannel]
  new SlashCommandBuilder()
    .setName('thematic')
    .setDescription('Create a thematic and the associated channel if needed.')
    .addStringOption((option) => option
      .setName('pole')
      .setDescription('The pole name.')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('name')
      .setDescription('The thematic name.')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('The thematic emoji (used in reactions and channel name).')
      .setRequired(true))
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('(Only if the thematic channel already exists) The thematic channel.')
      .setRequired(false)),

  // /project pole thematic name [discordChannel]
  new SlashCommandBuilder()
    .setName('project')
    .setDescription('Create a project and the associated channel if needed.')
    .addStringOption((option) => option
      .setName('pole')
      .setDescription('The pole name.')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('thematic')
      .setDescription('The thematic name.')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('name')
      .setDescription('The project name.')
      .setRequired(true))
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('(Only if the thematic channel already exists) The project channel.')
      .setRequired(false)),

  // /get
  new SlashCommandBuilder()
    .setName('get')
    .setDescription('Displays everything the bot knows about the poles.'),
];

// Set identification token
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

// Send new bot commands to Discord
rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commands.map((command) => command.toJSON()) },
)
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
