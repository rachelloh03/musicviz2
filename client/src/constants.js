export const TIME_THRESH = 100;

export function getAlpha(curTime, startTime) {
  return (1.0 / TIME_THRESH) * curTime + (1.0 - startTime / TIME_THRESH); // linear alpha
}

export const MAX_FUTURE_NOTES = 100;
