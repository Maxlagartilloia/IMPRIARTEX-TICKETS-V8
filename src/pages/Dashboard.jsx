import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, AlertTriangle, Users, Printer } from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ open: 0, pending: 0, closed: 0 });
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentTickets();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from('tickets').select('status');
    const counts = {
      open: data?.filter(t => t.status === 'ABIERTO').length || 0,
      pending: data?.filter(t => t.status === 'EN_PROCESO').length || 0,
      closed: data?.filter(t => t.status === 'CERRADO').length || 0,
    };
    setStats(counts);
  };

  const fetchRecentTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*, institutions(name), equipment(model, serial)')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentTickets(data || []);
  };

  const getSLABadge = (createdAt) => {
    const hours = (new Date() - new Date(createdAt)) / 36e5;
    if (hours < 2) return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">SLA OK</span>;
    if (hours < 4) return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">ADVERTENCIA</span>;
    return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">FUERA DE SLA</span>;
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel de Control Global</h2>
          <p className="text-slate-500">Bienvenido, {profile?.full_name} ({profile?.role})</p>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Abiertos" val={stats.open} icon={<AlertTriangle className="text-orange-500" />} color="border-orange-500" />
        <StatCard title="En Proceso" val={stats.pending} icon={<Clock className="text-blue-500" />} color="border-blue-500" />
        <StatCard title="Cerrados" val={stats.closed} icon={<CheckCircle className="text-green-500" />} color="border-green-500" />
        <StatCard title="Equipos" val="124" icon={<Printer className="text-purple-500" />} color="border-purple-500" />
      </div>

      {/* TICKET TABLE (AUDITORÍA) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 text-lg text-[18px]">Monitoreo de Tickets en Tiempo Real</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Institución</th>
                <th className="px-6 py-4">Equipo / Serial</th>
                <th className="px-6 py-4">Estado SLA</th>
                <th className="px-6 py-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">#{ticket.ticket_number}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{ticket.institutions?.name}</td>
                  <td className="px-6 py-4 text-sm">
                    {ticket.equipment?.model} <br/>
                    <span className="text-xs text-slate-400">{ticket.equipment?.serial}</span>
                  </td>
                  <td className="px-6 py-4">{getSLABadge(ticket.created_at)}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 font-bold text-sm hover:underline">Ver Detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, val, icon, color }) => (
  <div className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{title}</p>
        <h4 className="text-3xl font-black text-slate-800 mt-1">{val}</h4>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    </div>
  </div>
);

export default Dashboard;
