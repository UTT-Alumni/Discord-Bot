import { TextChannel } from 'discord.js';
import { Project as Project_t } from '../../prisma';
import Bot from './bot';

import * as db from './database';

class Thematic {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  public addProject = async (
    channelId: Project_t['channelId'],
  ) => {
    // Check if the channel exists
    const channel = await Bot.get().channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      return 'Unable to find the specified channel.';
    }

    // Set permissions for the channel to be visible from users with thematic role only
    const roleId = await db.getThematicRoleId(this.id);
    if (!roleId) {
      return 'Unable to find thematic.';
    }
    const role = await channel.guild.roles.fetch(roleId);
    if (!role) {
      return 'Unable to find thematic role.';
    }
    channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: false });
    channel.permissionOverwrites.edit(role, { ViewChannel: true });

    // Add to the database
    await db.createProject(this.id, channelId);

    return null;
  };
}

export default Thematic;
