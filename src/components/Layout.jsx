import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Ticket, 
  Printer, 
  LogOut, 
  User,
  Settings
} from 'lucide-react';

const Layout = ({ children }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Tickets', path: '/tickets', icon: <Ticket size={20} /> },
    { name: 'Inventario', path: '/inventory', icon: <Printer size={20} /> },
  ];

  const handleLogout = async () => {
    // Aquí iría la lógica de supabase.auth.signOut()
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR FIJO ENTERPRISE */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-black tracking-tighter text-blue-400">IMPRIARTEX ERP</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Soporte Técnico v9</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* PERFIL USUARIO ABAJO */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
