/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

// https://v13.discordjs.guide/creating-your-bot/creating-commands.html#registering-commands

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const config = require('../config-deploy.json');

// Describe bot commands
const commands = [

  // /pole {name} {discordChannel}
  new SlashCommandBuilder()
    .setName('pole')
    .setDescription('Adds a pole.')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('The pole name. You will then be able to use it to add thematics to the pole.')
      .setRequired(true))
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription("The channel in which users can react to get the roles of the pole's thematics.")
      .setRequired(true)),

  // /thematic {pole} {name} {emoji} {discordRole} {discordChannel}
  new SlashCommandBuilder()
    .setName('thematic')
    .setDescription('Associates a thematic with a pole.')
    .addStringOption((option) => option
      .setName('pole')
      .setDescription('The pole name as defined by the /getPoles command (it is not always the channel name).')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('name')
      .setDescription('The name of the thematic. You will then be able to use it to add projects to the thematic.')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Users will have to react with this emoji to get the associated role.')
      .setRequired(true))
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('The role associated to the thematic.')
      .setRequired(true))
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('The thematic channel.')
      .setRequired(true)),

  // /project {pole} {thematic} {discordChannel}
  new SlashCommandBuilder()
    .setName('project')
    .setDescription('Associates a project with a thematic.')
    .addStringOption((option) => option
      .setName('pole')
      .setDescription('The pole name as defined by the /getPoles command (it is not always the channel name).')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('thematic')
      .setDescription('The thematic name as defined by the /getPoles command (it is not always the channel name).')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('channel')
      .setDescription('The project channel.')
      .setRequired(true)),

  // /get
  new SlashCommandBuilder()
    .setName('get')
    .setDescription('Displays everything the bot knows about the poles.'),
];

// Set identification token
const rest = new REST({ version: '9' }).setToken(config.token);

// Send new bot commands to Discord
rest.put(
  Routes.applicationGuildCommands(config.clientId, config.guildId),
  { body: commands.map((command) => command.toJSON()) },
)
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
