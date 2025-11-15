import { TIME_THRESH } from "../../src/constants";

const blackKeysArr = [];

const baseBlackKeys = [1, 3, 6, 8, 10];

for (let j = 0; j < baseBlackKeys.length; j++) {
  const baseKey = baseBlackKeys[j];
  for (let i = 0; i < 11; i++) {
    if ((baseKey == 8 || baseKey == 10) && i == 10) {
      continue;
    } else {
      blackKeysArr.push(baseKey + i * 12);
    }
  }
}

export const blackKeys = blackKeysArr.sort();

export const whiteKeys = Array.from({ length: 128 }, (_, i) => i).filter(
  (num) => !blackKeys.includes(num)
);

export const playingNoteWidth = 3;
export const blackKeyWidth = 7;
export const whiteKeyWidth = 11; //11
export const blackKeyHeight = 155;
export const whiteKeyHeight = 235;

export const blackKeyY = 258;
export const whiteKeyY = 258;
export const xOffset = -216;

export function getWhiteX(midi) {
  const whiteX = whiteKeys.indexOf(midi) * whiteKeyWidth;
  // console.log(
  //   "set xOffset =",
  //   400 - whiteKeys.indexOf(midi) * whiteKeyWidth + 2
  // );
  return whiteX + xOffset;
}

export function getX(canvas, midi, isBlackKey, curTime, startTime) {
  // 60 = C4
  let x;
  const keyWidth = isBlackKey ? blackKeyWidth : whiteKeyWidth;
  if (!isBlackKey) {
    x = getWhiteX(midi);
  } else {
    const closestWhiteKey = whiteKeys.filter((n) => n < midi).pop();
    x = getWhiteX(closestWhiteKey) + 0.5 * whiteKeyWidth;
  }
  if (curTime < startTime) {
    return canvas.width - x;
  } else {
    return canvas.width - (x - keyWidth / 2 + playingNoteWidth / 2);
  }
}

export const MAX_DENSITY = 20;

export function getAlpha(curTime, startTime) {
  return Math.min(
    (1.0 / TIME_THRESH) * curTime + (1.0 - startTime / TIME_THRESH),
    1.0
  ); // linear alpha, clip at 1.0
}

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

export function getHeight(curTime, startTime, isBlackKey) {
  const keyHeight = isBlackKey ? blackKeyHeight : whiteKeyHeight;

  const t = (curTime - (startTime - TIME_THRESH)) / TIME_THRESH;
  return -keyHeight * Math.min(t, 1); // linear height, clip at full height
}

export function getWidth(curTime, startTime, isBlackKey) {
  if (curTime < startTime) {
    return isBlackKey ? blackKeyWidth : whiteKeyWidth;
  } else {
    return playingNoteWidth;
  }
}
