import i18n from '../i18n';

/**
 * Maps raw document type or formatted document name to the translated name in active language.
 */
export function getTranslatedDocType(rawType: string): string {
  if (!rawType) return '';
  const normalized = rawType.toUpperCase().replace(/[\s-]/g, '_');

  if (normalized.includes('COMMUNITY') || normalized.includes('CASTE') || normalized.includes('ST_CERTIFICATE')) {
    return i18n.t('document_names.COMMUNITY_CERTIFICATE', rawType);
  }
  if (normalized.includes('INCOME')) {
    return i18n.t('document_names.INCOME_CERTIFICATE', rawType);
  }
  if (normalized.includes('MARKSHEET') || normalized.includes('GRADE') || normalized.includes('ACADEMIC')) {
    return i18n.t('document_names.MARKSHEET', rawType);
  }
  if (normalized.includes('BONAFIDE') || normalized.includes('ENROLLMENT')) {
    return i18n.t('document_names.BONAFIDE_CERTIFICATE', rawType);
  }
  if (normalized.includes('BANK') || normalized.includes('PASSBOOK')) {
    return i18n.t('document_names.BANK_DOCUMENT', rawType);
  }
  if (normalized.includes('DOMICILE') || normalized.includes('RESIDENCE')) {
    return i18n.t('document_names.DOMICILE_CERTIFICATE', rawType);
  }
  if (normalized.includes('DISABILITY')) {
    return i18n.t('document_names.DISABILITY_CERTIFICATE', rawType);
  }
  if (normalized.includes('IDENTITY') || normalized.includes('AADHAAR')) {
    return i18n.t('document_names.IDENTITY_DOCUMENT', rawType);
  }

  // Fallback to title case
  return rawType.replace(/_/g, ' ');
}
