import { CHIP, VALIDATION } from '../constants';

// ---- Chip number validation ----

export function isValidChipNumber(chipNumber: string): boolean {
  return CHIP.NUMBER_REGEX.test(chipNumber);
}

export function isValidNfcUid(uid: string): boolean {
  return CHIP.NFC_UID_REGEX.test(uid);
}

export function formatChipNumber(chipNumber: string): string {
  // Format as XXX-XXXX-XXXX-XXXX for display
  if (chipNumber.length !== 15) return chipNumber;
  return `${chipNumber.slice(0, 3)}-${chipNumber.slice(3, 7)}-${chipNumber.slice(7, 11)}-${chipNumber.slice(11)}`;
}


// ---- Phone number ----

export function isValidPhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone);
}


// ---- Date helpers ----

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function petAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();

  if (years === 0) {
    return months <= 0 ? 'Less than 1 month' : `${months} month${months === 1 ? '' : 's'}`;
  }
  if (years === 1 && months < 0) {
    return `${12 + months} months`;
  }
  return `${years} year${years === 1 ? '' : 's'}`;
}


// ---- String helpers ----

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
