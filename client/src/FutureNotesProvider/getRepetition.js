export function getRepetition(qRef, curTime) {
  // console.log(qRef.current);
  
  
  const notes = qRef.current;
  if (!notes || notes.length < 2) return false;
  // console.log("Raw notes:", notes.map(n => ({
  //   time: n.time,
  //   note: n.note,
  //   duration: n.duration
  // })));

  // Extract arrays like Python
  const onsets = notes.map(n => n.time);
  const pitches = notes.map(n => n.note);
  const durations = notes.map(n => n.duration);

  // ---- GROUPING ONSETS INTO CHORD-SETS ----
  let prev_onset = null;
  let onset_groupings = [];
  let current_group = new Set();

  for (let i = 0; i < onsets.length; i++) {
    const onset = onsets[i];
    if (prev_onset === null) {
      prev_onset = onset;
    }

    if (prev_onset === null || onset - prev_onset <= 1) {
      current_group.add(pitches[i]);
    } else {
      onset_groupings.push(current_group);
      current_group = new Set([pitches[i]]);
    }
    prev_onset = onset; 
  }
  if (current_group.size > 0) onset_groupings.push(current_group);

  // ---- PARAMETERS LIKE PYTHON ----
  const num_groupings = onset_groupings.length;
  const min_onset = Math.min(...onsets);
  const max_onset = Math.max(...onsets);

  const beat_len_ms = 50;
  const measure_len_ms = 4 * beat_len_ms;
  const total_duration = max_onset - min_onset;
  const num_measures = Math.max(1, total_duration / measure_len_ms);
  const notes_per_measure = num_groupings / num_measures;
  const density = notes_per_measure / 8;

  let max_pattern = Math.max(
    1,
    Math.min(8, Math.ceil(pitches.length * 0.25))
  );
  // console.log(max_pattern);

  let min_repeats = Math.max(4, Math.round(4 * density));
  // console.log(min_repeats);

  // ---- HASH chord-sets like Python ----
  const hashed_seq = onset_groupings.map(ch =>
    Array.from(ch).sort((a, b) => a - b).join(",")
  );

  // console.log("onset_groupings:", onset_groupings.map(s => Array.from(s)));
  // console.log("hashed_seq:", hashed_seq);
  // console.log("max_pattern:", max_pattern);
  // console.log("min_repeats:", min_repeats);
  // console.log("hashed_seq.length:", hashed_seq.length);

  let i = 0;
  let repetitions = 0;

  // ---- REPETITION DETECTION ----
  while (i <= hashed_seq.length - 2) {
    
    let found = false;

    for (let L = 1; L <= max_pattern; L++) {
      if (i + L * min_repeats > hashed_seq.length) continue;

      const pattern = hashed_seq.slice(i, i + L);
      let count = 1;

      while (true) {
        const start = i + count * L;
        const end = start + L;
        if (end > hashed_seq.length) break;
        const slice = hashed_seq.slice(start, end);
        if (!arraysEqual(slice, pattern)) break;
        count++;
      }
      
      if (count >= min_repeats) {
        
        repetitions++;
        i += count * L;
        found = true;
        break;
      }
    }

    if (!found) i++;
  }

  return repetitions > 0;
}

// Helper to compare patterns
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
