std::pair<Token, float> MusicTransformer::generateNewToken(int32_t forceAtTime) {
    if (inputData.size() % 3 != 0) {
        throw std::runtime_error("inputData must be a multiple of 3");
    }

    const int lookback = std::max(static_cast<int>(inputData.size() - 120), 0);
    std::vector history(inputData.begin() + lookback, inputData.end());
    int32_t offset = 0;
    if (!history.empty()) {
        offset = minTime(history);
    }

    // Relativize time in the history buffer
    for (size_t i = 0; i < history.size(); i++) {
        if (i % 3 == 0) {
            history[i] -= offset;
        }
    }

    history.insert(history.begin(), Vocab::Anticipate);

    Token newToken{-1, -1, -1};
    float noteEntropy = 0.0f;

    for (int i = 0; i < 3; i++) {
        std::vector<float> scores;
        if (paused.get()) {
            auto result = runModelAndGetAttnHeadEntropy(history, i);
            scores = result.first;
            noteEntropy += result.second;
        } else {
            scores = runModelAndGetLogits(history);
        }
        safeLogits(scores, i % 3);
        if (i == 0) {
            // If forceAtTime is not -1, then pass it by removing the offset
            futureLogits(scores, currentTime - offset, forceAtTime != -1 ? forceAtTime - offset : -1);
        } else if (i == 1) {
            durLogits(scores);
        } else if (i == 2) {
            instrLogits(scores);
        }
        int32_t token = sampleTopP(scores, 0.9, modelConfig.outputTemperatures[i]);

        history.push_back(token);

        if (i == 0) {
            newToken.time = token + offset;

            // If we reached the end of the trading sequence, return a REST
            if (modelConfig.inputMode == InputMode::Trading && (token + offset >= nextTradingStop())) {
                newToken.time = nextTradingStop();
                newToken.duration = Vocab::DurOffset + modelConfig.outputBarLength - 1;
                newToken.note = Vocab::Rest;
                return newToken;
            }

            // If we are building a chord, increment the currentChordSize
            if ((token + offset) == currentTime) {
                currentChordSize++;
            } else {
                currentChordSize = 1;
            }
        } else if (i == 1) {
            newToken.duration = token;
        } else if (i == 2) {
            newToken.note = token;
        }
    }

    noteEntropy /= 3.0f;
    smoothEntropy = (SMOOTHING_ALPHA * noteEntropy) + (1.0 - SMOOTHING_ALPHA) * smoothEntropy;
    float goodnessScore = 1.0f - smoothEntropy;
    return {newToken, goodnessScore};
}