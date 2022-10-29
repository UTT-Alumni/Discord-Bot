const fs = require('node:fs/promises')

const {
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} = require('discord.js')

const {
  createModal,
  onModalSubmit,
} = require('./modal')

/**
 * Start the discord bot client
 * @returns {Promise<void>} - The promise to resolve when the bot is connected
 */
const start = async () => {
  const configContent = await fs.readFile(process.argv[3], 'utf8')
  const botConfig = JSON.parse(configContent)

  const client = new Client({ intents: [] })
  client.on(Events.ClientReady, async () => {
    try {
      console.info(`UTT Alumni Discord bot logged in as ${client.user.tag}!`)
      const guild = await client.guilds.fetch(botConfig.server)
      console.info(`Discord guild ${botConfig.server} retrieved.`)
      const channel = await guild.channels.fetch(botConfig.channel)
      console.info(`Discord channel ${botConfig.channel} retrieved.`)
      const channelMessages = await channel.messages.fetch()
      console.info(`Fetch ${channelMessages.size} messages on channel ${botConfig.channel}.`)
      if (channelMessages.size > 0) {
        console.info('Discord server already set with a welcome message.')
      } else {
        console.info('Sending the welcome message to the Discord channel.')
        const validationButton = new ButtonBuilder()
          .setCustomId('primary')
          .setLabel(botConfig.accept)
          .setStyle(ButtonStyle.Primary)
        // Sends custom message mentioning the user and adds rules provided in config.json file
        const row = new ActionRowBuilder().addComponents(validationButton)
        await channel.send({
          content: botConfig.rules,
          components: [row],
          ephemeral: false,
        })
      }
    } catch (err) {
      console.error(err)
    }
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.channelId !== botConfig.channel) {
        return
      }
      if (interaction.isButton()) {
        const modal = await createModal(botConfig.modal)
        await interaction.showModal(modal)
      }
      if (interaction.isModalSubmit()) {
        await onModalSubmit(interaction, botConfig.role)
        await interaction.reply({ content: botConfig.welcome, ephemeral: true })
      }
    } catch (err) {
      console.error(err)
    }
  })
  try {
    await client.login(botConfig.token)
  } catch (err) {
    console.error(err)
  }
}

start().then(() => {
  console.info('UTT Alumni Discord bot started.')
})
