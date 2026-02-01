import React, { useState, useEffect } from 'react'
import SessionForm from './components/SessionForm'
import ProgressDashboard from './components/ProgressDashboard'
import { getAppState, updateAppState } from './logic/Storage'

function App() {
    const [view, setView] = useState('dashboard');
    const [appState, setAppState] = useState(getAppState());

    const handleUpdateState = (newState) => {
        const updated = { ...appState, ...newState };
        setAppState(updated);
        updateAppState(updated);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>HYPERTROPHY-X</h1>
                <p>Elite Training Registry</p>
                <nav className="main-nav glass">
                    <button
                        onClick={() => setView('dashboard')}
                        className={view === 'dashboard' ? 'active' : ''}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setView('registro')}
                        className={view === 'registro' ? 'active' : ''}
                    >
                        Registrar
                    </button>
                </nav>
            </header>
            <main>
                {view === 'dashboard' ? (
                    <ProgressDashboard
                        appState={appState}
                        setAppState={handleUpdateState}
                    />
                ) : (
                    <SessionForm
                        appState={appState}
                        setAppState={handleUpdateState}
                    />
                )}
            </main>
        </div>
    )
}

export default App