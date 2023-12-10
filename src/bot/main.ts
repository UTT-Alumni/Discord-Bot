import { promises as fs } from 'node:fs';
import 'dotenv/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  TextChannel,
  ChatInputCommandInteraction,
  User,
  PartialUser,
  MessageReaction,
  PartialMessageReaction,
} from 'discord.js';

import { BotConfig } from './types';

import {
  createModal,
  onModalSubmit,
} from './userInfoModal';

import Pole from './pole';
import Bot from './bot';
import * as db from './database';

const onMessageReaction = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  add: boolean,
) => {
  // If the reaction data we have is partial, then fetch it
  if (reaction.partial) {
    await reaction.fetch();
  }

  // If the bot is the reaction author, then ignore
  if (user.id === Bot.get().user?.id) {
    return;
  }

  // Check if the reaction happened in a pole reaction channel
  const poles = await db.getPoles();
  const pole = poles.find((p) => p.rolesChannelId === reaction.message.channel.id);
  if (pole) {
    const thematic = await db.getThematicByEmoji(reaction.emoji.toString());

    if (thematic) {
      const member = await reaction.message.guild!.members.fetch(user.id);

      if (add) {
        member.roles.add(thematic?.roleId);
      } else {
        member.roles.remove(thematic?.roleId);
      }

      console.log(`Role ${thematic?.name} (${pole.name} pole) ${add ? 'added' : 'removed'} to ${user.displayName}.`);
    }
  }
};

/**
 * Start the discord bot client
 * @returns {Promise<void>} - The promise to resolve when the bot is connected
 */
const start = async (): Promise<void> => {
  // Get .env variables
  const guildId = process.env.GUILD_ID;
  const rulesChannelId = process.env.RULES_CHANNEL_ID;
  const botToken = process.env.BOT_TOKEN;

  if (!guildId || !rulesChannelId || !botToken) {
    console.error('You must fill all the fields in the .env file.');
    return;
  }

  // Get messages from config file
  const messages = JSON.parse(await fs.readFile('messages.json', 'utf8'));

  try {
    const bot = Bot.get();

    bot.on(Events.ClientReady, async (): Promise<void> => {
      console.info(`UTT Alumni Discord bot logged in as ${bot?.user?.tag}!`);
      const guild = await bot.guilds.fetch(guildId);
      console.info(`Discord guild ${guildId} retrieved.`);
      const channel = await guild.channels.fetch(rulesChannelId) as TextChannel;
      console.info(`Discord channel ${rulesChannelId} retrieved.`);
      const channelMessages = await channel.messages.fetch();
      console.info(`Fetch ${channelMessages.size} messages on channel ${rulesChannelId}.`);
      if (channelMessages.size > 0) {
        console.info('Discord server already set with a welcome message.');
      } else {
        console.info('Sending the welcome message to the Discord channel.');
        // Sends custom message mentioning the user and adds rules
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('primary')
              .setLabel(messages.accept)
              .setStyle(ButtonStyle.Primary),
          ) as ActionRowBuilder<ButtonBuilder>;
        await channel.send({
          content: messages.rules,
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
              await interaction.reply({ content: ':white_check_mark: Pole added.', ephemeral: true });
            }
          }

          if (interaction.commandName === 'thematic') {
            const poleName = interaction.options.getString('pole');
            const name = interaction.options.getString('name');
            const emoji = interaction.options.getString('emoji');
            const roleId = interaction.options.getRole('role')?.id;
            const channelId = interaction.options.getChannel('channel')?.id;

            if (poleName && name && emoji && roleId && channelId) {
              let error;
              const pole = await Pole.getPole(poleName);
              if (!pole) {
                error = 'Unable to find pole.';
              } else {
                error = await pole.addThematic(name, emoji, roleId, channelId);
              }

              await interaction.reply({ content: error || ':white_check_mark: Thematic added.', ephemeral: true });
            }
          }

          if (interaction.commandName === 'project') {
            const poleName = interaction.options.getString('pole');
            const thematicName = interaction.options.getString('thematic');
            const channelId = interaction.options.getChannel('channel')?.id;

            if (poleName && thematicName && channelId) {
              let error;
              const thematic = await (await Pole.getPole(poleName))?.getThematic(thematicName);
              if (!thematic) {
                error = 'Unable to find the pole or the thematic.';
              } else {
                error = await thematic?.addProject(channelId);
              }

              await interaction.reply({ content: error || ':white_check_mark: Project added.', ephemeral: true });
            }
          }

          if (interaction.commandName === 'get') {
            await interaction.reply({ content: await Pole.getFormatted(bot), ephemeral: true });
          }
        }

        // "Accept rules" button
        if (interaction.channelId === rulesChannelId && interaction.isButton()) {
          const modal = await createModal(messages.modal);
          await interaction.showModal(modal);
        }

        // "Register" modal submit
        if (interaction.isModalSubmit() && interaction.id === 'registerModal') {
          await onModalSubmit(interaction, messages.role);
          await interaction.reply({ content: messages.welcome, ephemeral: true });
        }
      } catch (err) {
        console.error(err);
        if (interaction.isButton() || interaction.isModalSubmit() || interaction.isCommand()) {
          await interaction.reply({ content: messages.error, ephemeral: true });
        }
      }
    });

    // https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
    bot.on(Events.MessageReactionAdd, (reaction, user) => onMessageReaction(reaction, user, true));
    bot.on(
      Events.MessageReactionRemove,
      (reaction, user) => onMessageReaction(reaction, user, false),
    );

    await bot.login(botToken);
  } catch (err) {
    console.error(err);
  }
};

start().then(() => {
  console.info('UTT Alumni Discord bot started.');
});
