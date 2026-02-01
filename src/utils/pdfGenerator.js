import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (ticket) => {
  const doc = new jsPDF();
  const primaryColor = [15, 23, 42]; // Navy Blue de IMPRIARTEX

  // 1. Encabezado Corporativo
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPRIARTEX ERP', 20, 20);
  
  doc.setFontSize(10);
  doc.text('ACTA DE ENTREGA-RECEPCIÓN TÉCNICA', 20, 30);
  doc.text(`TICKET: #TKT-${ticket.ticket_number}`, 150, 25);

  // 2. Información del Cliente y Equipo
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text('INFORMACIÓN GENERAL', 20, 55);
  
  doc.autoTable({
    startY: 60,
    head: [['Institución', 'Ubicación', 'Modelo', 'Serial']],
    body: [[
      ticket.institutions?.name,
      ticket.equipment?.physical_location,
      ticket.equipment?.model,
      ticket.equipment?.serial
    ]],
    theme: 'striped',
    headStyles: { fillColor: primaryColor }
  });

  // 3. Métricas de Auditoría (SLA)
  const responseTime = ticket.response_time_minutes ? `${ticket.response_time_minutes} min` : 'N/A';
  const resolutionTime = ticket.resolution_time_minutes ? `${ticket.resolution_time_minutes} min` : 'Bajo revisión';

  doc.text('MÉTRICAS DE SERVICIO (SLA)', 20, doc.lastAutoTable.finalY + 15);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    body: [
      ['Fecha de Reporte', new Date(ticket.created_at).toLocaleString()],
      ['Tiempo de Respuesta', responseTime],
      ['Tiempo de Resolución Total', resolutionTime],
      ['Estado Final', ticket.status]
    ],
    theme: 'plain'
  });

  // 4. Informe y Contadores
  doc.text('DETALLES TÉCNICOS', 20, doc.lastAutoTable.finalY + 15);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Trabajo Realizado', 'Contador B/N', 'Contador Color']],
    body: [[
      ticket.work_performed,
      ticket.final_counter_bw,
      ticket.final_counter_color
    ]],
    theme: 'grid'
  });

  // 5. Firmas
  const finalY = doc.lastAutoTable.finalY + 40;
  doc.line(20, finalY, 80, finalY);
  doc.text('Firma Técnico', 35, finalY + 5);
  
  doc.line(130, finalY, 190, finalY);
  doc.text(ticket.signature_name || 'Firma Cliente', 145, finalY + 5);

  // Descarga automática
  doc.save(`ACTA_IMPRIARTEX_${ticket.ticket_number}.pdf`);
};
