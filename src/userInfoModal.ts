import { ModalBuilder, ActionRowBuilder, TextInputBuilder, GuildMember, ModalSubmitInteraction, TextInputStyle, GuildMemberRoleManager } from 'discord.js';

import { BotConfig } from './types';

/**
 * Create a modal to ask user information
 * @param {ModalData} data - The modal data
 * @returns {Promise<ModalBuilder>} - The created modal
 */
const createModal = async (data: BotConfig["modal"]): Promise<ModalBuilder> => {
  const modal = new ModalBuilder().setCustomId('utt-alumni-bot-id').setTitle(data.title);

  const firstNameComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('firstName')
    .setLabel(data.firstNameLabel)
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(16)
    .setPlaceholder(data.firstNamePlaceholder)
    .setRequired(true)) as ActionRowBuilder<TextInputBuilder>;
  const nameComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('name')
    .setLabel(data.familyNameLabel)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(data.familyNamePlaceholder)
    .setRequired(true)) as ActionRowBuilder<TextInputBuilder>;
  const graduationYearComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('graduationYear')
    .setLabel(data.graduationYearLabel)
    .setStyle(TextInputStyle.Short)
    .setMinLength(4)
    .setMaxLength(4)
    .setPlaceholder(data.graduationYearPlaceholder)
    .setRequired(true)) as ActionRowBuilder<TextInputBuilder>;
  const educationComponent = new ActionRowBuilder().addComponents(new TextInputBuilder()
    .setCustomId('education')
    .setLabel(data.educationLabel)
    .setStyle(TextInputStyle.Short)
    .setMinLength(2)
    .setMaxLength(5)
    .setPlaceholder(data.educationPlaceholder)
    .setRequired(true)) as ActionRowBuilder<TextInputBuilder>;

  modal.addComponents([
    firstNameComponent,
    nameComponent,
    graduationYearComponent,
    educationComponent,
  ]);
  return modal;
}

/**
 * Validate the modal
 * @param {ModalSubmitInteraction} interaction - Interaction data
 * @param {string} roleId - The role to add to the user
 * @return {void}
 */
async function onModalSubmit(interaction: ModalSubmitInteraction, roleId: string): Promise<void> {
  if (!interaction.member) {
    return;
  }

  if (interaction.customId === 'utt-alumni-bot-id') {
    const firstName = interaction.fields.getTextInputValue('firstName');
    const familyName = interaction.fields.getTextInputValue('name');
    const graduationYear = interaction.fields.getTextInputValue('graduationYear');
    const education = interaction.fields.getTextInputValue('education');

    const separatorLength = 5; // spaces and dash
    const suffixLength = graduationYear.length + education.length;
    const fullNameLength = firstName.length + familyName.length;
    if (separatorLength + suffixLength + fullNameLength > 32) {
      await (interaction.member as GuildMember).setNickname(`${firstName} ${familyName.charAt(0).toUpperCase()}. - ${graduationYear} ${education}`);
    } else {
      await (interaction.member as GuildMember).setNickname(`${firstName} ${familyName.toUpperCase()} - ${graduationYear} ${education}`);
    }

    const roles = await (interaction.member as GuildMember).guild.roles.fetch();
    const myRole = roles.find((role) => role.id === roleId);
    if (!myRole) {
      console.warn(`Role ${roleId} not found. Check you have the correct id.`);
      return;
    }
    await (interaction.member.roles as GuildMemberRoleManager).add(myRole.id);
  }
}

export { createModal, onModalSubmit };