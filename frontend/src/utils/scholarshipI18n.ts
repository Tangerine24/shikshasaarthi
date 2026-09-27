import i18n from '../i18n';

/**
 * Maps raw database scholarship title to translated title in the active language.
 */
export function getTranslatedScholarshipTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  const titleLower = rawTitle.toLowerCase();

  // Match key patterns
  if (titleLower.includes('higher education support') || titleLower.includes('tribal higher')) {
    return i18n.t('scholarship_names.s1', rawTitle);
  }
  if (titleLower.includes('undergraduate academic assistance') || titleLower.includes('st undergraduate')) {
    return i18n.t('scholarship_names.s2', rawTitle);
  }
  if (titleLower.includes('merit support') || titleLower.includes('higher education merit')) {
    return i18n.t('scholarship_names.s3', rawTitle);
  }
  if (titleLower.includes('overseas') || titleLower.includes('nos')) {
    return i18n.t('scholarship_names.s4', rawTitle);
  }
  if (titleLower.includes('fellowship') || titleLower.includes('nfst')) {
    return i18n.t('scholarship_names.s5', rawTitle);
  }
  if (titleLower.includes('pre-matric') || titleLower.includes('class ix')) {
    return i18n.t('scholarship_names.s6', rawTitle);
  }
  if (titleLower.includes('chief minister') || titleLower.includes('education grant')) {
    return i18n.t('scholarship_names.s7', rawTitle);
  }
  if (titleLower.includes('e-kalyan') || titleLower.includes('post-matric')) {
    return i18n.t('scholarship_names.s8', rawTitle);
  }
  if (titleLower.includes('birsa')) {
    return i18n.t('scholarship_names.s5', rawTitle);
  }

  return rawTitle;
}
