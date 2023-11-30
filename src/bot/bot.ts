import { Client, GatewayIntentBits } from 'discord.js';

/**
 * Simple singleton for Discord Client
 */
abstract class Bot {
  private static client: Client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

  public static async login(token: string) {
    await this.client.login(token);
  }

  public static get() {
    return this.client;
  }
}

export default Bot;
