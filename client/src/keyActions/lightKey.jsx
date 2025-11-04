import {
  blackKeys,
  blackKeyWidth,
  blackKeyHeight,
  whiteKeyWidth,
  whiteKeyHeight,
  blackKeyY,
  whiteKeyY,
  getX,
  NUM_POINTS,
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

  // simple rectangle
  const width = isBlackKey ? blackKeyWidth : whiteKeyWidth;
  const height = isBlackKey ? blackKeyHeight : whiteKeyHeight;
  const y = isBlackKey ? blackKeyY : whiteKeyY;
  ctx.beginPath();
  ctx.rect(getX(canvas, midi, isBlackKey), y, width, height);
  ctx.fill();
  ctx.restore();

  // const width = isBlackKey ? blackKeyWidth : whiteKeyWidth;
  // const height = isBlackKey ? blackKeyHeight : whiteKeyHeight;
  // const y = isBlackKey ? blackKeyY : whiteKeyY;
  // const x = getX(canvas, midi, isBlackKey);

  // ctx.fillStyle = rgba;

  // // point cloud
  // for (let i = 0; i < NUM_POINTS; i++) {
  //   const px = x + Math.random() * width;
  //   const py = y + Math.random() * height;

  //   ctx.beginPath();
  //   ctx.arc(px, py, 1.8, 0, Math.PI * 2);
  //   ctx.fill();
  // }
  ctx.restore();
};
