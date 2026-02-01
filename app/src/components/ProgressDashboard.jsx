import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../logic/SupabaseService';
import { clearSessionLogs } from '../logic/Storage'; // Legacy removal helper if needed
import { PROGRAM_DATA } from '../data/programData';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

function ProgressDashboard({ appState, setAppState }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await SupabaseService.getSessionLogs();
            setLogs(data || []);
        } catch (error) {
            console.error("Error loading logs", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Data Processing for Charts ---

    // 1. Volume Progression (Tonnage over time)
    const volumeData = logs.slice().reverse().map(session => {
        const totalVolume = session.sets.reduce((acc, set) => acc + (set.weight * set.reps), 0);
        return {
            date: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            volumen: Math.round(totalVolume),
            name: session.session_name
        };
    });

    // 2. Recovery Stats (Soreness & Pump)
    const recoveryData = logs.slice().reverse().map(session => ({
        date: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        soreness: session.soreness,
        pump: session.pump
    }));

    const currentMesoData = PROGRAM_DATA.mesos.find(m => m.id === appState.meso);
    const progressPercent = Math.min(Math.round((totalSessions / 104) * 100), 100);

    const stats = [
        { label: 'Sesiones', value: `${totalSessions}/104` },
        { label: 'Meso Activo', value: currentMesoData?.name || `Meso ${appState.meso}` },
        { label: 'Semana', value: appState.week },
        { label: 'Progreso', value: `${progressPercent}%`, color: 'var(--accent-color)' }
    ];

    if (loading) return <div className="loading-screen">Cargando datos...</div>;

    return (
        <div className="dashboard">
            <div className="meso-selector-panel glass">
                <header className="meso-header-ui">
                    <div className="title-group">
                        <h3>Control de Ciclo</h3>
                        <p className="meso-name-subtitle">{currentMesoData?.name}</p>
                    </div>
                    <div className="badge">Meso {appState.meso} | Sem {appState.week}</div>
                </header>
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

            <div className="stats-grid">
                {stats.map(s => (
                    <div key={s.label} className="stat-card glass">
                        <span className="label">{s.label}</span>
                        <span className="value" style={{ color: s.color || 'var(--text-primary)' }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* CHART 1: Volume Progression */}
            <div className="chart-container glass">
                <h3>Progresión de Volumen (Carga Total)</h3>
                <div className="chart-wrapper" style={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer>
                        <AreaChart data={volumeData}>
                            <defs>
                                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={10} />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="volumen" stroke="#00f3ff" fillOpacity={1} fill="url(#colorVol)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CHART 2: Recovery (Pump vs Soreness) */}
            <div className="chart-container glass">
                <h3>Recuperación vs Estímulo</h3>
                <p className="subtitle">Pump (Estímulo) vs Soreness (Fatiga)</p>
                <div className="chart-wrapper" style={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer>
                        <LineChart data={recoveryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                            <Line type="monotone" dataKey="pump" stroke="#4ade80" strokeWidth={2} name="Pump" dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="soreness" stroke="#f87171" strokeWidth={2} name="Soreness" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div >
    );
}

export default ProgressDashboard;
