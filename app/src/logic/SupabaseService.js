
import { supabase } from '../lib/supabase';

// Helper to get current user ID
export const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
};

export const SupabaseService = {
    /**
     * Sincroniza el log de una sesión. 
     * Implementa lógica de "Atomic-ish" con guardado local persistente si falla por RED.
     */
    async saveSessionLog(log) {
        try {
            const res = await this._executeSave(log);
            localStorage.removeItem('hx_last_sync_error');
            return res;
        } catch (err) {
            // AUTH CHECK: No encolamos fallos de auth
            if (err.message.includes("Sesión expirada") || err.status === 401) {
                throw err;
            }

            console.error("Supabase Sync Failed. Fallback to LocalQueue triggered.", err);

            // DEDUPLICACIÓN: Comprobamos si ya está en la cola antes de añadirlo
            const queue = JSON.parse(localStorage.getItem('hx_sync_queue') || '[]');
            const exists = queue.some(item =>
                item.sessionId === log.sessionId &&
                item.meso === log.meso &&
                item.week === log.week
            );

            if (!exists) {
                this.queueForRetry(log);
            }

            localStorage.setItem('hx_last_sync_error', err.message);
            throw new Error(`Sincronización pendiente: Los datos se han guardado localmente debido a: ${err.message}`);
        }
    },

    /**
     * Lógica interna de guardado para evitar duplicación en la cola.
     */
    async _executeSave(log) {
        const userId = await getUserId();
        if (!userId) throw new Error("Sesión expirada. Por favor, vuelve a iniciar sesión.");

        if (!log.data || Object.keys(log.data).length === 0) {
            throw new Error("No hay datos de entrenamiento para guardar.");
        }

        // 1. Check for existing session (Upsert Logic)
        const { data: existingSession } = await supabase
            .from('sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('meso_cycle', log.meso)
            .eq('week', log.week)
            .eq('session_name', log.sessionName)
            .maybeSingle();

        let sessionId;
        if (existingSession) {
            sessionId = existingSession.id;
            console.log("HX-System: Existing session found, updating ID:", sessionId);
            const { error: updateError } = await supabase
                .from('sessions')
                .update({
                    soreness: log.feedback.soreness,
                    pump: log.feedback.pump,
                    notes: log.feedback.notes || '',
                    date: new Date().toISOString().split('T')[0]
                })
                .eq('id', sessionId);

            if (updateError) throw updateError;
        } else {
            // New Session Insert
            const { data: newSession, error: insertError } = await supabase
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

            if (insertError) throw insertError;
            sessionId = newSession.id;
        }

        // 2. Prepare Sets
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
            // If it was a new session and no sets, cleanup (though check is done earlier)
            if (!existingSession) await supabase.from('sessions').delete().eq('id', sessionId);
            throw new Error("No se detectaron series válidas.");
        }

        // 3. Overwrite Sets: Delete then Insert
        await supabase.from('sets').delete().eq('session_id', sessionId);
        const { error: setsError } = await supabase
            .from('sets')
            .insert(flatSets);

        if (setsError) throw setsError;

        return { id: sessionId };
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
        let lastError = null;

        for (const log of queue) {
            try {
                await this._executeSave(log);
                console.log(`HX-System: Successfully synced session: ${log.sessionName}`);
            } catch (e) {
                console.warn(`HX-System: Sync failed for ${log.sessionName}. Reason:`, e.message);
                lastError = e.message;
                // Evitamos duplicados: solo lo re-encolamos si no ha fallado demasiadas veces
                if ((log.retryCount || 0) < 5) {
                    remainingQueue.push({ ...log, retryCount: (log.retryCount || 0) + 1 });
                }
            }
        }

        localStorage.setItem('hx_sync_queue', JSON.stringify(remainingQueue));
        if (lastError) {
            localStorage.setItem('hx_last_sync_error', lastError);
        } else {
            localStorage.removeItem('hx_last_sync_error');
        }
    },

    /**
     * Limpia la cola de sincronización.
     */
    clearSyncQueue() {
        localStorage.removeItem('hx_sync_queue');
        localStorage.removeItem('hx_last_sync_error');
    },

    /**
     * Obtiene los detalles de una sesión específica por su ID/Nombre de programa.
     * En nuestro caso, buscamos por meso, semana y nombre ya que sessionId del programa es estático.
     */
    async getSessionDetails(meso, week, sessionName) {
        try {
            const userId = await getUserId();
            if (!userId) return null;

            const { data, error } = await supabase
                .from('sessions')
                .select('*, sets (*)')
                .eq('user_id', userId)
                .eq('meso_cycle', meso)
                .eq('week', week)
                .eq('session_name', sessionName)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found is fine
                throw error;
            }
            return data;
        } catch (err) {
            console.error("Error fetching session details:", err);
            return null;
        }
    },

    /**
     * Obtiene el historial de sesiones del usuario actual.
     */
    async getSessionLogs() {
        try {
            const userId = await getUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('sessions')
                .select('*, sets (*)')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (error) throw error;
            console.log(`HX-System: Fetched ${data.length} sessions for user ${userId}`);
            return data || [];
        } catch (err) {
            console.error("Error getSessionLogs:", err);
            throw new Error("Error al obtener historial.");
        }
    },

    /**
     * Obtiene el último rendimiento de un ejercicio específico.
     */
    async getLastExercisePerformance(exerciseName) {
        try {
            const userId = await getUserId();
            if (!userId) return null;

            // Correct ordering: foreignTable for joined columns
            const { data, error } = await supabase
                .from('sets')
                .select('weight, reps, rir, sessions!inner(user_id, date)')
                .eq('exercise_name', exerciseName)
                .eq('sessions.user_id', userId)
                .order('date', { foreignTable: 'sessions', ascending: false })
                .limit(1);

            if (error) {
                console.error(`Error fetching history for ${exerciseName}:`, error);
                return null;
            }

            const last = data?.[0];
            if (last) {
                console.log(`HX-System: Last perf for ${exerciseName}: ${last.weight}kg x ${last.reps}`);
            }
            return last || null;
        } catch (err) {
            console.error(`Exception in getLastExercisePerformance for ${exerciseName}:`, err);
            return null;
        }
    }
};


