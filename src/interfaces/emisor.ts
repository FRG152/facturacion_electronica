/**
 * Interfaces para configuración del emisor de facturas electrónicas
 * Basado en tecasis-facturacion.json línea 8-47
 */

export interface ActividadEconomica {
  codigo: string;
  descripcion: string;
}

export interface Establecimiento {
  codigo: string;
  direccion: string;
  numeroCasa: string;
  complementoDireccion1?: string;
  complementoDireccion2?: string;
  departamento: number;
  departamentoDescripcion: string;
  distrito: number;
  distritoDescripcion: string;
  ciudad: number;
  ciudadDescripcion: string;
  telefono: string;
  email: string;
  denominacion: string;
}

export interface ConfigurarEmisorDTO {
  version: number;
  ruc: string;
  razonSocial: string;
  nombreFantasia: string;
  actividadesEconomicas: ActividadEconomica[];
  timbradoNumero: string;
  timbradoFecha: string; // Formato: YYYY-MM-DD
  tipoContribuyente: number;
  tipoRegimen: number;
  establecimientos: Establecimiento[];
}

export interface EmisorResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    ruc: string;
    razonSocial: string;
    nombreFantasia: string;
    timbradoNumero: string;
    timbradoFecha: string;
    tipoContribuyente: number;
    tipoRegimen: number;
  };
}

export interface SubirCertificadoDTO {
  emisorId: number;
  password: string;
  CSC: string;
  certificado: File;
}

export interface CertificadoResponse {
  success: boolean;
  message: string;
  data?: {
    emisorId: number;
    certificadoPath: string;
    fechaSubida: string;
  };
}

/**
 * Valores de ejemplo para el formulario
 */
export const TIPO_CONTRIBUYENTE = {
  PERSONA_FISICA: 1,
  PERSONA_JURIDICA: 2,
} as const;

export const TIPO_REGIMEN = {
  SIMPLIFICADO: 8,
  GENERAL: 1,
} as const;

/**
 * Departamentos de Paraguay (algunos comunes)
 */
export const DEPARTAMENTOS_PARAGUAY = [
  { id: 1, nombre: "CONCEPCION" },
  { id: 2, nombre: "SAN PEDRO" },
  { id: 3, nombre: "CORDILLERA" },
  { id: 4, nombre: "GUAIRA" },
  { id: 5, nombre: "CAAGUAZU" },
  { id: 6, nombre: "CAAZAPA" },
  { id: 7, nombre: "ITAPUA" },
  { id: 8, nombre: "MISIONES" },
  { id: 9, nombre: "PARAGUARI" },
  { id: 10, nombre: "ALTO PARANA" },
  { id: 11, nombre: "ALTO PARANA" },
  { id: 12, nombre: "CENTRAL" },
  { id: 13, nombre: "ÑEEMBUCU" },
  { id: 14, nombre: "AMAMBAY" },
  { id: 15, nombre: "CANINDEYU" },
  { id: 16, nombre: "PRESIDENTE HAYES" },
  { id: 17, nombre: "BOQUERON" },
  { id: 18, nombre: "ALTO PARAGUAY" },
] as const;
