export const TIME_THRESH = 100;
export const MAX_DENSITY = 20;

export function getAlpha(curTime, startTime) {
  return Math.min(
    (1.0 / TIME_THRESH) * curTime + (1.0 - startTime / TIME_THRESH),
    1.0
  ); // linear alpha, clip at 1.0
}

export const MAX_FUTURE_NOTES = 100;

export function getColor(qRef, curTime, startTime) {
  const uniqueOnsets = new Set();

  for (let i = 0; i < qRef.current.length; i++) {
    const token = qRef.current[i];

    if (!uniqueOnsets.has(token.time)) {
      uniqueOnsets.add(token.time);
    }
  }
  const onsetDensity = uniqueOnsets.size;
  const onsetDensityNorm = Math.min(1, onsetDensity / MAX_DENSITY); // normalized

  // blue to red --> low to high onsetDensity
  const r = parseInt(onsetDensityNorm * 255);
  const g = 0;
  const b = parseInt((1 - onsetDensityNorm) * 255);
  return `rgba(${r}, ${g}, ${b},${getAlpha(curTime, startTime)})`;
}
