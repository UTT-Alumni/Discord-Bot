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
    name: Project_t['name'],
    _channel?: TextChannel,
  ) => {
    const bot = Bot.get();

    // Check if the channel exists
    let channel = _channel;
    if (!(channel instanceof TextChannel)) {
      const thematicEmoji = (await db.getThematicById(this.id))?.emoji;

      // Otherwise create the channel
      const thematicChannel = (await bot.channels.fetch(
        (await db.getThematicById(this.id))!.channelId,
      )) as TextChannel;
      channel = await thematicChannel.parent?.children.create({
        name: `${thematicEmoji}｜${name}`,
        position: thematicChannel.position + 2, // Set the position just below the thematic channel
      }) as TextChannel;
    }

    // Set permissions for the channel to be visible from users with thematic role only
    this.setChannelVisibility(channel);

    // Add to the database
    await db.createProject(this.id, name, channel.id);

    return null;
  };

  public setChannelVisibility = async (channel: TextChannel) => {
    const roleId = await db.getThematicRoleId(this.id);
    if (!roleId) {
      return 'Unable to find thematic.';
    }
    const role = await channel.guild.roles.fetch(roleId);
    if (!role) {
      return 'Unable to find thematic role.';
    }

    channel.permissionOverwrites.delete(process.env.BASE_ROLE_ID as string);
    channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
    channel.permissionOverwrites.create(role, { ViewChannel: true });

    return null;
  };
}

export default Thematic;
