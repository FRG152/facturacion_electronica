import type {
  CrearClienteDTO,
  ClienteResponse,
  ActualizarClienteDTO,
  ListarClientesParams,
  DeleteClienteResponse,
  ListarClientesResponse,
  ClienteEmpresaResponse,
} from "../interfaces/clientes";

import {
  manejarErrorFetch,
  obtenerMensajeErrorAmigable,
} from "../utils/errorHandling";

import { getApiToken } from "../utils/authHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL_CLIENTS;

/**
 * Crear un nuevo cliente
 * POST /api/clientes
 */
export const crearCliente = async (
  cliente: CrearClienteDTO
): Promise<ClienteResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error("Debe seleccionar una empresa antes de crear un cliente");
    }

    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: "POST",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cliente),
    });

    if (!response.ok) {
      const mensajeError = await obtenerMensajeErrorAmigable(
        response,
        "crear el cliente"
      );
      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    throw manejarErrorFetch(error);
  }
};

/**
 * Listar clientes con paginación y filtros
 * GET /api/clientes
 */
export const listarClientes = async (
  params: ListarClientesParams = {}
): Promise<ListarClientesResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error("Debe seleccionar una empresa para ver los clientes");
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.empresa_id)
      queryParams.append("empresa_id", params.empresa_id.toString());
    if (params.tipo_persona)
      queryParams.append("tipo_persona", params.tipo_persona);
    if (params.eliminado !== undefined)
      queryParams.append("eliminado", params.eliminado.toString());

    const url = `${API_BASE_URL}/clientes?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const mensajeError = await obtenerMensajeErrorAmigable(
        response,
        "cargar los clientes"
      );
      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    throw manejarErrorFetch(error);
  }
};

/**
 * Obtener cliente por ID
 * GET /api/clientes/:id
 */
export const obtenerClientePorId = async (
  id: number,
  empresa_id?: number
): Promise<ClienteResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    let url = `${API_BASE_URL}/clientes/${id}`;
    if (empresa_id) {
      url += `?empresa_id=${empresa_id}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener cliente");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    throw error;
  }
};

/**
 * Actualizar cliente
 * PATCH /api/clientes/:id
 */
export const actualizarCliente = async (
  id: number,
  cliente: ActualizarClienteDTO,
  empresa_id?: number
): Promise<ClienteResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "Debe seleccionar una empresa antes de actualizar el cliente"
      );
    }

    let url = `${API_BASE_URL}/clientes/${id}`;
    if (empresa_id) {
      url += `?empresa_id=${empresa_id}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cliente),
    });

    if (!response.ok) {
      const mensajeError = await obtenerMensajeErrorAmigable(
        response,
        "actualizar el cliente"
      );
      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    throw manejarErrorFetch(error);
  }
};

/**
 * Eliminar cliente (soft delete)
 * DELETE /api/clientes/:id
 */
export const eliminarCliente = async (
  id: number,
  empresa_id?: number
): Promise<DeleteClienteResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "Debe seleccionar una empresa antes de eliminar el cliente"
      );
    }

    let url = `${API_BASE_URL}/clientes/${id}`;
    if (empresa_id) {
      url += `?empresa_id=${empresa_id}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const mensajeError = await obtenerMensajeErrorAmigable(
        response,
        "eliminar el cliente"
      );
      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    throw manejarErrorFetch(error);
  }
};

/**
 * Restaurar cliente
 * PATCH /api/clientes/:id/restore
 */
export const restaurarCliente = async (
  id: number
): Promise<ClienteResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "Debe seleccionar una empresa antes de restaurar el cliente"
      );
    }

    const response = await fetch(`${API_BASE_URL}/clientes/${id}/restore`, {
      method: "PATCH",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const mensajeError = await obtenerMensajeErrorAmigable(
        response,
        "restaurar el cliente"
      );
      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    throw manejarErrorFetch(error);
  }
};

/**
 * Eliminar cliente permanentemente (hard delete)
 * DELETE /api/clientes/:id/hard
 */
export const eliminarClientePermanente = async (
  id: number
): Promise<DeleteClienteResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const response = await fetch(`${API_BASE_URL}/clientes/${id}/hard`, {
      method: "DELETE",
      headers: {
        "X-API-Token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al eliminar cliente permanentemente"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error al eliminar cliente permanentemente:", error);
    throw error;
  }
};

/**
 * Listar clientes por empresa
 * GET /api/clientes/empresa/:empresa_id
 */
export const listarClientesPorEmpresa = async (
  empresa_id: number
): Promise<ClienteEmpresaResponse> => {
  try {
    const apiToken = getApiToken();

    if (!apiToken) {
      throw new Error(
        "No hay empresa seleccionada o el token no está disponible"
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/clientes/empresa/${empresa_id}`,
      {
        method: "GET",
        headers: {
          "X-API-Token": apiToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al listar clientes por empresa"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error al listar clientes por empresa:", error);
    throw error;
  }
};
