import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  MessageSquare
} from 'lucide-react';

const Support = () => {
  const { profile, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de creación
  const [institutions, setInstitutions] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [formData, setFormData] = useState({
    institution_id: '',
    equipment_id: '',
    priority: 'MEDIA',
    issue_description: ''
  });

  useEffect(() => {
    fetchTickets();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: inst } = await supabase.from('institutions').select('*');
    setInstitutions(inst || []);
  };

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*, institutions(name), equipment(model, serial, physical_location)')
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data);
    setLoading(false);
  };

  const handleInstitutionChange = async (instId) => {
    setFormData({ ...formData, institution_id: instId, equipment_id: '' });
    const { data } = await supabase
      .from('equipment')
      .select('*')
      .eq('institution_id', instId);
    setFilteredEquipment(data || []);
  };

  const createTicket = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('tickets').insert([{
      ...formData,
      client_id: user.id,
      status: 'ABIERTO'
    }]);

    if (!error) {
      setIsModalOpen(false);
      fetchTickets();
      setFormData({ institution_id: '', equipment_id: '', priority: 'MEDIA', issue_description: '' });
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">CENTRO DE SOPORTE</h1>
          <p className="text-slate-500 font-medium">Gestión de incidencias y cumplimiento de niveles de servicio</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" /> Nuevo Ticket
        </button>
      </div>

      {/* FILTROS RÁPIDOS */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {['TODOS', 'ABIERTO', 'EN_PROCESO', 'CERRADO'].map(status => (
          <button key={status} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-400 transition whitespace-nowrap">
            {status}
          </button>
        ))}
      </div>

      {/* LISTADO DE TICKETS */}
      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${ticket.status === 'CERRADO' ? 'bg-green-50' : 'bg-blue-50'}`}>
                  {ticket.status === 'CERRADO' ? 
                    <CheckCircle2 className="w-6 h-6 text-green-600" /> : 
                    <Clock className="w-6 h-6 text-blue-600" />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400">#TKT-{ticket.ticket_number}</span>
                    <SLATimer createdAt={ticket.created_at} status={ticket.status} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{ticket.issue_description}</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    <span className="font-bold text-slate-700">{ticket.institutions?.name}</span> • {ticket.equipment?.model} ({ticket.equipment?.serial})
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Prioridad</p>
                  <span className={`text-xs font-bold ${ticket.priority === 'CRITICA' ? 'text-red-600' : 'text-slate-600'}`}>
                    {ticket.priority}
                  </span>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-full transition">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREACIÓN (CASQUETE DE SEGURIDAD) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-800">REPORTE DE INCIDENCIA</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <form onSubmit={createTicket} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Institución</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  onChange={(e) => handleInstitutionChange(e.target.value)}
                  required
                >
                  <option value="">Seleccione Cliente...</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Equipo Afectado</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  disabled={!formData.institution_id}
                  onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                  required
                >
                  <option value="">Seleccione Serial...</option>
                  {filteredEquipment.map(e => <option key={e.id} value={e.id}>{e.model} - {e.serial} ({e.physical_location})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Descripción de la Falla</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 h-24"
                  placeholder="Ej: La máquina presenta código de error SC-542..."
                  onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-3 px-6 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">CANCELAR</button>
                <button type="submit" className="py-3 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">GENERAR TICKET</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SLATimer = ({ createdAt, status }) => {
  const [timeStr, setTimeStr] = useState('');
  const [color, setColor] = useState('text-green-600');

  useEffect(() => {
    if (status === 'CERRADO') return;
    
    const interval = setInterval(() => {
      const diff = new Date() - new Date(createdAt);
      const hours = Math.floor(diff / 36e5);
      const mins = Math.floor((diff % 36e5) / 60000);
      
      setTimeStr(`${hours}h ${mins}m`);
      
      if (hours >= 4) setColor('bg-red-100 text-red-700');
      else if (hours >= 2) setColor('bg-yellow-100 text-yellow-700');
      else setColor('bg-green-100 text-green-700');
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (status === 'CERRADO') return null;

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border transition-colors ${color}`}>
      {timeStr}
    </span>
  );
};

export default Support;
