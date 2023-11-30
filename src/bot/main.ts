import { promises as fs } from 'node:fs';

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  TextChannel,
  ChatInputCommandInteraction,
} from 'discord.js';

import { BotConfig } from './types';

import {
  createModal,
  onModalSubmit,
} from './userInfoModal';

import Pole from './pole';
import Bot from './bot';

/**
 * Start the discord bot client
 * @returns {Promise<void>} - The promise to resolve when the bot is connected
 */
const start = async (): Promise<void> => {
  const configContent: string = await fs.readFile(process.argv[2], 'utf8');
  const botConfig: BotConfig = JSON.parse(configContent);

  try {
    const bot = Bot.get();

    bot.on(Events.ClientReady, async (): Promise<void> => {
      console.info(`UTT Alumni Discord bot logged in as ${bot?.user?.tag}!`);
      const guild = await bot.guilds.fetch(botConfig.server);
      console.info(`Discord guild ${botConfig.server} retrieved.`);
      const channel = await guild.channels.fetch(botConfig.channel) as TextChannel;
      console.info(`Discord channel ${botConfig.channel} retrieved.`);
      const channelMessages = await channel.messages.fetch();
      console.info(`Fetch ${channelMessages.size} messages on channel ${botConfig.channel}.`);
      if (channelMessages.size > 0) {
        console.info('Discord server already set with a welcome message.');
      } else {
        console.info('Sending the welcome message to the Discord channel.');
        // Sends custom message mentioning the user and adds rules provided in config.json file
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('primary')
              .setLabel(botConfig.accept)
              .setStyle(ButtonStyle.Primary),
          ) as ActionRowBuilder<ButtonBuilder>;
        await channel.send({
          content: botConfig.rules,
          components: [row],
        });
      }
    });

    bot.on(Events.InteractionCreate, async (interaction): Promise<void> => {
      try {
        // Bot commands
        if (interaction instanceof ChatInputCommandInteraction) {
          if (interaction.commandName === 'pole') {
            const name = interaction.options.getString('name');
            const channelId = interaction.options.getChannel('channel')?.id;

            if (name && channelId) {
              await Pole.addPole(name, channelId);
              await interaction.reply({ content: ':white_check_mark: Pôle ajouté.', ephemeral: true });
            }
          }

          if (interaction.commandName === 'thematic') {
            const poleName = interaction.options.getString('pole');
            const name = interaction.options.getString('name');
            const emoji = interaction.options.getString('emoji');
            const roleId = interaction.options.getRole('role')?.id;
            const channelId = interaction.options.getChannel('channel')?.id;

            if (poleName && name && emoji && roleId && channelId) {
              await (await Pole.getPole(poleName))?.addThematic(name, emoji, roleId, channelId);
              await interaction.reply({ content: ':white_check_mark: Thématique ajoutée.', ephemeral: true });
            }
          }

          if (interaction.commandName === 'project') {
            const poleName = interaction.options.getString('pole');
            const thematicName = interaction.options.getString('thematic');
            const channelId = interaction.options.getChannel('channel')?.id;

            if (poleName && thematicName && channelId) {
              const thematic = await (await Pole.getPole(poleName))?.getThematic(thematicName);
              await (thematic?.addProject(channelId));
              await interaction.reply({ content: ':white_check_mark: Projet ajouté.', ephemeral: true });
            }
          }

          if (interaction.commandName === 'get') {
            await interaction.reply({ content: await Pole.getFormatted(bot), ephemeral: true });
          }
        }

        // "Accept rules" button
        if (interaction.channelId === botConfig.channel && interaction.isButton()) {
          const modal = await createModal(botConfig.modal);
          await interaction.showModal(modal);
        }

        // "Register" modal submit
        if (interaction.isModalSubmit() && interaction.id === 'registerModal') {
          await onModalSubmit(interaction, botConfig.role);
          await interaction.reply({ content: botConfig.welcome, ephemeral: true });
        }
      } catch (err) {
        console.error(err);
        if (interaction.isButton() || interaction.isModalSubmit() || interaction.isCommand()) {
          await interaction.reply({ content: botConfig.error, ephemeral: true });
        }
      }
    });

    await bot.login(botConfig.token);
  } catch (err) {
    console.error(err);
  }
};

start().then(() => {
  console.info('UTT Alumni Discord bot started.');
});
