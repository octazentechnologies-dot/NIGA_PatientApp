import type { AppLanguage } from '../localization/types';

export function getRelationDisplayName(
  name: string,
  language: AppLanguage,
): string {
  if (!name) return '';
  if (language !== 'mr') return name;

  const lower = name.toLowerCase().trim();
  switch (lower) {
    case 'spouse':
      return 'जोडीदार (पती/पत्नी)';
    case 'father':
      return 'वडील';
    case 'mother':
      return 'आई';
    case 'son':
      return 'मुलगा';
    case 'daughter':
      return 'मुलगी';
    case 'brother':
      return 'भाऊ';
    case 'sister':
      return 'बहीण';
    case 'grandfather':
      return 'आजोबा';
    case 'grandmother':
      return 'आजी';
    case 'uncle':
      return 'काका / मामा';
    case 'aunt':
      return 'काकू / मावशी';
    case 'nephew':
      return 'पुतण्या / भाचा';
    case 'niece':
      return 'पुतणी / भाची';
    case 'cousin':
      return 'कझिन';
    case 'friend':
      return 'मित्र / मैत्रीण';
    case 'other':
      return 'इतर';
    default:
      return name;
  }
}

export function getGenderDisplayName(
  name: string,
  language: AppLanguage,
): string {
  if (!name) return '';
  if (language !== 'mr') return name;

  const lower = name.toLowerCase().trim();
  switch (lower) {
    case 'male':
      return 'पुरुष';
    case 'female':
      return 'स्त्री';
    case 'other':
      return 'इतर';
    default:
      return name;
  }
}
