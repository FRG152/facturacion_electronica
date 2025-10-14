/**
 * Servicios de API para gestión de empresas
 * Sistema multi-empresa
 */

import type {
  CrearEmpresaDTO,
  ActualizarEmpresaDTO,
  ListarEmpresasParams,
  ListarEmpresasResponse,
  EmpresaResponse,
  DeleteEmpresaResponse,
} from "../interfaces/empresas";
import { getApiToken } from "../utils/authHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL_CLIENTS || "/api";

/**
 * Crear una nueva empresa (Endpoint PÚBLICO)
 * POST /api/empresas
 * NO requiere autenticación según postman_collection.json
 */
export const crearEmpresa = async (
  empresa: CrearEmpresaDTO
): Promise<EmpresaResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(empresa),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear empresa");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al crear empresa:", error);
    throw error;
  }
};

/**
 * Listar empresas con paginación y filtros
 * GET /api/empresas
 * Requiere X-API-Token
 */
export const listarEmpresas = async (
  params: ListarEmpresasParams = {}
): Promise<ListarEmpresasResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.activo !== undefined)
      queryParams.append("activo", params.activo.toString());

    const url = `${API_BASE_URL}/empresas`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al listar empresas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al listar empresas:", error);
    throw error;
  }
};

/**
 * Obtener empresa por ID
 * GET /api/empresas/:id
 * Requiere X-API-Token
 */
export const obtenerEmpresaPorId = async (
  id: number
): Promise<EmpresaResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "GET",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener empresa");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    throw error;
  }
};

/**
 * Actualizar empresa
 * PATCH /api/empresas/:id
 * Requiere X-API-Token
 */
export const actualizarEmpresa = async (
  id: number,
  empresa: ActualizarEmpresaDTO
): Promise<EmpresaResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "PATCH",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(empresa),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar empresa");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    throw error;
  }
};

/**
 * Eliminar empresa (soft delete)
 * DELETE /api/empresas/:id
 * Requiere X-API-Token
 */
export const eliminarEmpresa = async (
  id: number
): Promise<DeleteEmpresaResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "DELETE",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar empresa");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    throw error;
  }
};

/**
 * Activar/Desactivar empresa
 * PATCH /api/empresas/:id/toggle-active
 * Requiere X-API-Token
 */
export const toggleEmpresaStatus = async (
  id: number
): Promise<EmpresaResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/empresas/${id}/toggle-active`,
      {
        method: "PATCH",
        headers: {
          "X-API-Token": apiToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al cambiar estado de empresa"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error al cambiar estado de empresa:", error);
    throw error;
  }
};

/**
 * Regenerar token de API de la empresa
 * PATCH /api/empresas/:id/regenerate-token
 * Requiere X-API-Token
 */
export const regenerarToken = async (id: number): Promise<EmpresaResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/empresas/${id}/regenerate-token`,
      {
        method: "PATCH",
        headers: {
          "X-API-Token": apiToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al regenerar token");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al regenerar token:", error);
    throw error;
  }
};
