
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

    const checkQueue = () => {
        const queue = JSON.parse(localStorage.getItem('hx_sync_queue') || '[]');
        setPendingCount(queue.length);
    };

    useEffect(() => {
        checkQueue();
        const interval = setInterval(checkQueue, 5000); // Polling local count is safe
        return () => clearInterval(interval);
    }, []);

    // Also trigger on user change
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

    if (pendingCount === 0) return null;

    return (
        <div className="sync-notification glass aurora-border">
            <div className="sync-info">
                <RefreshCw size={16} className={syncing ? 'spin-animation' : ''} />
                <span>Hay {pendingCount} sesión(es) sin sincronizar.</span>
            </div>
            <button onClick={handleSync} disabled={syncing} className="btn-sync-mini">
                {syncing ? 'Subiendo...' : 'Subir Ahora'}
            </button>
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
    };

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