import { Client, TextChannel } from 'discord.js';

import {
  Pole as Pole_t,
  Thematic as Thematic_t,
} from '../../prisma';

import * as db from './database';

import Thematic from './thematic';

class Pole {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  public static addPole = async (
    name: Pole_t['name'],
    rolesChannelId: Pole_t['rolesChannelId'],
  ) => {
    // TODO : check if the channel exists

    // Add to the database
    const pole = await db.createPole(name, rolesChannelId);

    return new Pole(pole.id);
  };

  public static getPole = async (name: Pole_t['name']) => {
    // Try to retrieve the corresponding pole in the database
    const pole = await db.getPole(name);

    // Return a Pole object if it exists
    return pole ? new Pole(pole.id) : null;
  };

  public static getFormatted = async (discordClient: Client) => {
    let output = '';

    const poles = await db.getPoles();

    for (const pole of poles) {
      const rolesChannel = discordClient.channels.cache.find((channel) => channel.id == pole.rolesChannelId) as TextChannel;
      const categoryName = rolesChannel.parent?.name;
      output += `Pôle : ${pole.name} (${categoryName}, ${rolesChannel.name})\n`;

      const thematics = await db.getPoleThematics(pole.id);

      for (const thematic of thematics) {
        const thematicChannel = discordClient.channels.cache.find((channel) => channel.id == thematic.channelId) as TextChannel;

        output += `  | Thématique : ${thematic.name} (${thematicChannel.name})\n`;

        const projects = await db.getThematicProjects(thematic.id);

        for (const project of projects) {
          const projectChannel = discordClient.channels.cache.find((channel) => channel.id == project.channelId) as TextChannel;

          output += `  |   | Projet : (${projectChannel.name})\n`;
        }
      }
    }

    return output ? `\`\`\`${output}\`\`\`` : 'Aucun pole défini.';
  };

  public addThematic = async (
    name: Thematic_t['name'],
    emoji: Thematic_t['emoji'],
    roleId: Thematic_t['roleId'],
    channelId: Thematic_t['channelId'],
  ) => {
    // TODO: check if the channel exists

    // TODO: create the role

    // TODO: add thematic emoji to the reaction message of the pole

    // TODO: change permissions for the channel to be visible from users with associated role only

    // Add to the database
    const thematic = await db.createThematic(this.id, name, emoji, roleId, channelId);

    return new Thematic(thematic.id);
  };

  public getThematic = async (name: Thematic_t['name']) => {
    // Try to retrieve the corresponding thematic of the pole
    const thematic = await db.getPoleThematic(this.id, name);

    return thematic ? new Thematic(thematic.id) : null;
  };
}

export default Pole;
