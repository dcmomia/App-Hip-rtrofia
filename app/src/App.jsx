
import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './components/Login'
import SessionForm from './components/SessionForm'
import ProgressDashboard from './components/ProgressDashboard'
import MacroCycleView from './components/MacroCycleView'
import { getAppState, updateAppState } from './logic/Storage'
import { getUserId, SupabaseService } from './logic/SupabaseService'
import { LogOut, AlertTriangle, RefreshCw } from 'lucide-react'

// Simple Error Boundary Fallback
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-screen glass">
                    <AlertTriangle size={48} color="#ff4d4d" />
                    <h2>Algo salió mal</h2>
                    <p>{this.state.error?.message || "Error desconocido"}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary">Reiniciar App</button>
                </div>
            );
        }
        return this.props.children;
    }
}

const SyncManager = () => {
    const { user } = useAuth();
    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [lastError, setLastError] = useState(null);

    const checkQueue = () => {
        const queue = JSON.parse(localStorage.getItem('hx_sync_queue') || '[]');
        const error = localStorage.getItem('hx_last_sync_error');
        setPendingCount(queue.length);
        setLastError(error);
    };

    useEffect(() => {
        checkQueue();
        const interval = setInterval(checkQueue, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user && pendingCount > 0) {
            handleSync();
        }
    }, [user]);

    const handleSync = async () => {
        if (!user || syncing) return;
        setSyncing(true);
        try {
            await SupabaseService.processSyncQueue();
        } catch (e) {
            console.error("Manual sync failed", e);
        } finally {
            setSyncing(false);
            checkQueue();
        }
    };

    const handleClear = () => {
        if (window.confirm("¿Seguro que quieres borrar las sesiones pendientes? Los datos locales se perderán permanentemente.")) {
            SupabaseService.clearSyncQueue();
            checkQueue();
        }
    };

    if (pendingCount === 0) return null;

    return (
        <div className="sync-notification glass aurora-border" style={{ flexDirection: 'column', gap: '8px' }}>
            <div className="sync-info" style={{ width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} className={syncing ? 'spin-animation' : ''} />
                    <span>{pendingCount} sesión(es) pendientes</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleSync} disabled={syncing} className="btn-sync-mini">
                        {syncing ? 'Subiendo...' : 'Reintentar'}
                    </button>
                    <button onClick={handleClear} className="btn-danger-small" style={{ marginTop: 0, padding: '4px 8px' }}>
                        Limpiar
                    </button>
                </div>
            </div>
            {lastError && (
                <div className="sync-error-msg" style={{ fontSize: '0.7rem', color: '#ff8b8b', width: '100%', textAlign: 'left', background: 'rgba(255,0,0,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    <strong>Error:</strong> {lastError}
                </div>
            )}
        </div>
    );
};

// Layout component to handle Navigation
const AppLayout = ({ children, setView, meso }) => {
    const { signOut } = useAuth();
    const location = useLocation();

    return (
        <div className="app-container" data-meso={meso}>
            <SyncManager />
            <header className="app-header">
                <div className="header-top">
                    <h1>HYPERTROPHY-X</h1>
                    <button onClick={signOut} className="btn-icon" title="Cerrar Sesión">
                        <LogOut size={18} />
                    </button>
                </div>
                <p>Elite Training Registry</p>
                <nav className="main-nav glass">
                    <Link
                        to="/"
                        className={location.pathname === '/' ? 'active' : ''}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/registro"
                        className={location.pathname === '/registro' ? 'active' : ''}
                    >
                        Registro
                    </Link>
                    <Link
                        to="/plan"
                        className={location.pathname === '/plan' ? 'active' : ''}
                    >
                        Calendario
                    </Link>
                </nav>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};

function App() {
    const [appState, setAppState] = useState(getAppState());

    const handleUpdateState = (newState) => {
        const updated = { ...appState, ...newState };
        setAppState(updated);
        updateAppState(updated);
        // Sync to cloud
        SupabaseService.updateAppState(updated);
    };

    // Sync State from Cloud on Mount (if auth)
    useEffect(() => {
        const syncRemoteState = async () => {
            const remote = await SupabaseService.getAppState();
            if (remote) {
                console.log("HX-System: Found remote state, syncing...", remote);
                const newState = { meso: remote.meso_cycle, week: remote.week };
                // Update local only if different? For now just overwrite to ensure sync.
                setAppState(prev => ({ ...prev, ...newState }));
                updateAppState({ ...appState, ...newState });
            }
        };
        // We could verify auth first or let service handle it
        syncRemoteState();
    }, []);

    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <AppLayout meso={appState.meso}>
                                    <ProgressDashboard
                                        appState={appState}
                                        setAppState={handleUpdateState}
                                    />
                                </AppLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/registro" element={
                            <ProtectedRoute>
                                <AppLayout meso={appState.meso}>
                                    <SessionForm
                                        appState={appState}
                                        setAppState={handleUpdateState}
                                    />
                                </AppLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/plan" element={
                            <ProtectedRoute>
                                <AppLayout meso={appState.meso}>
                                    <MacroCycleView
                                        appState={appState}
                                        setAppState={handleUpdateState}
                                    />
                                </AppLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    )
}

export default App