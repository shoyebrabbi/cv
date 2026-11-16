import type { ContactItem } from '../types/cv';

const DEFAULT_CONTACT_ICONS: Record<ContactItem['type'], string> = {
  location: '📍',
  phone: '📞',
  email: '✉️',
  website: '🌐',
  linkedin: '💼',
  github: '🐙',
  custom: '🔗',
};

export function getDefaultContactIcon(type: ContactItem['type']): string {
  return DEFAULT_CONTACT_ICONS[type];
}

export function getContactIcon(contact: Pick<ContactItem, 'type' | 'icon'>): string {
  if (contact.icon === '' || contact.icon === 'none') {
    return '';
  }
  if (contact.icon !== undefined && contact.icon !== null) {
    return contact.icon.trim();
  }
  return getDefaultContactIcon(contact.type);
}
