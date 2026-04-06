import pandas as pd

df = pd.read_csv("significant_entropy.csv") # only contains the entropy that we care about (head 10 time, head 3 pitch, head 9 dur)
result = df.groupby(['prompt', 'artist']).agg({
        'avg_window_entropy': 'mean',
        'min_window_entropy': 'mean',
        'max_window_entropy': 'mean'
    }).reset_index()
result.columns = ['prompt', 'artist', 'avg_entropy', 'min_entropy', 'max_entropy']
result.to_csv("three_token_entropy.csv", index=False)
