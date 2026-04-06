import pandas as pd

GOOD_ENTROPY_THRESH = 4.143
BAD_ENTROPY_THRESH = 4.246

df = pd.read_csv("three_token_entropy.csv") # each prompt (there are 43) has its corresponding entropy (avg of pitch, dur, time entropies)

def predict_label(entropy):
    if entropy <= GOOD_ENTROPY_THRESH:
        return "good"
    elif entropy >= BAD_ENTROPY_THRESH:
        return "bad"
    else:
        return "in-between"

def true_label(artist):
    if artist in ["chick", "keith"]:
        return "chick_keith"
    elif artist == "jordan":
        return "jordan"
    else:
        return "unmusical"

def is_correct(predicted, artist):
    true = true_label(artist)
    if true == "chick_keith":
        return predicted in ["in-between"]  # either is acceptable
    elif true == "jordan":
        return predicted in ["good"]  # either is acceptable
    elif true == "unmusical":
        return predicted == "bad"

df["predicted"] = df["avg_entropy"].apply(predict_label)
df["correct"] = df.apply(lambda row: is_correct(row["predicted"], row["artist"]), axis=1)

print(f"\n=== ACCURACY ===")
print(f"Total: {len(df)}, Correct: {df['correct'].sum()}, Accuracy: {df['correct'].mean():.2%}")

# summary per prompt
df.to_csv("accuracy_results.csv", index=False)

# summary by group
group_summary = df.groupby("artist").agg(
    correct=("correct", "sum"),
    total=("correct", "count"),
    accuracy=("correct", "mean")
).reset_index()
group_summary.to_csv("accuracy_by_group.csv", index=False)

# overall accuracy
overall = pd.DataFrame([{
    "total": len(df),
    "correct": df["correct"].sum(),
    "accuracy": df["correct"].mean()
}])
overall.to_csv("accuracy_overall.csv", index=False)

# predicted label distribution
dist = df.groupby(["artist", "predicted"]).size().reset_index(name="count")
dist.to_csv("predicted_distribution.csv", index=False)