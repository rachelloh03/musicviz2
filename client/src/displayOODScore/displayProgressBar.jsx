export const displayProgressBar = (canvas, oodScore) => {
  if (!canvas || oodScore == null) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  const idScore = 100 - oodScore; // more intuitive to show how in-distribution the prompt is

  // Bar parameters
  const barHeight = height * 0.1;
  const barY = height - barHeight - 10;
  const barX = 10; // 10px padding
  const barWidth = width;

  // Rotate 180 degrees
  ctx.save();
  const centerX = width / 2;
  const centerY = height - barHeight / 2 - 10;
  ctx.translate(centerX, centerY);
  ctx.rotate(Math.PI); // 180 degrees rotation
  ctx.translate(-centerX, -centerY);

  // Draw background bar
  ctx.fillStyle = "#ccc";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Draw foreground bar proportional to score
  const filledWidth = (idScore / 100) * barWidth;

  let fillColor;
  if (idScore < 50) fillColor = "#f00";
  else if (idScore < 75) fillColor = "#ff0";
  else fillColor = "#0f0";

  ctx.fillStyle = fillColor;
  ctx.fillRect(barX, barY, filledWidth, barHeight);

  // Draw numeric score text
  ctx.font = `${barHeight * 1.2}px sans-serif`;
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${idScore.toFixed(0)}`, width / 2, barY + 35); // slightly above the bar

  ctx.restore();
};
