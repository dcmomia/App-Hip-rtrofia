
import { supabase } from '../lib/supabase';

// Helper to get current user ID
const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
};

export const SupabaseService = {
    /**
     * Sincroniza el log de una sesión. 
     * Implementa lógica de "Atomic-ish" con guardado local persistente si falla.
     */
    async saveSessionLog(log) {
        try {
            const userId = await getUserId();
            if (!userId) throw new Error("Sesión expirada. Por favor, vuelve a iniciar sesión.");

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

            if (sessionError) throw sessionError;

            // 2. Prepare Sets
            const sessionId = sessionData.id;
            const flatSets = [];

            Object.keys(log.data).forEach(exerciseId => {
                log.data[exerciseId].forEach((set, index) => {
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
                await supabase.from('sessions').delete().eq('id', sessionId);
                throw new Error("No se detectaron series válidas.");
            }

            // 3. Insert Sets
            const { error: setsError } = await supabase
                .from('sets')
                .insert(flatSets);

            if (setsError) {
                await supabase.from('sessions').delete().eq('id', sessionId);
                throw setsError;
            }

            return sessionData;
        } catch (err) {
            console.error("Supabase Sync Failed. Fallback to LocalQueue triggered.", err);
            // PERSISTENCE GUARD: Si falla la nube, guardamos en una cola local de reintento
            this.queueForRetry(log);
            throw new Error(`Fallo de conexión: Los datos se han guardado localmente y se sincronizarán pronto.`);
        }
    },

    /**
     * Guarda el log en una cola local de reintento.
     */
    queueForRetry(log) {
        const queue = JSON.parse(localStorage.getItem('hx_sync_queue') || '[]');
        queue.push({ ...log, timestamp: Date.now(), retryCount: 0 });
        localStorage.setItem('hx_sync_queue', JSON.stringify(queue));
    },

    /**
     * Intenta sincronizar datos pendientes en la cola.
     */
    async processSyncQueue() {
        const queue = JSON.parse(localStorage.getItem('hx_sync_queue') || '[]');
        if (queue.length === 0) return;

        console.log(`HX-System: Attempting to sync ${queue.length} pending sessions...`);
        const remainingQueue = [];

        for (const log of queue) {
            try {
                await this.saveSessionLog(log);
                console.log(`HX-System: Successfully synced session: ${log.sessionName}`);
            } catch (e) {
                if (log.retryCount < 5) {
                    remainingQueue.push({ ...log, retryCount: log.retryCount + 1 });
                }
            }
        }
        localStorage.setItem('hx_sync_queue', JSON.stringify(remainingQueue));
    },

    /**
     * Obtiene el historial de sesiones.
     */
    async getSessionLogs() {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*, sets (*)')
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            throw new Error("Error al obtener historial.");
        }
    },

    /**
     * Obtiene el último rendimiento de un ejercicio.
     */
    async getLastExercisePerformance(exerciseName) {
        try {
            const userId = await getUserId();
            if (!userId) return null;

            const { data, error } = await supabase
                .from('sets')
                .select('weight, reps, rir, sessions!inner(user_id, date)')
                .eq('exercise_name', exerciseName)
                .eq('sessions.user_id', userId)
                .order('sessions(date)', { ascending: false })
                .limit(1);

            return data?.[0] || null;
        } catch (err) {
            return null;
        }
    }
};


