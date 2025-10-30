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

export const blackKeyWidth = 7;
export const whiteKeyWidth = 11; //11
export const blackKeyHeight = 150;
export const whiteKeyHeight = 227;

export const blackKeyY = 100;
export const whiteKeyY = 20;
export const xOffset = -216;

export function getWhiteX(midi) {
  const whiteX = whiteKeys.indexOf(midi) * whiteKeyWidth;
  // console.log(
  //   "set xOffset =",
  //   400 - whiteKeys.indexOf(midi) * whiteKeyWidth + 2
  // );
  return whiteX + xOffset;
}

export function getX(canvas, midi, isBlackKey) {
  // 60 = C4
  let x;
  if (!isBlackKey) {
    x = getWhiteX(midi);
  } else {
    const closestWhiteKey = whiteKeys.filter((n) => n < midi).pop();
    x = getWhiteX(closestWhiteKey) + 0.5 * whiteKeyWidth;
  }
  return canvas.width - x;
}

// export function getAlpha()
