import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PROGRAM_DATA } from '../data/programData';
import { getSessionDraft } from '../logic/Storage';
import { ChevronRight, Calendar, CheckCircle2, Clock } from 'lucide-react';

const MacroCycleView = ({ appState, setAppState }) => {
    const navigate = useNavigate();

    const handleSessionClick = (mesoId, week, sessionId) => {
        // Update global app state to target this specific week/meso
        setAppState({ meso: mesoId, week: week });
        // Navigate with sessionId to open it directly
        navigate(`/registro?sessionId=${sessionId}`);
    };

    const getStatusIcon = (mesoId, week, sessionId) => {
        const draft = getSessionDraft(sessionId);
        // We don't have a direct "isDone" check here without fetching Supabase, 
        // but we can show if it has a draft.
        if (draft && draft.meso === mesoId && draft.week === week) {
            return <Clock size={14} className="status-icon draft" title="Borrador Pendiente" />;
        }
        return null; // For now
    };

    return (
        <div className="macro-cycle-view">
            <header className="view-header">
                <h2>Calendario de Entrenamiento</h2>
                <p>26 Semanas • 104 Sesiones</p>
            </header>

            <div className="meso-list">
                {PROGRAM_DATA.mesos.map((meso) => (
                    <section key={meso.id} className="meso-section glass">
                        <header className="meso-header">
                            <div className="meso-title-group">
                                <span className="meso-label">Mesociclo {meso.id}</span>
                                <h3>{meso.name}</h3>
                            </div>
                            <div className="meso-badge">{meso.weeks.length} Semanas</div>
                        </header>

                        <div className="weeks-grid">
                            {meso.weeks.map((week) => (
                                <div key={week} className="week-card">
                                    <div className="week-label">Semana {week}</div>
                                    <div className="sessions-list">
                                        {meso.sessions.map((session) => (
                                            <button
                                                key={session.id}
                                                className={`session-item-mini ${appState.meso === meso.id && appState.week === week ? 'current' : ''
                                                    }`}
                                                onClick={() => handleSessionClick(meso.id, week, session.id)}
                                            >
                                                <div className="session-info">
                                                    <span className="session-name-mini">{session.name}</span>
                                                    {getStatusIcon(meso.id, week, session.id)}
                                                </div>
                                                <ChevronRight size={14} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default MacroCycleView;
