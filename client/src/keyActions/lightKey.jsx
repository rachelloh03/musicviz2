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

export const lightKey = (canvas, midi, rgba) => {
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const isBlackKey = blackKeys.includes(midi);

  ctx.strokeStyle = rgba;
  ctx.fillStyle = rgba;

  // ctx.strokeStyle = color;
  // ctx.fillStyle = color;

  // if (color == "red") {
  //   ctx.strokeStyle = `rgba(255,0,0,${alpha})`;
  //   ctx.fillStyle = `rgba(255,0,0,${alpha})`;
  // }

  const width = isBlackKey ? blackKeyWidth : whiteKeyWidth;
  const height = isBlackKey ? blackKeyHeight : whiteKeyHeight;
  const y = isBlackKey ? blackKeyY : whiteKeyY;
  ctx.beginPath();
  ctx.rect(getX(canvas, midi, isBlackKey), y, width, height);
  ctx.fill();
  ctx.restore();
};
