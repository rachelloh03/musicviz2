export const TIME_THRESH = 100;

export function getAlpha(curTime, startTime) {
  return (1.0 / TIME_THRESH) * curTime + (1.0 - startTime / TIME_THRESH); // linear alpha
}

export const MAX_FUTURE_NOTES = 100;

export const EPS = 1e-6;
export const MAX_NUM_POINTS = 500;

export function getNumPoints(qRef) {
  // num points correlates positively with onset density
  const uniqueOnsets = new Set();
  let firstOnset;
  let lastOnset;
  let lastDuration;
  for (let i = 0; i < qRef.current.length; i++) {
    const token = qRef.current[i];
    if (i == 0) {
      firstOnset = token.time;
    }
    if (!uniqueOnsets.has(token.time)) {
      uniqueOnsets.add(token.time);
      lastOnset = token.time;
      lastDuration = token.duration;
    }
  }
  const n = uniqueOnsets.size;
  const onsetDensity =
    (100 * n) / Math.max(EPS, lastOnset + lastDuration - firstOnset);
  return MAX_NUM_POINTS * onsetDensity; // use gradient color instead of point clouds; ask perry how to make it look more aesthetic
}
