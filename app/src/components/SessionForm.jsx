import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { calculateNextLoad, calculateVolumeAdjust, getRealTimeRecommendation, detectDeloadNeeded } from '../logic/IsraetelEngine';
import { PROGRAM_DATA } from '../data/programData';
import { getSessionDraft, saveSessionDraft } from '../logic/Storage'; // Keep drafts local for safety
import { SupabaseService } from '../logic/SupabaseService';

const SessionForm = ({ appState, setAppState }) => {
    const navigate = useNavigate();
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionData, setSessionData] = useState({});
    const [postSession, setPostSession] = useState({ soreness: 0, pump: 0, fatigue: 3, notes: '' });
    const [exerciseMetadata, setExerciseMetadata] = useState({}); // tempo, sfr
    const [exerciseHistory, setExerciseHistory] = useState({}); // last performance
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [volumeRecommendation, setVolumeRecommendation] = useState(null);


    const location = useLocation();

    // 1. Restore session from draft (ONLY ON MOUNT or MESO/WEEK change)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const targetSessionId = queryParams.get('sessionId');

        const draft = getSessionDraft(targetSessionId || 'none'); // Just to check if we have something

        // Priority 1: Direct link from MacroCycleView (sessionId in URL)
        if (targetSessionId) {
            const currentMeso = PROGRAM_DATA.mesos.find(m => m.id === appState.meso);
            const session = currentMeso.sessions.find(s => s.id === targetSessionId);
            if (session) {
                console.log("HX-System: Opening session from URL", targetSessionId);
                // We use a slight delay or just call the selection logic
                handleSelectSession(session);
                return;
            }
        }

        // Priority 2: Restore previous draft on mount
        const lastDraft = getSessionDraft(); // This might need a better way to find "any" draft, 
        // but typically we'll have it by sessionId. 
        // For now, let's stick to explicitly selecting from the panel or direct link.
    }, [appState.meso, appState.week, location.search]);

    // 2. Fetch recommendations and history when a session is selected
    useEffect(() => {
        if (!selectedSession) return;

        const fetchFeedback = async () => {
            try {
                // Try to process any pending sync items first
                await SupabaseService.processSyncQueue();

                const logs = await SupabaseService.getSessionLogs();
                const lastSameSession = logs.find(l => l.session_name === selectedSession.name);

                // Volume Recommendation based on trends
                if (lastSameSession) {
                    const sameSessions = logs.filter(l => l.session_name === selectedSession.name).slice(0, 3);
                    const adjust = calculateVolumeAdjust(lastSameSession.soreness, lastSameSession.pump, sameSessions);

                    if (adjust !== 0) {
                        setVolumeRecommendation({
                            type: adjust > 0 ? 'INCREASE' : 'DECREASE',
                            msg: adjust > 0 ? '+1 Serie Recomendada (Recuperación Excelente)' : '-1 Serie Recomendada (Fatiga Acumulada)'
                        });
                    } else {
                        setVolumeRecommendation(null);
                    }

                    // Deload Detection
                    const deload = detectDeloadNeeded(logs.slice(0, 5));
                    if (deload) {
                        setVolumeRecommendation(prev => ({
                            type: 'DECREASE',
                            msg: deload.message
                        }));
                    }
                }
            } catch (e) { console.error("Error fetching recs", e); }
        };

        const fetchExerciseHistory = async () => {
            console.log("HX-System: Fetching history for session exercises...");
            try {
                const historyPromises = selectedSession.exercises.map(async (ex) => {
                    const last = await SupabaseService.getLastExercisePerformance(ex.id);
                    return { id: ex.id, last };
                });

                const results = await Promise.all(historyPromises);
                const history = {};
                const newMetadata = { ...exerciseMetadata };

                results.forEach(({ id, last }) => {
                    if (last) history[id] = last;
                    if (!newMetadata[id]) {
                        newMetadata[id] = { tempo_ok: false, sfr: 3 };
                    }
                });

                setExerciseHistory(history);
                setExerciseMetadata(newMetadata);
                console.log(`HX-System: History loaded for ${Object.keys(history).length} exercises`);
            } catch (err) {
                console.error("HX-System: Failure in fetchExerciseHistory", err);
            }
        };

        fetchFeedback();
        fetchExerciseHistory();
    }, [selectedSession]);


    // Find sessions for current meso
    const currentMeso = PROGRAM_DATA.mesos.find(m => m.id === appState.meso);
    const availableSessions = currentMeso ? currentMeso.sessions : [];

    const handleSelectSession = (s) => {
        const draft = getSessionDraft(s.id);

        let dataToSet = {};
        let metadataToSet = {};
        let feedbackToSet = { soreness: 0, pump: 0, fatigue: 3, notes: '' };

        // Check for existing draft for THIS specific session
        if (draft && draft.meso === appState.meso && draft.week === appState.week) {
            console.log("HX-System: Draft match found for session", s.id);
            dataToSet = draft.data;
            metadataToSet = draft.metadata || {};
            feedbackToSet = draft.feedback || feedbackToSet;
        } else {
            console.log("HX-System: Initializing new session data", s.id);
            s.exercises.forEach(ex => {
                dataToSet[ex.id] = Array.from({ length: ex.sets }, () => ({
                    weight: '',
                    reps: '',
                    rir: ex.rir
                }));
                metadataToSet[ex.id] = { tempo_ok: false, sfr: 3 };
            });
        }

        setSessionData(dataToSet);
        setExerciseMetadata(metadataToSet);
        setPostSession(feedbackToSet);
        setSelectedSession(s);
    };


    // 3. Auto-save logic: Sync state to localStorage
    useEffect(() => {
        const hasActualData = Object.keys(sessionData).some(exId =>
            sessionData[exId]?.some(set => set.weight !== '' || set.reps !== '')
        );

        if (selectedSession && (hasActualData || postSession.soreness > 0)) {
            saveSessionDraft(selectedSession.id, {
                meso: appState.meso,
                week: appState.week,
                sessionId: selectedSession.id,
                data: sessionData,
                metadata: exerciseMetadata,
                feedback: postSession
            });
        }
    }, [sessionData, postSession, selectedSession, appState, exerciseMetadata]);

    const handleSetChange = (exerciseId, setIndex, field, value) => {
        setSessionData(prev => {
            const exerciseData = prev[exerciseId];
            if (!exerciseData) return prev;
            const nextSets = [...exerciseData];
            nextSets[setIndex] = { ...nextSets[setIndex], [field]: value };
            return { ...prev, [exerciseId]: nextSets };
        });
    };

    const handleMetadataChange = (exerciseId, field, value) => {
        setExerciseMetadata(prev => ({
            ...prev,
            [exerciseId]: { ...prev[exerciseId], [field]: value }
        }));
    };

    const handleFeedbackChange = (field, value) => {
        setPostSession(prev => ({ ...prev, [field]: value }));
    };


    const isSessionComplete = () => {
        if (!selectedSession || !sessionData) return false;
        const exercisesDone = selectedSession.exercises.every(ex => {
            const data = sessionData[ex.id];
            return data && data.every(set => set.weight !== '' && set.reps !== '');
        });

        // Strict Validation: Feedback is mandatory
        const feedbackDone = postSession.soreness > 0 && postSession.pump > 0;

        return exercisesDone && feedbackDone;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!isSessionComplete()) {
            const missingFeedback = postSession.soreness === 0 || postSession.pump === 0;
            const message = missingFeedback
                ? '¡Atención! Es obligatorio registrar el Soreness y el Pump antes de terminar.'
                : 'Por favor, rellena todos los campos (Peso y Reps) de todos los ejercicios.';
            alert(message);
            return;
        }

        setIsSubmitting(true);
        try {
            const log = {
                meso: appState.meso,
                week: appState.week,
                sessionId: selectedSession.id,
                sessionName: selectedSession.name,
                data: sessionData,
                metadata: exerciseMetadata,
                feedback: postSession
            };

            await SupabaseService.saveSessionLog(log);

            // SUCCESS PATH (Both Sync and Local Enqueue now use this if safe)
            localStorage.removeItem(`hx_session_draft_${selectedSession.id}`);
            alert('¡Sesión Guardada con Éxito!');
            setSelectedSession(null);
            setSessionData({});
            navigate('/');
        } catch (error) {
            console.error("Submission Error Details:", error);

            if (error.message.includes("Sincronización pendiente")) {
                // This is actually a 'safety' path now
                localStorage.removeItem(`hx_session_draft_${selectedSession.id}`);
                alert(error.message); // Tell user it's local
                setSelectedSession(null);
                setSessionData({});
                navigate('/');
            } else if (error.message.includes("Sesión expirada")) {
                alert(`Error: ${error.message}\n\nPor favor, sal al menú principal e inicia sesión de nuevo.`);
            } else {
                alert(`Error crítico al guardar: ${error.message}\n\nIntenta guardar de nuevo o revisa tu conexión.`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedSession) {
        return (
            <div className="session-selector">
                <div className="meso-info glass">
                    <h2>Mesociclo {appState.meso}: {currentMeso?.name}</h2>
                    <p>Semana {appState.week}</p>
                </div>
                <h3>Seleccionar Sesión</h3>

                <div className="meso-selector-inline glass">
                    <p>Cambiar Mesociclo:</p>
                    <div className="meso-grid">
                        {PROGRAM_DATA.mesos.map(m => (
                            <button
                                key={m.id}
                                className={`meso-btn ${appState.meso === m.id ? 'active' : ''}`}
                                onClick={() => setAppState({ meso: m.id, week: m.weeks[0] })}
                            >
                                M{m.id}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="session-buttons">
                    {availableSessions.map(s => (
                        <button
                            key={s.id}
                            onClick={() => handleSelectSession(s)}
                            className="btn-primary"
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <form className="session-form" onSubmit={handleSubmit}>
            <header className="session-header">
                <button type="button" onClick={() => setSelectedSession(null)} className="btn-back">← Atrás</button>
                <h2>{selectedSession.name}</h2>
                <div className="badge">Semana {appState.week} • Meso {appState.meso}</div>
            </header>

            {volumeRecommendation && (
                <div className={`volume-alert glass ${volumeRecommendation.type.toLowerCase()}`}>
                    <div className="alert-content">
                        <strong>💡 Recomendación de Israetel:</strong>
                        <p>{volumeRecommendation.msg}</p>
                    </div>
                </div>
            )}

            <div className="exercise-list">
                {selectedSession.exercises.map(ex => (
                    <div key={ex.id} className="exercise-card glass">
                        <header className="ex-card-header">
                            <div className="ex-title-group">
                                <h3>{ex.name}</h3>
                                {exerciseHistory[ex.id] && (
                                    <span className="last-perf">
                                        Last: {exerciseHistory[ex.id].weight}kg x {exerciseHistory[ex.id].reps} (RIR {exerciseHistory[ex.id].rir})
                                    </span>
                                )}
                            </div>
                            <span className="target-badge">{ex.sets}x{ex.reps} (RIR {ex.rir})</span>
                        </header>


                        <div className="sets-container">
                            {sessionData[ex.id]?.map((setData, idx) => (
                                <div key={idx} className="set-row">
                                    <span className="set-num">S{idx + 1}</span>
                                    <input
                                        type="number"
                                        placeholder="kg"
                                        step="0.5"
                                        value={setData.weight}
                                        onChange={(e) => handleSetChange(ex.id, idx, 'weight', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="reps"
                                        value={setData.reps}
                                        onChange={(e) => handleSetChange(ex.id, idx, 'reps', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder={`RIR ${ex.rir}`}
                                        value={setData.rir}
                                        onChange={(e) => handleSetChange(ex.id, idx, 'rir', e.target.value)}
                                    />
                                    {getRealTimeRecommendation(setData.reps, setData.rir, ex.reps, ex.rir) && (
                                        <div className={`recommendation-overlay ${getRealTimeRecommendation(setData.reps, setData.rir, ex.reps, ex.rir).action.toLowerCase()}`}>
                                            {getRealTimeRecommendation(setData.reps, setData.rir, ex.reps, ex.rir).message}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <footer className="ex-card-footer">
                            <label className="tempo-toggle">
                                <input
                                    type="checkbox"
                                    checked={exerciseMetadata[ex.id]?.tempo_ok || false}
                                    onChange={(e) => handleMetadataChange(ex.id, 'tempo_ok', e.target.checked)}
                                />
                                <span>Tempo (3s ecc) ✅</span>
                            </label>
                            <label className="sfr-selector">
                                SFR:
                                <input
                                    type="range" min="1" max="5" step="1"
                                    value={exerciseMetadata[ex.id]?.sfr || 3}
                                    onChange={(e) => handleMetadataChange(ex.id, 'sfr', parseInt(e.target.value))}
                                />
                                <span className="sfr-val">{exerciseMetadata[ex.id]?.sfr || 3}</span>
                            </label>
                        </footer>

                    </div>
                ))}
            </div>

            <section className="post-session glass">
                <h3>Diagnóstico de Recuperación</h3>
                <div className="slider-group">
                    <label>
                        Soreness (Agujetas) [1-5]: <span className="val">{postSession.soreness}</span>
                        <p className="field-desc">Valora tu recuperación <strong>antes</strong> de empezar: ¿Tenías dolor de la sesión anterior?</p>
                        <input
                            type="range" min="0" max="5"
                            value={postSession.soreness}
                            onChange={(e) => handleFeedbackChange('soreness', parseInt(e.target.value))}
                        />
                        <span className="helper-text">{postSession.soreness === 0 ? 'Selecciona valor' : ''}</span>
                    </label>
                    <label>
                        Pump (Bombeo) [1-5]: <span className="val">{postSession.pump}</span>
                        <p className="field-desc">Valora la congestión <strong>ahora mismo</strong>: ¿Sientes el músculo hinchado?</p>
                        <input
                            type="range" min="0" max="5"
                            value={postSession.pump}
                            onChange={(e) => handleFeedbackChange('pump', parseInt(e.target.value))}
                        />
                        <span className="helper-text">{postSession.pump === 0 ? 'Selecciona valor' : ''}</span>
                    </label>
                    <label>
                        Notas:
                        <textarea
                            value={postSession.notes}
                            onChange={(e) => handleFeedbackChange('notes', e.target.value)}
                            placeholder="Molestias, energía, observaciones..."
                        />
                    </label>
                </div>
            </section>

            <button
                type="submit"
                className={`btn-submit ${!isSessionComplete() ? 'dimmed' : ''}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Guardando...' : 'Finalizar Sesión'}
            </button>
        </form>
    );
}

export default SessionForm;
