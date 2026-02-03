import React, { useState, useEffect } from 'react';
import { calculateNextLoad, calculateVolumeAdjust } from '../logic/IsraetelEngine';
import { PROGRAM_DATA } from '../data/programData';
import { saveSessionLog } from '../logic/Storage';

function SessionForm({ appState, setAppState }) {
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionData, setSessionData] = useState({}); // { exerciseId: [{weight, reps, rir}, ...] }
    const [postSession, setPostSession] = useState({ soreness: 2, pump: 3, fatigue: 3 });

    // Find sessions for current meso
    const currentMeso = PROGRAM_DATA.mesos.find(m => m.id === appState.meso);
    const availableSessions = currentMeso ? currentMeso.sessions : [];

    const initExerciseData = (exercises) => {
        const initialData = {};
        exercises.forEach(ex => {
            initialData[ex.id] = Array.from({ length: ex.sets }, () => ({
                weight: '',
                reps: '',
                rir: ex.rir
            }));
        });
        setSessionData(initialData);
    };

    const handleSetChange = (exerciseId, setIndex, field, value) => {
        setSessionData(prev => {
            const nextSets = [...prev[exerciseId]];
            nextSets[setIndex] = { ...nextSets[setIndex], [field]: value };
            return { ...prev, [exerciseId]: nextSets };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const log = {
            meso: appState.meso,
            week: appState.week,
            sessionId: selectedSession.id,
            sessionName: selectedSession.name,
            data: sessionData,
            feedback: postSession
        };

        saveSessionLog(log);

        // Logic for auto-advancing week (simplified: every 4 sessions = 1 week)
        // In a real app, this would be more complex
        alert('Sesión Guardada con Éxito!');
        setSelectedSession(null);
    };

    if (!selectedSession) {
        return (
            <div className="session-selector">
                <div className="meso-info glass">
                    <h2>Mesociclo {appState.meso}: {currentMeso?.name}</h2>
                    <p>Hoy es Semana {appState.week}</p>
                </div>
                <h3>Seleccionar Sesión</h3>
                <div className="session-buttons">
                    {availableSessions.map(s => (
                        <button
                            key={s.id}
                            onClick={() => {
                                setSelectedSession(s);
                                initExerciseData(s.exercises);
                            }}
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
                <button type="button" onClick={() => setSelectedSession(null)} className="btn-back">← Volver</button>
                <h2>{selectedSession.name}</h2>
                <div className="badge">Semana {appState.week} • Meso {appState.meso}</div>
            </header>

            <div className="exercise-list">
                {selectedSession.exercises.map(ex => (
                    <div key={ex.id} className="exercise-card glass">
                        <header className="ex-card-header">
                            <h3>{ex.name}</h3>
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
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="reps"
                                        value={setData.reps}
                                        onChange={(e) => handleSetChange(ex.id, idx, 'reps', e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder={`RIR ${ex.rir}`}
                                        value={setData.rir}
                                        onChange={(e) => handleSetChange(ex.id, idx, 'rir', e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <section className="post-session glass">
                <h3>Check-in de Israetel</h3>
                <div className="slider-group">
                    <label>
                        Soreness (Agujetas) [1-5]: <span className="val">{postSession.soreness}</span>
                        <input
                            type="range" min="1" max="5"
                            value={postSession.soreness}
                            onChange={(e) => setPostSession({ ...postSession, soreness: parseInt(e.target.value) })}
                        />
                    </label>
                    <label>
                        Pump (Bombeo) [1-5]: <span className="val">{postSession.pump}</span>
                        <input
                            type="range" min="1" max="5"
                            value={postSession.pump}
                            onChange={(e) => setPostSession({ ...postSession, pump: parseInt(e.target.value) })}
                        />
                    </label>
                </div>
            </section>

            <button type="submit" className="btn-submit">Finalizar Sesión</button>
        </form>
    );
}

export default SessionForm;
