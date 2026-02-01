
import { supabase } from '../lib/supabase';

// Helper to get current user ID
const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
};

export const SupabaseService = {
    /**
     * Sincroniza el log de una sesión finalizada.
     */
    async saveSessionLog(log) {
        try {
            const userId = await getUserId();
            if (!userId) throw new Error("Sesión expirada. Por favor, vuelve a iniciar sesión.");

            // Validation: Ensure we have data
            if (!log.data || Object.keys(log.data).length === 0) {
                throw new Error("No hay datos de entrenamiento para guardar.");
            }

            // 1. Insert Session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .insert({
                    user_id: userId,
                    meso_cycle: log.meso,
                    week: log.week,
                    session_name: log.sessionName,
                    soreness: log.feedback.soreness,
                    pump: log.feedback.pump,
                    notes: log.feedback.notes || ''
                })
                .select()
                .single();

            if (sessionError) {
                console.error("Supabase Session Error:", sessionError);
                throw new Error(`Error al crear sesión: ${sessionError.message}`);
            }

            // 2. Prepare Sets Data
            const sessionId = sessionData.id;
            const flatSets = [];

            Object.keys(log.data).forEach(exerciseId => {
                const sets = log.data[exerciseId];
                sets.forEach((set, index) => {
                    // Only push sets that have at least one value to keep DB clean
                    if (set.weight !== '' || set.reps !== '') {
                        flatSets.push({
                            session_id: sessionId,
                            exercise_name: exerciseId,
                            weight: parseFloat(set.weight) || 0,
                            reps: parseInt(set.reps) || 0,
                            rir: parseInt(set.rir) || 0,
                            target_rir: 0,
                            set_order: index
                        });
                    }
                });
            });

            if (flatSets.length === 0) {
                throw new Error("No se detectaron series válidas (vacías).");
            }

            // 3. Insert Sets
            const { error: setsError } = await supabase
                .from('sets')
                .insert(flatSets);

            if (setsError) {
                console.error("Supabase Sets Error:", setsError);
                // Attempt to delete the dangling session if sets fail (Atomic-ish)
                await supabase.from('sessions').delete().eq('id', sessionId);
                throw new Error(`Error al guardar series: ${setsError.message}`);
            }

            return sessionData;
        } catch (err) {
            console.error("Critical Sync Failure:", err);
            throw err; // Re-throw to be caught by UI
        }
    },

    /**
     * Obtiene el historial de sesiones con manejo de errores robusto.
     */
    async getSessionLogs() {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select(`
                    *,
                    sets (*)
                `)
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Fetch Logs Error:", err);
            throw new Error("No se pudo conectar con la base de datos para obtener el historial.");
        }
    },

    /**
     * Obtiene el último rendimiento de un ejercicio específico.
     */
    async getLastExercisePerformance(exerciseName) {
        try {
            const userId = await getUserId();
            if (!userId) return null;

            const { data, error } = await supabase
                .from('sets')
                .select(`
                    weight,
                    reps,
                    rir,
                    sessions!inner(user_id, date)
                `)
                .eq('exercise_name', exerciseName)
                .eq('sessions.user_id', userId)
                .order('sessions(date)', { ascending: false })
                .limit(1);

            if (error) {
                console.warn(`History fetch failed for ${exerciseName}:`, error.message);
                return null; // Don't crash the UI for history fails
            }

            return data && data.length > 0 ? data[0] : null;
        } catch (err) {
            return null;
        }
    }
};

