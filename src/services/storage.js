/**
 * Storage Service for CLUBROD Local Recovery
 * Manages reading/writing from localStorage safely.
 */

export const getStorage = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(data) ? data : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to set localStorage key: ${key}`, err);
  }
};

export const KEYS = {
  AGENTS: 'cc-agents',
  ADVERTISERS: 'cc-advertisers',
  CARS: 'cc-cars',
  LEADS: 'cc-leads',
  FIRST_TOUCH: 'cc-first-touch',
  CAR_FEATURES: 'cc-car-features',
};
