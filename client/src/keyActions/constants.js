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
  const curWidth = getWidth(curTime, startTime, isBlackKey);
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
    const delta = (keyWidth - curWidth) / 2;
    return canvas.width - (x - delta);
  }
}

export const MAX_DENSITY = 20;

export function getAlpha(curTime, startTime) {
  return Math.min(
    (1.0 / TIME_THRESH) * curTime + (1.0 - startTime / TIME_THRESH),
    1.0
  ); // linear alpha, clip at 1.0
}

export function getColor(curTime, startTime) {
  const timePercentChange = Math.min(
    1.0,
    Math.max(0.0, (startTime - curTime) / (TIME_THRESH / 3))
  );
  // blue to red --> as curTime gets closer to startTime
  const r = parseInt((1 - timePercentChange) * 255);
  const g = 0;
  const b = parseInt(timePercentChange * 255);
  console.log("r and b: ", r, " and ", b);
  return `rgba(${r}, ${g}, ${b},${getAlpha(curTime, startTime)})`;
}

export function getHeight(curTime, startTime, isBlackKey) {
  const keyHeight = isBlackKey ? blackKeyHeight : whiteKeyHeight;

  const t = (curTime - (startTime - TIME_THRESH)) / TIME_THRESH;
  return -keyHeight * Math.min(t, 1); // linear height, clip at full height
}

export const SKINNY_TIME = 50;

export function getWidth(curTime, startTime, isBlackKey) {
  const fullWidth = isBlackKey ? blackKeyWidth : whiteKeyWidth;
  if (curTime <= startTime) {
    return fullWidth;
  } else if (curTime >= startTime + SKINNY_TIME) {
    return playingNoteWidth;
  } else {
    const t = (curTime - startTime) / SKINNY_TIME;
    return fullWidth + t * (playingNoteWidth - fullWidth);
  }
}
