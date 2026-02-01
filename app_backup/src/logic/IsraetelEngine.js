/**
 * Israetel Engine: Core logic for training adjustments.
 */

/**
 * Calculates if weight should increase for the next session.
 * Logic: If target reps reached with proper RIR in at least 50% of sets, or if top set was easy.
 */
export const calculateNextLoad = (setsData, targetRepsRange, targetRIR) => {
    // targetRepsRange is string "10-12", we take the upper bound
    const maxReps = parseInt(targetRepsRange.split('-')[1]) || parseInt(targetRepsRange);

    // Check if any set reached target reps with RIR >= target
    const successfulSets = setsData.filter(s =>
        parseInt(s.reps) >= maxReps && parseInt(s.rir) >= targetRIR
    );

    if (successfulSets.length >= 1) {
        return 2.5; // Suggest +2.5kg
    }
    return 0;
};

export const calculateVolumeAdjust = (soreness, pump) => {
    /**
     * Logic:
     * - Soreness 0-1 & Pump 4-5 -> +1 Series (Hypertrophy stimulus under-recovered)
     * - Soreness 2-3 -> Maintain (Sweet spot)
     * - Soreness 4-5 -> -1 Series (Overreaching)
     */
    if (soreness <= 1 && pump >= 4) return 1;
    if (soreness >= 4) return -1;
    return 0;
};

export const calculateE1RM = (weight, reps, rir) => {
    // Brzycki Formula for 1RM: Weight / (1.0278 - (0.0278 * Reps))
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);
    const rirNum = parseInt(rir);

    const totalReps = repsNum + rirNum;
    if (totalReps <= 1) return weightNum;
    return weightNum / (1.0278 - (0.0278 * totalReps));
};

export const calculateTonnage = (setsData) => {
    return setsData.reduce((acc, set) => acc + (parseFloat(set.weight) * parseInt(set.reps)), 0);
};
