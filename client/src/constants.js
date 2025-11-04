export const TIME_THRESH = 100;
export const FUTURE_NOTES_THRESH = 500;

export function getAlpha(curTime, startTime) {
  return (1.0 / TIME_THRESH) * curTime + (1.0 - startTime / TIME_THRESH); // linear alpha
}
