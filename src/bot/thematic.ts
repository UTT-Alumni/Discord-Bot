import { ChannelType, TextChannel, VoiceChannel } from 'discord.js';
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
    if (!channel) {
      const thematicEmoji = (await db.getThematicById(this.id))?.emoji;

      // Otherwise create the channel
      const thematicChannel = (await bot.channels.fetch(
        (await db.getThematicById(this.id))!.channelId,
      )) as TextChannel;

      const channelName = name.replace(/[ '"]/g, '-').toLowerCase()
      channel = await thematicChannel.parent?.children.create({
        name: `${thematicEmoji}｜${channelName}`,
      }) as TextChannel;

      // Set the position just below the thematic channel
      await channel.setPosition(thematicChannel.position + 1);
    }

    // Set permissions for the channel to be visible from users with thematic role only
    await this.setChannelPermission(channel);

    // Add to the database
    await db.createProject(this.id, name, channel.id);

    return null;
  };

  public setChannelPermission = async (channel: TextChannel) => {
    const roleId = await db.getThematicRoleId(this.id);
    if (!roleId) {
      return 'Unable to find thematic.';
    }

    // Retrieve voice channel
    const voiceChannel = channel.parent!.children.cache
      .find((c) => c.name === channel.name && c.type === ChannelType.GuildVoice) as VoiceChannel;

    const channels = [channel] as (TextChannel | VoiceChannel)[];
    if (voiceChannel) {
      channels.push(voiceChannel);
    }

    for (const c of channels) {
      const channelWithoutBaseRole = await c.permissionOverwrites.delete(process.env.BASE_ROLE_ID as string);
      await new Promise(r => setTimeout(r, 200));
      const channelWithoutEveryone = await channelWithoutBaseRole.permissionOverwrites.create(channelWithoutBaseRole.guild.roles.everyone, { ViewChannel: false });
      await new Promise(r => setTimeout(r, 200));
      const role = await channelWithoutEveryone.guild.roles.fetch(roleId);
      if (!role) {
        console.log(`Role ${roleId} not found in guild`)
      } else {
        await channelWithoutEveryone.permissionOverwrites.create(role, { ViewChannel: true });
        console.log(`Permission ${role.name} set for ${c.name} [${c.id}] (${c.type})`)
      }
    }
  };
}

export default Thematic;
