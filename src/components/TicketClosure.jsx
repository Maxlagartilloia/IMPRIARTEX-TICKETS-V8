import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, Printer, CheckCircle } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

const TicketClosure = ({ ticket, onComplete }) => {
  const [formData, setFormData] = useState({
    work_performed: '',
    final_counter_bw: '',
    final_counter_color: '',
    signature_name: '',
  });

  const handleClose = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('tickets')
      .update({
        ...formData,
        status: 'CERRADO',
        closed_at: new Date().toISOString()
      })
      .eq('id', ticket.id)
      .select('*, institutions(*), equipment(*)');

    if (!error) {
      // Generar PDF automáticamente al cerrar
      generatePDF(data[0]);
      onComplete();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
        <CheckCircle className="text-green-500" /> CIERRE DE SERVICIO TÉCNICO
      </h3>
      
      <form onSubmit={handleClose} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Informe Técnico</label>
          <textarea 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
            rows="3"
            placeholder="Describa el trabajo realizado..."
            onChange={(e) => setFormData({...formData, work_performed: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Contador B/N</label>
            <input 
              type="number"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              onChange={(e) => setFormData({...formData, final_counter_bw: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Contador Color</label>
            <input 
              type="number"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              onChange={(e) => setFormData({...formData, final_counter_color: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Nombre del Receptor (Cliente)</label>
          <input 
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            placeholder="Nombre de quien recibe el equipo"
            onChange={(e) => setFormData({...formData, signature_name: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg">
          <Save className="w-5 h-5" /> CERRAR TICKET Y GENERAR ACTA
        </button>
      </form>
    </div>
  );
};

export default TicketClosure;
