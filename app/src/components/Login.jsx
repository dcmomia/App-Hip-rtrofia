
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = mode === 'login'
                ? await signIn({ email, password })
                : await signUp({ email, password });

            if (error) throw error;

            if (mode === 'signup') {
                alert('¡Registro exitoso! Por favor inicia sesión.');
                setMode('login');
            } else {
                navigate('/');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass">
                <h1>HYPERTROPHY-X</h1>
                <p className="subtitle">Elite Training Access</p>

                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="elite@user.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary full-width">
                        {loading ? 'Procesando...' : (mode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
                    </button>
                </form>

                <p className="switch-mode">
                    {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                        {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
}
