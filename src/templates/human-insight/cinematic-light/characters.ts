import castData from './character-casts.json';

export interface CharacterCast {
  id: string;
  name: string;
  descriptionVi: string;
  members: Record<string, string>;
  continuity: string;
  castLockPrompt: string;
}

export const CHARACTER_CASTS =
  castData as Record<string, CharacterCast>;

export function inferCastId(
  text: string,
  category?: string,
): string | undefined {
  const lower = `${text} ${category ?? ''}`.toLowerCase();

  if (
    lower.includes('bữa cơm') ||
    lower.includes('gia đình') ||
    lower.includes('con cái') ||
    lower.includes('bố mẹ') ||
    lower.includes('nhà mình')
  ) {
    return 'family-young-01';
  }

  if (
    lower.includes('ông bà') ||
    lower.includes('tuổi già')
  ) {
    return 'elderly-couple-01';
  }

  if (
    lower.includes('vợ chồng') ||
    lower.includes('người yêu') ||
    lower.includes('hôn nhân')
  ) {
    return 'couple-young-01';
  }

  if (
    lower.includes('cô gái') ||
    lower.includes('phụ nữ')
  ) {
    return 'solo-female-01';
  }

  if (
    lower.includes('chàng trai') ||
    lower.includes('người trẻ')
  ) {
    return 'solo-male-01';
  }

  return undefined;
}
