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
  client.on('ready', async () => {
    console.log(`UTT Alumni Discord bot logged in as ${client.user.tag}!`)
    const guild = await client.guilds.fetch(process.env.SERVER_ID)
    console.log(`Discord guild ${process.env.SERVER_ID} retrieved.`)
    const channel = await guild.channels.fetch(process.env.CHANNEL_ID)
    console.log(`Discord channel ${process.env.CHANNEL_ID} retrieved.`)
    const channelMessages = await channel.messages.fetch()

    console.log(`Fetch ${channelMessages.size} messages on channel ${process.env.CHANNEL_ID}.`)

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
        content: '**Bienvenue sur le Discord officiel du réseau des alumni de l’UTT !**\r\n\r\n' +
            'Ce serveur vise à servir de lieu d’échanges informels entre les alumni, étudiants et personnels de ' +
            'l\'Université de Technologie de Troyes.\r\n\r\n' +
            'Deux règles permettent de fournir un espace de discussion sécurisé pour toutes et tous, et en garantissant ' +
            'la liberté d’expression de chacun :\r\n ' +
            '**1. Sont sanctionnés d’un kick immédiat (précédé d’un message personnel expliquant les raisons), ' +
            'puis d’un bannissement complet en cas de récidive, par les modérateur.ice.s :**\r\n ' +
            '    -Les propos ouvertement racistes, sexistes et toutes autres formes de discriminations ;\r\n' +
            '    -Les contenus violents, pornographiques, etc. ;\r\n' +
            '    -La publication des informations personnelles, privées ou non, d’un.e membre du serveur, sans l’accord ' +
            'préalable de la personne concernée.\r\n' +
            '**2. Sont sanctionnés d’un avertissement public par les modérateur.ice.s, d’un kick en cas de récidive, ' +
            'puis si nécessaire d’un bannissement complet par les modérateur.ice.s :**\r\n' +
            '    -Les floods, spams, et autre interventions dérangeant la quiétude du serveur ;\r\n' +
            '    -Les publicités, notamment commerciales, sans autorisation préalable. Cette autorisation est fournie par ' +
            'au moins 5 likes par n’importe quel.le.s membres, sur un post présentant rapidement le contenu de la publicité.\r\n\r\n' +
            'En cliquant sur le bouton ci-après vous acceptez le règlement et renseignez des informations relatives à votre ' +
            'passage à l\'UTT.\r\n' +
            'Aucune information personnelle n\'est stockée suite à cette procédure.',
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

  await client.login(process.env.DISCORD_TOKEN)
}

start().then(() => {
  console.log('UTT Alumni Discord bot started.')
})
