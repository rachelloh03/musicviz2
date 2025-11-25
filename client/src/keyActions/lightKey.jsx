import {
  blackKeys,
  blackKeyY,
  whiteKeyY,
  getX,
  getHeight,
  getWidth,
} from "./constants";

export const lightKey = (canvas, midi, curTime, startTime, color) => {
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const isBlackKey = blackKeys.includes(midi);
  const rgba = color;
  const height = getHeight(curTime, startTime, isBlackKey);
  const width = getWidth(curTime, startTime, isBlackKey);

  ctx.strokeStyle = rgba;
  ctx.fillStyle = rgba;

  const y = isBlackKey ? blackKeyY : whiteKeyY;
  const x = getX(canvas, midi, isBlackKey, curTime, startTime);

  // simple rectangle
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.restore();
};
