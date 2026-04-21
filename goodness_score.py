import json
import numpy as np
import pandas as pd
from scipy.stats import entropy

chick_prompts = ["ask_me_now", "blue_monk", "brazil", "but_beautiful", 
              "dusk_in_sandi", "how_deep_is_the_ocean", "it_could_happen_to_you", 
              "monks_dream", "oblivion", "round_midnight"]
keith_prompts = ["answer_me", "pt_i_royal", 'pt_ii_royal',
                 "pt_iii_royal", "pt_iv_royal",
                 "pt_i_salle", "pt_ii_salle", "pt_iii_salle",
                 "part_vii", "part_viii"]
jordan_prompts = ["jordan_trading_0", "jordan_trading_1", "jordan_trading_2", "jordan_trading_3", "jordan_trading_4",
                  "jordan_trading_5", "jordan_trading_6", "jordan_trading_7", "jordan_trading_9", "jordan_trading_11", 
                  "jordan_trading_12", "jordan_trading_13", "jordan_trading_14"]
unmusical_prompts = ["single_note_0", "single_note_1",
                     "smash_0", "smash_1",
                     "smash_2", "smash_3",
                     "smash_4", "smash_5",
                     "smash_6", "two_note_0"]
all_prompts = chick_prompts + keith_prompts + jordan_prompts + unmusical_prompts

data_types = ["pitch", "dur", "time"]
NUM_HEADS = 16
base_path = "/scratch/rjloh/attention_weights"
MAX_WINDOW_SIZE = 120

rows = []
for prompt in all_prompts:
    if prompt in chick_prompts:
        label = "chick"
    elif prompt in keith_prompts:
        label = "keith"
    elif prompt in jordan_prompts:
        label = "jordan"
    else:
        label = "unmusical"

    for data_type in data_types:
        for head in range(NUM_HEADS):
            filepath = f"{base_path}/{prompt}/{prompt}{head}_{data_type}.ts"
            with open(filepath) as f:
                raw = f.read()
            json_str = raw[raw.index("["):raw.rindex("]")+1]
            notes = json.loads(json_str)

            entropies = []
            concentrations = []

            for note in notes:
                attn = np.array(note["attention"])

                # skip prompt notes with all-zero attention
                if attn.sum() == 0:
                    continue

                # entropy (lower = more focused)
                num_tokens_in_window = sum(x != 0 for x in attn)
                entropies.append(entropy(attn)/np.log(num_tokens_in_window))
            
            rows.append({
                "prompt": prompt,
                "data_type": data_type,
                "head": head,
                "label": label,
                "avg_entropy": np.mean(entropies),
                "std_entropy": np.std(entropies),
                "max_entropy": np.max(entropies),
                "min_entropy": np.min(entropies)
            })

df = pd.DataFrame(rows)
df.to_csv("norm_entropies.csv", index=False)
# df = pd.read_csv("norm_entropies.csv")

# find the most discriminative combos where chick and keith are combined into one category
results = []
for (head, dtype), group in df.groupby(["head", "data_type"]):
    chick_keith_ent = group[group.label.isin(["chick", "keith"])]["avg_entropy"].mean()
    jordan_ent = group[group.label == "jordan"]["avg_entropy"].mean()
    unmusical_ent = group[group.label == "unmusical"]["avg_entropy"].mean()

    # entropy: jordan < chick_keith < unmusical (more musical = more focused = lower entropy)
    correct_order_ent = jordan_ent < chick_keith_ent < unmusical_ent
    separation_ent = unmusical_ent - jordan_ent

    results.append({
        "head": head,
        "data_type": dtype,
        "chick_keith_ent": round(chick_keith_ent, 3),
        "jordan_ent": round(jordan_ent, 3),
        "unmusical_ent": round(unmusical_ent, 3),
        "correct_order": correct_order_ent,
        "diff_between_jordan_unmusical": round(separation_ent, 3),
    })

results_df = pd.DataFrame(results)
results_df.to_csv("discriminative_results_norm_entropies.csv", index=False)