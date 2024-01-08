/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import {
  TextChannel, ChannelType, Client, PermissionsBitField, CategoryChannel,
} from 'discord.js';

import {
  Pole as Pole_t,
  Thematic as Thematic_t,
} from '../../prisma';

import * as db from './database';

import Thematic from './thematic';
import Bot from './bot';

class Pole {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  public static addPole = async (
    name: Pole_t['name'],
    emoji: Pole_t['emoji'],
    _channel?: TextChannel,
  ) => {
    let channel = _channel;
    if (!channel) {
      // If the role channel does not exists, create the channels
      const guild = await Bot.get().guilds.fetch(process.env.GUILD_ID as string);

      // Create the category channel
      const category = await guild.channels.create({
        type: ChannelType.GuildCategory,
        name: `Pôle ${name}`,
        permissionOverwrites: [
          // Only users with base role can see the category channels
          {
            id: guild.roles.everyone,
            deny: PermissionsBitField.Flags.ViewChannel,
          },
          {
            id: process.env.BASE_ROLE_ID as string,
            allow: PermissionsBitField.Flags.ViewChannel,
          },
        ],
      });
      // Create the reaction role channel
      channel = await category.children.create({
        name: `${emoji}｜choix-projets`,
      });
      // Create the other channels
      await category.children.create({
        name: `${emoji}｜annonces`,
      });
      await category.children.create({
        name: `${emoji}｜blabla`,
      });
      await category.children.create({
        type: ChannelType.GuildVoice,
        name: `${emoji}｜pole-${name.toLowerCase().replace(' ', '-')}`,
      });
    }

    // Change its permission
    await channel.permissionOverwrites.edit(
      channel.guild.roles.everyone,
      { AddReactions: false, SendMessages: false },
    );

    // Add to the database
    const pole = await db.createPole(name, emoji, channel.id);

    return new Pole(pole.id);
  };

  public static getPole = async (name: Pole_t['name']) => {
    // Try to retrieve the corresponding pole in the database
    const pole = await db.getPoleByName(name);

    // Return a Pole object if it exists
    return pole ? new Pole(pole.id) : null;
  };

  public static getFormatted = async (discordClient: Client) => {
    let output = '';

    const poles = await db.getPoles();

    for (const pole of poles) {
      const rolesChannel = discordClient.channels.cache
        .find((channel) => channel.id === pole.rolesChannelId) as TextChannel;
      const categoryName = rolesChannel.parent?.name;
      output += `Pole : ${pole.name} (${categoryName}, ${rolesChannel.name})\n`;

      const thematics = await db.getThematics(pole.id);

      for (const thematic of thematics) {
        const thematicChannel = discordClient.channels.cache
          .find((channel) => channel.id === thematic.channelId) as TextChannel;

        output += `  | Thematic : ${thematic.name} (${thematicChannel.name})\n`;

        const projects = await db.getProjects(thematic.id);

        for (const project of projects) {
          const projectChannel = discordClient.channels.cache
            .find((channel) => channel.id === project.channelId) as TextChannel;

          output += `  |   | Project : ${project.name} (${projectChannel.name})\n`;
        }
      }
    }

    return output ? `\`\`\`${output}\`\`\`` : 'No pole defined.';
  };

  public addThematic = async (
    name: Thematic_t['name'],
    emoji: Thematic_t['emoji'],
    _channel?: TextChannel,
  ) => {
    const bot = Bot.get();
    const guild = await bot.guilds.fetch(process.env.GUILD_ID as string);

    // Add thematic emoji to the reaction channel
    const pole = await db.getPole(this.id);
    if (!pole) {
      return 'Unable to find pole.';
    }
    const reactionChannel = await bot.channels.fetch(pole.rolesChannelId);
    if (!reactionChannel?.isTextBased()) {
      return 'The pole must be a text channel.';
    }
    const message = (await reactionChannel.messages.fetch()).at(0);
    if (!message) {
      return 'Unable to find a message in the pole reaction channel.';
    }
    await message?.react(emoji);

    // Create the role if it does not exists
    const roleName = `${emoji} ${name}`;
    let role = (await guild.roles.fetch()).find((r) => r.name === roleName);
    if (!role) {
      role = await guild.roles.create({
        name: roleName,
      });
    }

    // Check if the channel exists
    let channel = _channel;
    if (!channel) {
      // If the role channel does not exists, create the channels
      const poleChannel = await guild.channels.fetch(pole!.rolesChannelId);

      // Create the text channel
      channel = await guild.channels.create({
        name: `📂${emoji}｜${name}`,
        parent: poleChannel!.parent as CategoryChannel,
      });
      // Create the voice channel
      await guild.channels.create({
        // Use the same name than the text channel name
        name: `📂${emoji}｜${name}`.replace(' ', '-').toLowerCase(),
        parent: poleChannel!.parent as CategoryChannel,
        type: ChannelType.GuildVoice,
      });
    }

    // Add to the database
    const thematic = new Thematic(
      (await db.createThematic(this.id, name, emoji, role.id, channel.id)).id,
    );

    // Change permissions for the channel to be visible from users with associated role only
    thematic.setChannelVisibility(channel);

    return null;
  };

  public getThematic = async (name: Thematic_t['name']) => {
    // Try to retrieve the corresponding thematic of the pole
    const thematic = await db.getThematicByName(this.id, name);

    return thematic ? new Thematic(thematic.id) : null;
  };
}

export default Pole;
