import json
import numpy as np
import pandas as pd
from scipy.stats import entropy

chick_prompts = ["ask_me_now", "blue_monk", "brazil", "but_beautiful", 
              "dusk_in_sandi", "how_deep_is_the_ocean", "it_could_happen_to_you", 
              "monks_dream", "oblivion", "round_midnight"]
keith_prompts = ["answer_me", "part_i_royal_festival_hall", 'part_ii_royal_festival_hall',
                 "part_iii_royal_festival_hall", "part_iv_royal_festival_hall",
                 "part_i_salle_pleyel", "part_ii_salle_pleyel", "part_iii_salle_pleyel",
                 "part_vii", "part_viii"]
jordan_prompts = ["jordan0", "jordan1", "jordan2", "jordan3", "jordan4",
                  "jordan5", "jordan6", "jordan7", "jordan8", "jordan9"]
unmusical_prompts = ["extreme_register_0", "extreme_register_1", 
                     "random_0", "random_1",
                     "single_note_0", "single_note_1",
                     "smash_0", "smash_1",
                     "two_note_0", "two_note_1"]
all_prompts = chick_prompts + keith_prompts + jordan_prompts + unmusical_prompts

data_types = ["pitch", "dur", "time"]
NUM_HEADS = 16
base_path = "/scratch/rjloh/attention_weights"

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

                # option 1: entropy (lower = more focused)
                attn_norm = attn / (attn.sum() + 1e-9)
                entropies.append(entropy(attn_norm + 1e-9))

                # option 2: top-5 concentration (higher = more focused)
                sorted_attn = np.sort(attn)[::-1]
                top_k_sum = sorted_attn[:5].sum()
                total_sum = sorted_attn.sum()
                concentrations.append(top_k_sum / (total_sum + 1e-9))

            if len(entropies) == 0:
                continue

            rows.append({
                "prompt": prompt,
                "data_type": data_type,
                "head": head,
                "label": label,
                "avg_entropy": np.mean(entropies),
                "std_entropy": np.std(entropies),
                "avg_concentration": np.mean(concentrations),
                "std_concentration": np.std(concentrations),
            })

df = pd.DataFrame(rows)
df.to_csv("arcs_summary.csv", index=False)

# df = pd.read_csv("arcs_summary.csv")

# find most discriminative combos
# results = []
# for (head, dtype), group in df.groupby(["head", "data_type"]):
#     chick_ent = group[group.label == "chick"]["avg_entropy"].mean()
#     keith_ent = group[group.label == "keith"]["avg_entropy"].mean()
#     jordan_ent = group[group.label == "jordan"]["avg_entropy"].mean()
#     unmusical_ent = group[group.label == "unmusical"]["avg_entropy"].mean()

#     chick_con = group[group.label == "chick"]["avg_concentration"].mean()
#     keith_con = group[group.label == "keith"]["avg_concentration"].mean()
#     jordan_con = group[group.label == "jordan"]["avg_concentration"].mean()
#     unmusical_con = group[group.label == "unmusical"]["avg_concentration"].mean()

#     # for entropy: chick < keith < jordan < unmusical (more musical = more focused = lower entropy)
#     correct_order_ent = chick_ent < keith_ent < jordan_ent < unmusical_ent
#     separation_ent = unmusical_ent - chick_ent

#     # for concentration: chick > keith > jordan > unmusical (more musical = more focused = higher concentration)
#     correct_order_con = chick_con > keith_con > jordan_con > unmusical_con
#     separation_con = chick_con - unmusical_con

#     results.append({
#         "head": head,
#         "data_type": dtype,
#         # entropy
#         "chick_ent": round(chick_ent, 3),
#         "keith_ent": round(keith_ent, 3),
#         "jordan_ent": round(jordan_ent, 3),
#         "unmusical_ent": round(unmusical_ent, 3),
#         "correct_order_ent": correct_order_ent,
#         "separation_ent": round(separation_ent, 3),
#         # concentration
#         "chick_con": round(chick_con, 3),
#         "keith_con": round(keith_con, 3),
#         "jordan_con": round(jordan_con, 3),
#         "unmusical_con": round(unmusical_con, 3),
#         "correct_order_con": correct_order_con,
#         "separation_con": round(separation_con, 3),
#     })

# results_df = pd.DataFrame(results)

# print("=== TOP BY ENTROPY (correct order first, then separation) ===")
# print(results_df.sort_values(["correct_order_ent", "separation_ent"], ascending=[False, False]).head(10).to_string())

# print("\n=== TOP BY CONCENTRATION (correct order first, then separation) ===")
# print(results_df.sort_values(["correct_order_con", "separation_con"], ascending=[False, False]).head(10).to_string())

results = []
for (head, dtype), group in df.groupby(["head", "data_type"]):
    chick_keith_ent = group[group.label.isin(["chick", "keith"])]["avg_entropy"].mean()
    jordan_ent = group[group.label == "jordan"]["avg_entropy"].mean()
    unmusical_ent = group[group.label == "unmusical"]["avg_entropy"].mean()

    chick_keith_con = group[group.label.isin(["chick", "keith"])]["avg_concentration"].mean()
    jordan_con = group[group.label == "jordan"]["avg_concentration"].mean()
    unmusical_con = group[group.label == "unmusical"]["avg_concentration"].mean()

    # entropy: chick_keith < jordan < unmusical (more musical = more focused = lower entropy)
    correct_order_ent = chick_keith_ent < jordan_ent < unmusical_ent
    separation_ent = unmusical_ent - chick_keith_ent

    # concentration: chick_keith > jordan > unmusical (more musical = higher concentration)
    correct_order_con = chick_keith_con > jordan_con > unmusical_con
    separation_con = chick_keith_con - unmusical_con

    results.append({
        "head": head,
        "data_type": dtype,
        "chick_keith_ent": round(chick_keith_ent, 3),
        "jordan_ent": round(jordan_ent, 3),
        "unmusical_ent": round(unmusical_ent, 3),
        "correct_order_ent": correct_order_ent,
        "separation_ent": round(separation_ent, 3),
        "chick_keith_con": round(chick_keith_con, 3),
        "jordan_con": round(jordan_con, 3),
        "unmusical_con": round(unmusical_con, 3),
        "correct_order_con": correct_order_con,
        "separation_con": round(separation_con, 3),
    })

results_df = pd.DataFrame(results)
results_df.to_csv("discriminative_results.csv", index=False)

# print("=== TOP BY ENTROPY ===")
# print(results_df.sort_values(["correct_order_ent", "separation_ent"], ascending=[False, False]).head(10).to_string())

# print("\n=== TOP BY CONCENTRATION ===")
# print(results_df.sort_values(["correct_order_con", "separation_con"], ascending=[False, False]).head(10).to_string())