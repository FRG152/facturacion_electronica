/**
 * Helper para gestión de autenticación multi-backend
 *
 * Este sistema usa DOS tipos de autenticación:
 * 1. JWT (Bearer Token) - Para Backend PHP (documentos, productos, facturación)
 * 2. X-API-Token - Para Backend Node.js (empresas, clientes)
 */

import type { Empresa } from "../interfaces/empresas";

const EMPRESA_ACTIVA_KEY = "empresa_activa";
const API_TOKEN_KEY = "current_api_token";

/**
 * Obtiene el api_token de la empresa activa
 * @returns string | null - Token de la empresa o null si no hay empresa activa
 */
export const getApiToken = (): string | null => {
  try {
    // Primero intentar obtener el token directo
    const directToken = localStorage.getItem(API_TOKEN_KEY);
    if (directToken) {
      return directToken;
    }

    // Si no hay token directo, obtenerlo de la empresa activa
    const empresaActivaStr = localStorage.getItem(EMPRESA_ACTIVA_KEY);
    if (!empresaActivaStr) {
      console.warn("No hay empresa activa seleccionada");
      return null;
    }

    const empresaActiva: Empresa = JSON.parse(empresaActivaStr);

    if (!empresaActiva.api_token) {
      console.warn("La empresa activa no tiene api_token");
      return null;
    }

    return empresaActiva.api_token;
  } catch (error) {
    console.error("Error al obtener api_token:", error);
    return null;
  }
};

/**
 * Guarda la empresa activa en localStorage
 * @param empresa - Empresa a guardar como activa
 */
export const setEmpresaActiva = (empresa: Empresa): void => {
  try {
    localStorage.setItem(EMPRESA_ACTIVA_KEY, JSON.stringify(empresa));

    // También guardar el token directamente para acceso rápido
    if (empresa.api_token) {
      localStorage.setItem(API_TOKEN_KEY, empresa.api_token);
    }

    console.log("Empresa activa guardada:", empresa.nombre);
  } catch (error) {
    console.error("Error al guardar empresa activa:", error);
  }
};

/**
 * Obtiene la empresa activa desde localStorage
 * @returns Empresa | null
 */
export const getEmpresaActiva = (): Empresa | null => {
  try {
    const empresaActivaStr = localStorage.getItem(EMPRESA_ACTIVA_KEY);
    if (!empresaActivaStr) {
      return null;
    }
    return JSON.parse(empresaActivaStr) as Empresa;
  } catch (error) {
    console.error("Error al obtener empresa activa:", error);
    return null;
  }
};

/**
 * Limpia la empresa activa y su token
 */
export const clearEmpresaActiva = (): void => {
  try {
    localStorage.removeItem(EMPRESA_ACTIVA_KEY);
    localStorage.removeItem(API_TOKEN_KEY);
    console.log("Empresa activa limpiada");
  } catch (error) {
    console.error("Error al limpiar empresa activa:", error);
  }
};

/**
 * Actualiza el api_token de la empresa activa
 * Útil cuando se regenera el token
 * @param nuevoToken - Nuevo token de API
 */
export const updateApiToken = (nuevoToken: string): void => {
  try {
    const empresaActiva = getEmpresaActiva();
    if (!empresaActiva) {
      console.warn("No hay empresa activa para actualizar token");
      return;
    }

    empresaActiva.api_token = nuevoToken;
    setEmpresaActiva(empresaActiva);
    console.log("Token actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar token:", error);
  }
};

/**
 * Obtiene el JWT token del sistema de autenticación principal
 * @returns string | null
 */
export const getJwtToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

/**
 * Crea los headers correctos según el tipo de autenticación
 * @param useApiToken - Si true, usa X-API-Token; si false, usa JWT Bearer
 * @returns Headers object
 */
export const getAuthHeaders = (useApiToken: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (useApiToken) {
    // Para Backend Node.js (empresas, clientes)
    const apiToken = getApiToken();
    if (apiToken) {
      headers["X-API-Token"] = apiToken;
    }
  } else {
    // Para Backend PHP (documentos, productos, facturación)
    const jwtToken = getJwtToken();
    if (jwtToken) {
      headers["authorization"] = `Bearer ${jwtToken}`;
    }
  }

  return headers;
};

/**
 * Verifica si hay un api_token válido disponible
 * @returns boolean
 */
export const hasValidApiToken = (): boolean => {
  const token = getApiToken();
  return token !== null && token.length > 0;
};

/**
 * Verifica si hay un JWT token válido disponible
 * @returns boolean
 */
export const hasValidJwtToken = (): boolean => {
  const token = getJwtToken();
  return token !== null && token.length > 0;
};
