const unitMap = {
  m: 60,
  h: 3600,
  d: 86400
};

export const parseDurationToSeconds = (value) => {
  if (!value) return null;
  const m = value.match(/^(\d+)([mhd])$/i);
  if (!m) return null;
  return Number(m[1]) * unitMap[m[2].toLowerCase()];
};

export const toIsoAfterSeconds = (seconds) => {
  if (!seconds) return null;
  return new Date(Date.now() + seconds * 1000).toISOString();
};
