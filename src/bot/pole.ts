/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { Client, TextChannel } from 'discord.js';

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
    rolesChannelId: Pole_t['rolesChannelId'],
  ) => {
    // Check if the role channel exists
    const channel = await Bot.get().channels.fetch(rolesChannelId);
    if (!channel || !(channel instanceof TextChannel)) {
      return 'Unable to find the specified channel.';
    }

    // Change its permission
    channel.permissionOverwrites.edit(channel.guild.roles.everyone, { AddReactions: false });

    // Add to the database
    const pole = await db.createPole(name, rolesChannelId);

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

          output += `  |   | Project : (${projectChannel.name})\n`;
        }
      }
    }

    return output ? `\`\`\`${output}\`\`\`` : 'No pole defined.';
  };

  public addThematic = async (
    name: Thematic_t['name'],
    emoji: Thematic_t['emoji'],
    roleId: Thematic_t['roleId'],
    channelId: Thematic_t['channelId'],
  ) => {
    const bot = Bot.get();

    // Check if the channel exists
    const channel = await bot.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      return 'Unable to find the specified channel.';
    }

    // Add thematic emoji to the reaction channel
    const pole = await db.getPole(this.id);
    if (!pole) {
      return 'Unable to find pole.';
    }
    const reactionChannel = await bot.channels.fetch(pole.rolesChannelId);
    if (!reactionChannel?.isTextBased()) {
      return 'The pole must be a text channel.';
    }
    await reactionChannel.messages.fetch();
    const message = reactionChannel.messages.cache.at(0);
    if (!message) {
      return 'Unable to find a message in the pole reaction channel.';
    }
    await message?.react(emoji);

    // Add to the database
    const thematic = new Thematic(
      (await db.createThematic(this.id, name, emoji, roleId, channelId)).id,
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
