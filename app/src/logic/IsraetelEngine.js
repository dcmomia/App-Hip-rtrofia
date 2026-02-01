/**
 * Israetel Engine: Core logic for training adjustments.
 */

/**
 * Suggests load adjustment for the NEXT SET (Real-time).
 */
export const getRealTimeRecommendation = (reps, rir, targetRange, targetRIR) => {
    const repsNum = parseInt(reps);
    const rirNum = parseInt(rir);
    const [minReps, maxReps] = targetRange.split('-').map(Number);

    if (isNaN(repsNum) || isNaN(rirNum)) return null;

    // Logic: If we are way above target RIR or Reps, increase weight NOW.
    if (repsNum >= maxReps && rirNum > targetRIR) {
        return { action: 'INCREASE', value: 2.5, message: '¡Demasiado fácil! Sube +2.5kg el siguiente set.' };
    }
    // If we hit target reps but RIR is too low (grind), maybe maintain or focus on form.
    if (repsNum >= minReps && rirNum < targetRIR) {
        return { action: 'MAINTAIN', value: 0, message: 'En el límite. Mantén peso y prioriza técnica.' };
    }
    // If we fail to hit min reps.
    if (repsNum < minReps) {
        return { action: 'DECREASE', value: -2.5, message: 'Fallo prematuro. Baja -2.5kg para completar el volumen.' };
    }

    return { action: 'PERFECT', value: 0, message: '¡Target alcanzado! Sigue así.' };
};

/**
 * Calculates if weight should increase for the next session.
 * Logic: If target reps reached with proper RIR in at least 50% of sets.
 */
export const calculateNextLoad = (setsData, targetRepsRange, targetRIR) => {
    const maxReps = parseInt(targetRepsRange.split('-')[1]) || parseInt(targetRepsRange);

    const validSets = setsData.filter(s => s.weight && s.reps);
    if (validSets.length === 0) return 0;

    const successfulSets = validSets.filter(s =>
        parseInt(s.reps) >= maxReps && parseInt(s.rir) >= targetRIR
    );

    if (successfulSets.length >= validSets.length / 2) {
        return 2.5;
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
