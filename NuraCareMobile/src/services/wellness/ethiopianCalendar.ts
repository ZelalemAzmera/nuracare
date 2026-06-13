export const TSOM_TYPES = {
  NONE: 'None',
  ORTHODOX: 'Orthodox Christian (Tsom)',
  MUSLIM: 'Muslim (Ramadan)'
};

// Simplified Ethiopian fasting calendar approximation for 2024-2026.
// In a full production app, this would use a proper Ethiopic calendar library.
// Abiy Tsom (Great Lent) - usually ~55 days before Easter.
// Filseta - usually August 1st-16th (Gregorian August 7 - 22 approx)

export function isFastingToday(mode) {
  if (mode !== TSOM_TYPES.ORTHODOX) return false;

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 3 = Wed, 5 = Fri
  
  // Every Wednesday and Friday is a fasting day in Orthodox Christianity
  // (with exceptions like the 50 days after Easter, but we'll simplify here).
  if (dayOfWeek === 3 || dayOfWeek === 5) {
    return true;
  }

  // Very simplified Abiy Tsom / Filseta detection
  const month = today.getMonth(); // 0 = Jan
  const date = today.getDate();

  // Approximate Filseta: August 7 - August 22
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
  if (mode !== TSOM_TYPES.ORTHODOX) return null;
  if (!isFastingToday(mode)) return null;

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
