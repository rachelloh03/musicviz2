import {
  blackKeys,
  blackKeyY,
  whiteKeyY,
  getX,
  getHeight,
  getWidth,
  getAlpha,
} from "./constants";

export const lightKey = (
  canvas,
  midi,
  curTime,
  startTime,
  color,
  futureThresh,
  roli = null
) => {
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const isBlackKey = blackKeys.includes(midi);
  const rgba = color;
  const height = getHeight(curTime, startTime, isBlackKey, futureThresh);
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

  const alpha = getAlpha(curTime, startTime, futureThresh);

  // roli
  if (roli) {
    roli.send([0x90, midi, Math.floor(alpha * 127)]); // send alpha as velocity
  }
};
