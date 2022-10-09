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

const messages = require('./messages.json')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    // GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.MessageContent
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
  .setLabel('Branche')
  .setStyle('Short')
  .setMinLength(2)
  .setMaxLength(5)
  .setPlaceholder('Branche ingénieur, master ou doctorat')
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

async function onUserAdded(member) {
  // Generates the name of the channel according to channelID provided in config.json file
  const channel = client.channels.cache.get(process.env.CHANNEL_ID)

  // Sends custom message mentioning the user and adds rules provided in config.json file
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('primary')
      .setLabel('Je me présente !')
      .setStyle(ButtonStyle.Primary),
  )
  // Private message TODO: Maybe not use this
  await channel.send({
    content: messages.fr.welcome,
    components: [row],
    ephemeral: true,
  })
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
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity('for new users to join', { type: 'WATCHING' })
  })

  client.on('guildMemberAdd', onUserAdded)

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
      createForm(interaction)
    }
    if (interaction.isModalSubmit()) {
      onModalSubmit(interaction)
    }
  })

  await client.login(process.env.DISCORD_TOKEN)
}

start().then(() => {
  console.log('UTT Alumni Discord bot started.')
})
