/**
 * Interfaces para el módulo de Empresas
 * Sistema multi-empresa
 * Estructura basada en postman_collection.json
 */

export interface Empresa {
  id: number;
  nombre: string;
  ruc: string; // Formato: "80012345-6"
  email?: string;
  telefono?: string;
  direccion?: string;
  api_token?: string; // Generado automáticamente por el backend
  activo?: number; // 0 o 1
  created_at?: string;
  updated_at?: string;
}

export interface CrearEmpresaDTO {
  nombre: string;
  ruc: string; // Formato: "80012345-6"
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface ActualizarEmpresaDTO {
  nombre?: string;
  ruc?: string; // Formato: "80012345-6"
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface ListarEmpresasParams {
  page?: number;
  limit?: number;
  search?: string;
  activo?: number; // 0 o 1
}

export interface PaginacionEmpresas {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListarEmpresasResponse {
  success: boolean;
  data: Empresa[];
  pagination: PaginacionEmpresas;
}

export interface EmpresaResponse {
  success: boolean;
  message: string;
  data: Empresa;
}

export interface DeleteEmpresaResponse {
  success: boolean;
  message: string;
}
