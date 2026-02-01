import React, { useState, useEffect } from 'react';
import { getSessionLogs } from '../logic/Storage';
import { PROGRAM_DATA } from '../data/programData';

function ProgressDashboard({ appState, setAppState }) {
    const [logs, setLogs] = useState(getSessionLogs());

    const totalSessions = logs.length;
    const progressPercent = Math.min(Math.round((totalSessions / 104) * 100), 100);

    const stats = [
        { label: 'Sesiones Completas', value: `${totalSessions}/104` },
        { label: 'Semana Actual', value: appState.week },
        { label: 'Mesociclo Activo', value: appState.meso },
        { label: 'Adherencia', value: `${progressPercent}%`, color: '#00ff00' }
    ];

    return (
        <div className="dashboard">
            <div className="meso-selector-panel glass">
                <h3>Navegación de Mesociclos</h3>
                <div className="meso-grid">
                    {PROGRAM_DATA.mesos.map(m => (
                        <button
                            key={m.id}
                            className={`meso-btn ${appState.meso === m.id ? 'active' : ''}`}
                            onClick={() => setAppState({ meso: m.id, week: m.weeks[0] })}
                        >
                            Meso {m.id}
                        </button>
                    ))}
                </div>
                <p className="current-meso-name">
                    {PROGRAM_DATA.mesos.find(m => m.id === appState.meso)?.name}
                </p>
            </div>

            <div className="stats-grid">
                {stats.map(s => (
                    <div key={s.label} className="stat-card glass">
                        <span className="label">{s.label}</span>
                        <span className="value" style={{ color: s.color || 'var(--accent-color)' }}>{s.value}</span>
                    </div>
                ))}
            </div>
            {/* ... rest of component ... */}

            <div className="chart-placeholder glass">
                <h3>Volumen Acumulado (Sesiones)</h3>
                <p className="target" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    {logs.length > 0 ? "Datos reales cargados desde almacenamiento local." : "No hay sesiones registradas aún."}
                </p>
                <div className="mock-chart">
                    {logs.map((log, i) => (
                        <div
                            key={i}
                            className="bar"
                            style={{ height: `${Math.random() * 60 + 20}%` }}
                            title={`Sesión ${i + 1}`}
                        ></div>
                    ))}
                    {logs.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bar" style={{ height: '10%', opacity: 0.1 }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProgressDashboard;
