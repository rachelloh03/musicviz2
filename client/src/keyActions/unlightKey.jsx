import {
  blackKeys,
  blackKeyWidth,
  blackKeyHeight,
  whiteKeyWidth,
  whiteKeyHeight,
  blackKeyY,
  whiteKeyY,
  getX,
} from "./constants";

export const unlightKey = (canvas, midi) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const isBlackKey = blackKeys.includes(midi);

  const width = isBlackKey ? blackKeyWidth : whiteKeyWidth;
  const height = isBlackKey ? blackKeyHeight : whiteKeyHeight;
  const y = isBlackKey ? blackKeyY : whiteKeyY;
  ctx.clearRect(
    getX(canvas, midi, isBlackKey) - 1,
    y - 1,
    width + 2,
    height + 2
  );
};
