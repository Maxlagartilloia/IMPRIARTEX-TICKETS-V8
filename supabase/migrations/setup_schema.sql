-- 1. LIMPIEZA TOTAL (MODO DESTRUCCIÓN DE RESIDUOS)
DROP TABLE IF EXISTS tickets_history CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS supplies_log CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABLA DE PERFILES (EXTENSIÓN DE AUTH.USERS)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('SUPERVISOR', 'TECNICO', 'CLIENTE')) DEFAULT 'CLIENTE',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE INSTITUCIONES (CLIENTES CORPORATIVOS)
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  technician_id UUID REFERENCES profiles(id), -- Técnico preventivo asignado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE EQUIPOS (TRAZABILIDAD POR SERIAL)
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  serial TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  physical_location TEXT, -- Ej: "Piso 2 - Secretaría"
  status TEXT DEFAULT 'OPERATIVO',
  counter_bw INTEGER DEFAULT 0,
  counter_color INTEGER DEFAULT 0,
  last_maintenance TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE TICKETS (EL NÚCLEO DEL SLA)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number SERIAL,
  client_id UUID REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  equipment_id UUID REFERENCES equipment(id),
  issue_description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')) DEFAULT 'MEDIA',
  status TEXT CHECK (status IN ('ABIERTO', 'EN_PROCESO', 'CERRADO', 'CANCELADO')) DEFAULT 'ABIERTO',
  
  -- Tiempos de Auditoría (ISO 20000)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  arrival_time TIMESTAMPTZ, -- Cuando el técnico llega al sitio
  closed_at TIMESTAMPTZ,
  
  -- Datos de Cierre
  technician_id UUID REFERENCES profiles(id),
  work_performed TEXT,
  parts_replaced TEXT,
  final_counter_bw INTEGER,
  final_counter_color INTEGER,
  evidence_url TEXT, -- URL de la foto en Storage
  signature_name TEXT, -- Persona que recibe
  
  -- Cálculos de SLA
  response_time_minutes INTEGER, -- Calculado al llegar
  resolution_time_minutes INTEGER -- Calculado al cerrar
);

-- 7. LÓGICA DE AUDITORÍA AUTOMÁTICA (TRIGGERS)
CREATE OR REPLACE FUNCTION calculate_ticket_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular tiempo de respuesta (Creación -> Llegada)
  IF (NEW.arrival_time IS NOT NULL AND OLD.arrival_time IS NULL) THEN
    NEW.response_time_minutes := EXTRACT(EPOCH FROM (NEW.arrival_time - NEW.created_at)) / 60;
  END IF;
  
  -- Calcular tiempo de resolución (Creación -> Cierre)
  IF (NEW.status = 'CERRADO' AND OLD.status != 'CERRADO') THEN
    NEW.closed_at := NOW();
    NEW.resolution_time_minutes := EXTRACT(EPOCH FROM (NEW.closed_at - NEW.created_at)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_metrics
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION calculate_ticket_metrics();

-- 8. POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles visibles por todos" ON profiles FOR SELECT USING (true);
CREATE POLICY "Tickets visibles por los involucrados" ON tickets FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'SUPERVISOR') OR 
  auth.uid() = client_id OR 
  auth.uid() = technician_id
);
