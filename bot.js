const { Client, GatewayIntentBits } = require('discord.js')
const { Modal, TextInputComponent, showModal } = require('discord-modals')

require('dotenv').config()

const messages = require('./messages.json')

const start = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      // GatewayIntentBits.MessageContent
    ],
  })
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  })

  client.on('interactionCreate', async (interaction) => {
    console.log('test', interaction)

    if (interaction.commandName === 'role') {
      const modal = new Modal()
        .setCustomId('utt-alumni-bot-id')
        .setTitle('Modal')
      const firstNameComponent = new TextInputComponent()
        .setCustomId('firstName')
        .setLabel('Prénom')
        .setStyle('SHORT')
        .setPlaceholder('Écrivez votre prénom')
        .setRequired(true)
      const nameComponent = new TextInputComponent()
        .setCustomId('name')
        .setLabel('Nom de famille')
        .setStyle('SHORT')
        .setPlaceholder('Écrivez votre nom de famille')
        .setRequired(true)
      const graduationYearComponent = new TextInputComponent()
        .setCustomId('graduationYear')
        .setLabel('Année de diplôme')
        .setStyle('SHORT')
        .setPlaceholder('Votre année de diplôme (espérée si vous êtes étudiant)')
        .setRequired(true)
      const educationComponent = new TextInputComponent()
        .setCustomId('education')
        .setLabel('Branche')
        .setStyle('SHORT')
        .setPlaceholder('Branche ingénieur, master ou doctorat')
        .setRequired(true)
      modal.addComponents([firstNameComponent, nameComponent, graduationYearComponent, educationComponent])
      await showModal(modal, {
        client, // Client to show the Modal through the Discord API.
        interaction, // Show the modal with interaction data.
      })
    }
  })

  client.on('modalSubmit', async (submitModal) => {
    console.log('utt-alumni-bot', submitModal)
    if (submitModal.customId === 'utt-alumni-bot-id') {
      const firstName = submitModal.getTextInputValue('firstName')
      const name = submitModal.getTextInputValue('name')
      const graduationYear = submitModal.getSelectMenuValues('graduationYear')
      const education = submitModal.getSelectMenuValues('education')
      console.log(firstName, name, graduationYear, education)
      await submitModal.reply(messages.fr.welcome)
    }
  })

  await client.login(process.env.DISCORD_TOKEN)
}

start().then(() => {
  console.log('UTT Alumni Discord bot started.')
})
