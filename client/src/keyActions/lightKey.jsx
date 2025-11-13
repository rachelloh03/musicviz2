import {
  blackKeys,
  blackKeyWidth,
  whiteKeyWidth,
  blackKeyY,
  whiteKeyY,
  getX,
} from "./constants";

export const lightKey = (
  canvas,
  midi,
  rgba,
  height,
  isPointCloud = false,
  numPoints = 150
) => {
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

  const width = isBlackKey ? blackKeyWidth : whiteKeyWidth;
  const y = isBlackKey ? blackKeyY : whiteKeyY;
  const x = getX(canvas, midi, isBlackKey);

  // point cloud
  if (isPointCloud) {
    for (let i = 0; i < numPoints; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;

      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // simple rectangle
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};
