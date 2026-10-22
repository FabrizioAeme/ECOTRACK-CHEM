import { InsumoQuimico } from '../models/insumo.interface';
import { Lote } from '../models/lote.interface';
import { ResiduoIndustrial } from '../models/residuo.interface';
import { Usuario } from '../models/usuario.interface';

export const USUARIOS_EJEMPLO: Usuario[] = [
  { id: 1, nombres: 'Admin', apellidos: 'EcoTrackChem', correo: 'admin@ecotrackchem.com', rol: 'ADMINISTRADOR' },
  { id: 2, nombres: 'Ana', apellidos: 'Torres', correo: 'ana.torres@ecotrackchem.com', rol: 'OPERADOR_LABORATORIO' },
  { id: 3, nombres: 'Luis', apellidos: 'Ramírez', correo: 'luis.ramirez@ecotrackchem.com', rol: 'AUDITOR_AMBIENTAL' },
  { id: 4, nombres: 'María', apellidos: 'Quispe', correo: 'maria.quispe@ecotrackchem.com', rol: 'OPERADOR_LABORATORIO' },
];

export const INSUMOS_EJEMPLO: InsumoQuimico[] = [
  { id: 1, codigoCas: '7732-18-5', nombre: 'Agua desionizada', nivelPureza: 99.9, nivelPeligrosidad: 'NEUTRO', stockDisponible: 500 },
  { id: 2, codigoCas: '67-64-1', nombre: 'Acetona industrial', nivelPureza: 99.5, nivelPeligrosidad: 'INFLAMABLE', stockDisponible: 250 },
  { id: 3, codigoCas: '7664-93-9', nombre: 'Ácido sulfúrico', nivelPureza: 98, nivelPeligrosidad: 'CORROSIVO', stockDisponible: 120 },
  { id: 4, codigoCas: '1310-73-2', nombre: 'Hidróxido de sodio', nivelPureza: 97.5, nivelPeligrosidad: 'CORROSIVO', stockDisponible: 80 },
  { id: 5, codigoCas: '67-56-1', nombre: 'Metanol', nivelPureza: 99.8, nivelPeligrosidad: 'TOXICO', stockDisponible: 60 },
  { id: 6, codigoCas: '64-17-5', nombre: 'Etanol', nivelPureza: 96, nivelPeligrosidad: 'INFLAMABLE', stockDisponible: 300 },
];

export const LOTES_EJEMPLO: Lote[] = [
  {
    id: 1, codigoLote: 'LOT-2026-001', fechaFabricacion: '2026-10-02', volumenProducido: 1200, estado: 'AUDITADO',
    usuarioId: 2, usuarioNombre: 'Ana Torres', insumoId: 2, insumoNombre: 'Acetona industrial',
  },
  {
    id: 2, codigoLote: 'LOT-2026-002', fechaFabricacion: '2026-10-09', volumenProducido: 850, estado: 'FINALIZADO',
    usuarioId: 4, usuarioNombre: 'María Quispe', insumoId: 3, insumoNombre: 'Ácido sulfúrico',
  },
  {
    id: 3, codigoLote: 'LOT-2026-003', fechaFabricacion: '2026-10-15', volumenProducido: 640, estado: 'EN_PROCESO',
    usuarioId: 2, usuarioNombre: 'Ana Torres', insumoId: 6, insumoNombre: 'Etanol',
  },
  {
    id: 4, codigoLote: 'LOT-2026-004', fechaFabricacion: '2026-10-20', volumenProducido: 300, estado: 'EN_PROCESO',
    usuarioId: 1, usuarioNombre: 'Admin EcoTrackChem', insumoId: 5, insumoNombre: 'Metanol',
  },
];

export const RESIDUOS_EJEMPLO: ResiduoIndustrial[] = [
  { id: 1, tipoResiduo: 'Solvente gastado', volumenLitros: 35.5, disposicionFinal: 'RECICLADO_REUSO', requiereCertificado: true, loteId: 1, loteCodigo: 'LOT-2026-001' },
  { id: 2, tipoResiduo: 'Agua de lavado ácida', volumenLitros: 120, disposicionFinal: 'NEUTRALIZADO', requiereCertificado: false, loteId: 2, loteCodigo: 'LOT-2026-002' },
  { id: 3, tipoResiduo: 'Lodo químico', volumenLitros: 18, disposicionFinal: 'RECOGIDA_ESPECIAL', requiereCertificado: true, loteId: 2, loteCodigo: 'LOT-2026-002' },
  { id: 4, tipoResiduo: 'Envases contaminados', volumenLitros: 12, disposicionFinal: 'RECOGIDA_ESPECIAL', requiereCertificado: true, loteId: 3, loteCodigo: 'LOT-2026-003' },
  { id: 5, tipoResiduo: 'Etanol recuperado', volumenLitros: 40, disposicionFinal: 'RECICLADO_REUSO', requiereCertificado: false, loteId: 3, loteCodigo: 'LOT-2026-003' },
];
