import {
  blackKeyHeight,
  whiteKeyHeight,
  blackKeys,
} from "../src/keyActions/constants";

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
  console.log("onsetDensityNorm:", onsetDensityNorm);
  return `rgba(${r}, ${g}, ${b},${getAlpha(curTime, startTime)})`;
}

export function getHeight(curTime, startTime, midi) {
  const isBlackKey = blackKeys.includes(midi);
  const keyHeight = isBlackKey ? blackKeyHeight : whiteKeyHeight;

  const t = (curTime - (startTime - TIME_THRESH)) / TIME_THRESH;
  return -keyHeight * Math.min(t, 1); // linear height, clip at full height
}

// ashley work here
// export function getRepetition(qRef, curTime) {
//   console.log("repeition:");
// }
