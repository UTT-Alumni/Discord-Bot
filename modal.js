const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js')

/**
 * Create a modal to ask user information
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
  const modal = new ModalBuilder().setCustomId('utt-alumni-bot-id').setTitle('Modal')

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
    const name = interaction.fields.getTextInputValue('name')
    const graduationYear = interaction.fields.getTextInputValue('graduationYear')
    const education = interaction.fields.getTextInputValue('education')

    let fullName = `${firstName} ${name} - ${graduationYear} ${education}`
    // Check if the full name can be handled by discord
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
    await interaction.member.setNickname(fullName)
    const myRole = interaction.member.guild.roles.cache.find(
      (role) => role.id === roleId,
    )
    interaction.member.roles.add(myRole.id)
  }
}

module.exports = { createModal, onModalSubmit }
