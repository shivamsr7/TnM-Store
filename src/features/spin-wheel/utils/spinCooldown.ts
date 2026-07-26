const STORAGE_KEY = "tnm-last-spin";

const COOLDOWN_HOURS = 24;

export function saveLastSpin() {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString());
}

export function getLastSpin() {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearLastSpin() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getRemainingTime() {
  const lastSpin = getLastSpin();

  if (!lastSpin) return 0;

  const expires =
    new Date(lastSpin).getTime() +
    COOLDOWN_HOURS * 60 * 60 * 1000;

  return Math.max(0, expires - Date.now());
}

export function canSpin() {
  return getRemainingTime() === 0;
}