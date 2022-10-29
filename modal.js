const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js')

/**
 * Create a modal to ask user information
 * @param {String} title - The modal title
 * @param {String} firstNameLabel - The first name field label
 * @param {String} firstNamePlaceholder - The first name placeholder
 * @param {String} familyNameLabel - The family name field label
 * @param {String} familyNamePlaceholder - The family name placeholder
 * @param {String} graduationYearLabel - The graduation field label
 * @param {String} graduationYearPlaceholder - The graduation placeholder
 * @param {String} educationLabel - The education field label
 * @param {String} educationPlaceholder - The education placeholder
 * @returns {Promise<ModalBuilder>} - The created modal
 */
const createModal = async (
  {
    title,
    firstNameLabel,
    firstNamePlaceholder,
    familyNameLabel,
    familyNamePlaceholder,
    graduationYearLabel,
    graduationYearPlaceholder,
    educationLabel,
    educationPlaceholder,
  },
) => {
  const modal = new ModalBuilder().setCustomId('utt-alumni-bot-id').setTitle(title)

  const firstNameComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('firstName')
    .setLabel(firstNameLabel)
    .setStyle('Short')
    .setMinLength(1)
    .setMaxLength(16)
    .setPlaceholder(firstNamePlaceholder)
    .setRequired(true))
  const nameComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('name')
    .setLabel(familyNameLabel)
    .setStyle('Short')
    .setPlaceholder(familyNamePlaceholder)
    .setRequired(true))
  const graduationYearComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('graduationYear')
    .setLabel(graduationYearLabel)
    .setStyle('Short')
    .setMinLength(4)
    .setMaxLength(4)
    .setPlaceholder(graduationYearPlaceholder)
    .setRequired(true))
  const educationComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('education')
    .setLabel(educationLabel)
    .setStyle('Short')
    .setMinLength(2)
    .setMaxLength(5)
    .setPlaceholder(educationPlaceholder)
    .setRequired(true))

  modal.addComponents([
    firstNameComponent,
    nameComponent,
    graduationYearComponent,
    educationComponent,
  ])
  return modal
}

/**
 * Validate the modal
 * @param {BaseInteraction} interaction - Interaction data
 * @param {String} roleId - The role to add to the user
 * @return {void}
 */
async function onModalSubmit(interaction, roleId) {
  if (interaction.customId === 'utt-alumni-bot-id') {
    const firstName = interaction.fields.getTextInputValue('firstName')
    const familyName = interaction.fields.getTextInputValue('name')
    const graduationYear = interaction.fields.getTextInputValue('graduationYear')
    const education = interaction.fields.getTextInputValue('education')

    const separatorLength = 5 // spaces and dash
    const suffixLength = graduationYear.length + education.length
    const fullNameLength = firstName.length + familyName.length
    if (separatorLength + suffixLength + fullNameLength > 32) {
      await interaction.member.setNickname(`${firstName} ${familyName.charAt(0).toUpperCase()}. - ${graduationYear} ${education}`)
    } else {
      await interaction.member.setNickname(`${firstName} ${familyName.toUpperCase()} - ${graduationYear} ${education}`)
    }

    const roles = await interaction.member.guild.roles.fetch()
    const myRole = roles.find((role) => role.id === roleId)
    if (!myRole) {
      console.warn(`Role ${roleId} not found. Check you have the correct id.`)
      return
    }
    await interaction.member.roles.add(myRole.id)
  }
}

module.exports = { createModal, onModalSubmit }
