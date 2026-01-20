import { RADIUS } from "../constants";

export const displaySpeedometer = (canvas, oodScore) => {
  if (!canvas || oodScore == null) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;

  // Speedometer parameters
  const centerX = width - RADIUS - 10;
  const centerY = RADIUS + 10;

  // Rotate 180 degrees
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(Math.PI);
  ctx.translate(-centerX, -centerY);

  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#ccc";
  ctx.arc(centerX, centerY, RADIUS, Math.PI, 2 * Math.PI);
  ctx.stroke();

  const idScore = 100 - oodScore; // more intuitive to show how in-distribution the prompt is

  // Draw colored arc proportional to score
  ctx.beginPath();
  ctx.lineWidth = 6;
  const endAngle = Math.PI + (idScore / 100) * Math.PI;
  if (idScore < 50) ctx.strokeStyle = "#f00";
  else if (idScore < 75) ctx.strokeStyle = "#ff0";
  else ctx.strokeStyle = "#0f0";
  ctx.arc(centerX, centerY, RADIUS, Math.PI, endAngle);
  ctx.stroke();

  // Draw needle
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000";
  const needleAngle = Math.PI + (idScore / 100) * Math.PI;
  const needleLength = RADIUS * 0.9;
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(needleX, needleY);
  ctx.stroke();

  // Draw numeric score
  ctx.font = `${RADIUS * 0.5}px sans-serif`;
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(idScore.toFixed(0), centerX, centerY);

  ctx.restore();
};
