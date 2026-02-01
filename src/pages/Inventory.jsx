import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Search, 
  Plus, 
  Filter, 
  Printer, 
  MapPin, 
  Activity,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipment')
      .select('*, institutions(name)')
      .order('created_at', { ascending: false });
    
    if (!error) setItems(data);
    setLoading(false);
  };

  const filteredItems = items.filter(item => 
    item.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.institutions?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* HEADER ACCIONES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">INVENTARIO TÉCNICO</h1>
          <p className="text-slate-500 text-sm">Gestión de activos y parque de impresión multientidad</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition shadow-sm">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" /> Nuevo Equipo
          </button>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por Serial, Modelo o Institución..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRID DE EQUIPOS */}
      {loading ? (
        <div className="flex justify-center p-20 text-slate-400">Cargando activos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50 transition">
                    <Printer className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg uppercase leading-tight">{item.model}</h3>
                  <p className="text-blue-600 font-mono text-sm font-bold tracking-wider">{item.serial}</p>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Activity className="w-4 h-4" />
                    <span className="font-medium">{item.institutions?.name || 'Sin Asignar'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{item.physical_location || 'Ubicación no registrada'}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-between items-center">
                <div className="text-xs text-slate-400">
                  IP: <span className="font-mono text-slate-600">{item.ip_address || 'N/A'}</span>
                </div>
                <button className="text-slate-400 hover:text-blue-600 transition">
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'OPERATIVO': 'bg-green-100 text-green-700 border-green-200',
    'MANTENIMIENTO': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'FUERA_SERVICIO': 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status] || styles['OPERATIVO']}`}>
      {status}
    </span>
  );
};

export default Inventory;
