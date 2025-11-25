export const MAX_FUTURE_NOTES = 100;
export const TIME_THRESH = 100;

export const COLORS = [
  [153, 85, 187],
  [255, 105, 179],
  [255, 255, 153],
  [43, 217, 198],
];
// export const COLORS = [[67, 49, 143]];

export const MAIN_COLOR = [67, 49, 143];

export function getChordKey(token) {
  return `${token.time.toFixed(3)}-${token.duration.toFixed(3)}`;
}

// ashley work here
// export function getRepetition(qRef, curTime) {
//   console.log("repeition:");
// }
