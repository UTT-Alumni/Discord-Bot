const fs = require('node:fs/promises')
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
} = require('discord.js')

require('dotenv').config()


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions
  ],
})

const modal = new ModalBuilder().setCustomId('utt-alumni-bot-id').setTitle('Modal')
const firstNameComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
  .setCustomId('firstName')
  .setLabel('Prénom')
  .setStyle('Short')
  .setMinLength(1)
  .setMaxLength(16)
  .setPlaceholder('Écrivez votre prénom')
  .setRequired(true))
const nameComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
  .setCustomId('name')
  .setLabel('Nom de famille')
  .setStyle('Short')
  .setPlaceholder('Écrivez votre nom de famille')
  .setRequired(true))
const graduationYearComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
  .setCustomId('graduationYear')
  .setLabel('Année de diplôme')
  .setStyle('Short')
  .setMinLength(4)
  .setMaxLength(4)
  .setPlaceholder('Votre année de diplôme (espérée si vous êtes étudiant)')
  .setRequired(true))
const educationComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
  .setCustomId('education')
  .setLabel('Branche ou Poste UTT')
  .setStyle('Short')
  .setMinLength(2)
  .setMaxLength(5)
  .setPlaceholder('Branche, master ou doctorat, poste...')
  .setRequired(true))

modal.addComponents([
  firstNameComponent,
  nameComponent,
  graduationYearComponent,
  educationComponent,
])
async function createForm(interaction) {
  await interaction.showModal(modal)
}

/**
 * Validate the modal
 *
 * @param {BaseInteraction} interaction Interaction data
 */
async function onModalSubmit(interaction) {
  if (interaction.customId === 'utt-alumni-bot-id') {
    const firstName = interaction.fields.getTextInputValue('firstName')
    const name = interaction.fields.getTextInputValue('name')
    const graduationYear = interaction.fields.getTextInputValue('graduationYear')
    const education = interaction.fields.getTextInputValue('education')
    let fullName = `${firstName} ${name} - ${graduationYear} ${education}`
    // Check if the full name can be handle by discord
    if (fullName.length > 32) {
      let toReduce = fullName.length - 31 // Because the name will have "."
      let newName = name.slice(0, name.length - toReduce + 1)
      let newFirstName = firstName
      // If the name reduction is not enough
      if (name.length - toReduce < 0) {
        toReduce -= name.length + 1 // Because the firstname will have a "."
        newName = `${name.slice(0, 1)}`
        newFirstName = `${firstName.slice(0, firstName.length - toReduce)}.`
      }
      fullName = `${newFirstName} ${newName}. - ${graduationYear} ${education}`
    }
    interaction.member.setNickname(fullName)
    const myRole = interaction.member.guild.roles.cache.find(
      (role) => role.name === process.env.ROLE_TO_ATTRIBUTE,
    )
    interaction.member.roles.add(myRole.id)
  }
}

const start = async () => {
  const configContent = await fs.readFile(process.argv[3], 'utf8')
  const botConfig = JSON.parse(configContent)

  client.on('ready', async () => {
    console.log(`UTT Alumni Discord bot logged in as ${client.user.tag}!`)
    const guild = await client.guilds.fetch(botConfig.server)
    console.log(`Discord guild ${botConfig.server} retrieved.`)
    const channel = await guild.channels.fetch(botConfig.channel)
    console.log(`Discord channel ${botConfig.channel} retrieved.`)
    const channelMessages = await channel.messages.fetch()

    console.log(`Fetch ${channelMessages.size} messages on channel ${botConfig.channel}.`)

    if(channelMessages.size > 1) {
      console.log('Discord server already set with a welcome message.')
    } else {
      console.log('Sending the welcome message to the Discord channel.')

      // Sends custom message mentioning the user and adds rules provided in config.json file
      const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
              .setCustomId('primary')
              .setLabel('J\'accepte le règlement')
              .setStyle(ButtonStyle.Primary),
      )
      await channel.send({
        content: botConfig.rules,
        components: [row],
        ephemeral: false,
      })
    }
  })

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
      createForm(interaction)
    }
    if (interaction.isModalSubmit()) {
      onModalSubmit(interaction)
    }
  })

  await client.login(botConfig.token)
}

start().then(() => {
  console.log('UTT Alumni Discord bot started.')
})
