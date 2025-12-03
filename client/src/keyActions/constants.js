const FUTURE_RANGE_COLOR = "rgba(133, 243, 205, 0.5)";
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

export function getAlpha(curTime, startTime, futureThresh) {
  const alpha = Math.min(
    (1.0 / (futureThresh + 1e-6)) * curTime +
      (1.0 - startTime / (futureThresh + 1e-6)),
    1.0
  );
  return alpha; // linear alpha, clip at 1.0
}

export function getColor(curTime, startTime, futureThresh) {
  const timePercentChange = Math.min(
    1.0,
    Math.max(0.0, 1 - (startTime - curTime) / (futureThresh + 1e-6))
  );
  // blue to red --> as curTime gets closer to startTime
  const r = parseInt(timePercentChange * 255);
  const g = 0;
  const b = parseInt((1 - timePercentChange) * 255);
  return `rgba(${r}, ${g}, ${b},${getAlpha(curTime, startTime, futureThresh)})`;
}

export function getHeight(curTime, startTime, isBlackKey, futureThresh) {
  const keyHeight = isBlackKey ? blackKeyHeight : whiteKeyHeight;

  const t = (curTime - (startTime - futureThresh)) / (futureThresh + 1e-6);
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

export function lightFutureRange(q, canvas, curTime, futureThresh) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  q.forEach((token) => {
    const { time, _duration, _instrument, note } = token;
    if (time > curTime && time - curTime <= futureThresh) {
      const isBlackKey = blackKeys.includes(note);
      const x = getX(canvas, note, isBlackKey, curTime, time);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  });

  if (minX === Number.POSITIVE_INFINITY) return;

  ctx.strokeStyle = FUTURE_RANGE_COLOR;
  ctx.fillStyle = FUTURE_RANGE_COLOR;

  // simple rectangle
  ctx.beginPath();
  ctx.rect(minX, whiteKeyY, maxX - minX + whiteKeyWidth, -whiteKeyHeight);
  ctx.fill();
  ctx.restore();
}
