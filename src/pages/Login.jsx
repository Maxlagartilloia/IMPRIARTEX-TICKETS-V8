import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔑 CUANDO EL USUARIO EXISTE → ENTRAR
  useEffect(() => {
    if (user) {
      navigate('/dashboard'); // ajusta si tu ruta es otra
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false); // 🔴 SOLO AQUÍ
    }
    // ❌ NO setLoading(false) si es éxito
    // porque esperamos al AuthContext
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800">IMPRIARTEX ERP</h1>
            <p className="text-slate-500 mt-2">Gestión de Servicios Técnicos v9.0</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? 'Verificando…' : 'ACCEDER AL SISTEMA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
