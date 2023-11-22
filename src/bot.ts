import { promises as fs } from 'node:fs';

import {
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  TextChannel,
} from 'discord.js';

import { BotConfig } from './types/botconfig';

import {
  createModal,
  onModalSubmit,
} from './userInfoModal';

/**
 * Start the discord bot client
 * @returns {Promise<void>} - The promise to resolve when the bot is connected
 */
const start = async (): Promise<void> => {
  const configContent: string = await fs.readFile(process.argv[2], 'utf8');
  const botConfig: BotConfig = JSON.parse(configContent);

  const client: Client = new Client({ intents: [] });
  client.on(Events.ClientReady, async (): Promise<void> => {
    try {
      console.info(`UTT Alumni Discord bot logged in as ${client?.user?.tag}!`);
      const guild = await client.guilds.fetch(botConfig.server);
      console.info(`Discord guild ${botConfig.server} retrieved.`);
      const channel = await guild.channels.fetch(botConfig.channel) as TextChannel;
      console.info(`Discord channel ${botConfig.channel} retrieved.`);
      const channelMessages = await channel.messages.fetch();
      console.info(`Fetch ${channelMessages.size} messages on channel ${botConfig.channel}.`);
      if (channelMessages.size > 0) {
        console.info('Discord server already set with a welcome message.');
      } else {
        console.info('Sending the welcome message to the Discord channel.');
        const validationButton = new ButtonBuilder()
          .setCustomId('primary')
          .setLabel(botConfig.accept)
          .setStyle(ButtonStyle.Primary);
        // Sends custom message mentioning the user and adds rules provided in config.json file
        const row = new ActionRowBuilder().addComponents(validationButton) as ActionRowBuilder<ButtonBuilder>;
        await channel.send({
          content: botConfig.rules,
          components: [row],
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

  client.on(Events.InteractionCreate, async (interaction): Promise<void> => {
    try {
      if (interaction.channelId !== botConfig.channel) {
        return;
      }
      if (interaction.isButton()) {
        const modal = await createModal(botConfig.modal);
        await interaction.showModal(modal);
      }
      if (interaction.isModalSubmit()) {
        await onModalSubmit(interaction, botConfig.role);
        await interaction.reply({ content: botConfig.welcome, ephemeral: true });
      }
    } catch (err) {
      console.error(err);
      if (interaction.isButton() || interaction.isModalSubmit()) {
        await interaction.reply({ content: botConfig.error, ephemeral: true });
      }
    }
  });
  try {
    await client.login(botConfig.token);
  } catch (err) {
    console.error(err);
  }
};

start().then(() => {
  console.info('UTT Alumni Discord bot started.');
});