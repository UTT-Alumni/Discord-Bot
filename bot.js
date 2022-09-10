const { Client, GatewayIntentBits } = require('discord.js')
const { Modal, TextInputComponent, showModal } = require('discord-modals')


require('dotenv').config()

const messages = require('./messages.json')

const start = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      // GatewayIntentBits.GuildMembers,
      // GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMembers,
      // GatewayIntentBits.MessageContent
    ],
  })
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity("for new users to join", {type : "WATCHING"});
  })

  client.on('createInteraction', async (interaction) => {
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
  })

  client.on('guildMemberAdd', async (member) => {
    console.log(member)
    console.log(member.user.username + " has joined the server! ");

    // Generates the name of the server according to serverID provided in config.json file
    const serverName = client.guilds.cache.get(process.env.SERVER_ID);
    // Generates the name of the channel according to channelID provided in config.json file
    const channel = client.channels.cache.get(process.env.CHANNEL_ID)

    // Sends custom message mentioning the user and adds rules provided in config.json file
    channel.send(`Hello, ${member.user} welcome to ${serverName}!\n`); // TODO: send message with button
  })

  client.on('modalSubmit', async (submitModal) => {
    console.log('utt-alumni-bot', submitModal)
    if (submitModal.customId === 'utt-alumni-bot-id') {
      const firstName = submitModal.getTextInputValue('firstName')
      const name = submitModal.getTextInputValue('name')
      const graduationYear = submitModal.getSelectMenuValues('graduationYear')
      const education = submitModal.getSelectMenuValues('education')

      console.log(firstName, name, graduationYear, education)
      // TODO: change nickname with max length
      submitModal.member.setNickname(`${firstName} ${name} - ${graduationYear} ${education}`)
      const myRole = submitModal.member.guild.roles.cache.find(role => role.name === process.env.ROLE_ID);
      submitModal.member.roles.add(myRole.id);

      await submitModal.reply(messages.fr.welcome)


    }
  })

  await client.login(process.env.DISCORD_TOKEN)
}

start().then(() => {
  console.log('UTT Alumni Discord bot started.')
})
