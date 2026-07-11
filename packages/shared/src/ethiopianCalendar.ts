export const TSOM_TYPES = {
  NONE: 'none',
  ORTHODOX: 'orthodox',
  ISLAMIC: 'islamic'
};

/**
 * Approximate Ramadan check. 
 * Since Islamic calendar is lunar, this is a simplified mock for the hackathon
 * assuming Ramadan is occurring right now, or during specific months.
 */
export function isRamadanActive() {
  // Mocking that Ramadan is currently active for demonstration purposes
  return true;
}

export function isFastingToday(mode) {
  if (mode === TSOM_TYPES.ISLAMIC) {
    return isRamadanActive();
  }

  if (mode !== TSOM_TYPES.ORTHODOX) return false;

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 3 = Wed, 5 = Fri
  
  if (dayOfWeek === 3 || dayOfWeek === 5) {
    return true;
  }

  const month = today.getMonth(); // 0 = Jan
  const date = today.getDate();

  if (month === 7 && date >= 7 && date <= 22) {
    return true;
  }

  // Approximate Abiy Tsom for 2024 (March 11 - May 4)
  if ((month === 2 && date >= 11) || month === 3 || (month === 4 && date <= 4)) {
    return true;
  }

  return false;
}

export function getCurrentFastName(mode) {
  if (mode === TSOM_TYPES.ISLAMIC) {
    if (isRamadanActive()) return "Ramadan Fast";
    return "None";
  }

  if (mode !== TSOM_TYPES.ORTHODOX) return "None";
  if (!isFastingToday(mode)) return "None";

  const today = new Date();
  const month = today.getMonth();
  const date = today.getDate();

  if (month === 7 && date >= 7 && date <= 22) {
    return 'Tsome Filseta';
  }

  if ((month === 2 && date >= 11) || month === 3 || (month === 4 && date <= 4)) {
    return 'Abiy Tsom (Great Lent)';
  }

  const dayOfWeek = today.getDay();
  if (dayOfWeek === 3) return 'Wednesday Fast';
  if (dayOfWeek === 5) return 'Friday Fast';

  return 'Regular Fast';
}

/**
 * Checks if a specific meal/food choice during fasting poses a high glycemic spike risk.
 * For example, Yetsom Beyaynetu with extra injera and potatoes can cause an energy crash.
 */
export function checkGlycemicSpikeRisk(foodArr) {
  const highCarbKeywords = ['injera', 'potato', 'pasta', 'bread', 'rice', 'macaroni', 'dinich'];
  const proteinKeywords = ['shiro', 'misir', 'lentils', 'beans', 'tofu', 'nuts', 'seeds', 'kik'];
  
  let carbCount = 0;
  let proteinCount = 0;

  for (const f of foodArr) {
    const lower = f.toLowerCase();
    if (highCarbKeywords.some(k => lower.includes(k))) carbCount++;
    if (proteinKeywords.some(k => lower.includes(k))) proteinCount++;
  }

  // If heavy carbs without enough protein to balance it
  if (carbCount >= 2 && proteinCount === 0) {
    return true;
  }
  return false;
}
