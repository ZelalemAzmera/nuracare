export const TSOM_TYPES = {
  NONE: 'none',
  ORTHODOX: 'orthodox',
  ISLAMIC: 'islamic'
};

export function isRamadanActive() {
  return true;
}

export function isFastingToday(mode: string) {
  if (mode === TSOM_TYPES.ISLAMIC) {
    return isRamadanActive();
  }

  if (mode !== TSOM_TYPES.ORTHODOX) return false;

  const today = new Date();
  const dayOfWeek = today.getDay(); 
  
  if (dayOfWeek === 3 || dayOfWeek === 5) {
    return true;
  }

  const month = today.getMonth(); 
  const date = today.getDate();

  if (month === 7 && date >= 7 && date <= 22) {
    return true;
  }

  if ((month === 2 && date >= 11) || month === 3 || (month === 4 && date <= 4)) {
    return true;
  }

  return false;
}

export function getCurrentFastName(mode: string) {
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

export function checkGlycemicSpikeRisk(foodArr: string[]) {
  const highCarbKeywords = ['injera', 'potato', 'pasta', 'bread', 'rice', 'macaroni', 'dinich'];
  const proteinKeywords = ['shiro', 'misir', 'lentils', 'beans', 'tofu', 'nuts', 'seeds', 'kik'];
  
  let carbCount = 0;
  let proteinCount = 0;

  for (const f of foodArr) {
    const lower = f.toLowerCase();
    if (highCarbKeywords.some(k => lower.includes(k))) carbCount++;
    if (proteinKeywords.some(k => lower.includes(k))) proteinCount++;
  }

  if (carbCount >= 2 && proteinCount === 0) {
    return true;
  }
  return false;
}
