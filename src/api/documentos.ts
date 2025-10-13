const API_BASE_URL = import.meta.env.VITE_API_URL_AUTH || "/api";

import type {
  CompleteInvoiceStructure,
  CrearDocumentoResponse,
  ListarDocumentosParams,
  ListarDocumentosResponse,
} from "../interfaces";

export const getListaDocumentos = async (
  params: ListarDocumentosParams = {}
): Promise<ListarDocumentosResponse> => {
  try {
    const token = localStorage.getItem("auth_token");
    const userToken = import.meta.env.VITE_USER_TOKEN || "tu_token_secreto_aqui_cambiar_en_produccion";

    const queryParams = new URLSearchParams();
    if (params.estado) queryParams.append("estado", params.estado);
    if (params.numeroDocumento)
      queryParams.append("numeroDocumento", params.numeroDocumento);
    if (params.cdc) queryParams.append("cdc", params.cdc);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${API_BASE_URL}/documentos/listar?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        user_token: userToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al listar documentos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al listar documentos:", error);
    throw error;
  }
};

export const crearDocumento = async (
  invoiceData: CompleteInvoiceStructure
): Promise<CrearDocumentoResponse> => {
  try {
    const token = localStorage.getItem("auth_token");
    const userToken = import.meta.env.VITE_USER_TOKEN || "tu_token_secreto_aqui_cambiar_en_produccion";

    // Endpoint correcto según tecasis-facturacion.json línea 50-93
    const response = await fetch(`${API_BASE_URL}/documentos`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        user_token: userToken, // Header requerido por el backend
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear documento");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al crear documento:", error);
    throw error;
  }
};

export const generarPDF = async (xmlData: string): Promise<Blob> => {
  try {
    const formData = new FormData();
    formData.append("xmlConQR", xmlData);

    const response = await fetch("/test-pdf-basico.php", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al generar PDF");
    }

    return await response.blob();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    throw error;
  }
};


/**
 * Configurar datos del emisor
 * POST /emisor
 * Endpoint según tecasis-facturacion.json línea 8-47
 * Requiere user_token en headers
 */
export const configurarEmisor = async (emisorData: any): Promise<any> => {
  try {
    const userToken = import.meta.env.VITE_USER_TOKEN || "tu_token_secreto_aqui_cambiar_en_produccion";

    const response = await fetch(`${API_BASE_URL}/emisor`, {
      method: "POST",
      headers: {
        user_token: userToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emisorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al configurar emisor");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al configurar emisor:", error);
    throw error;
  }
};

/**
 * Subir certificado del emisor
 * POST /certificado-emisor
 * Endpoint según tecasis-facturacion.json línea 96-157
 * Requiere user_token en headers y FormData
 */
export const subirCertificado = async (
  emisorId: number,
  password: string,
  csc: string,
  certificadoFile: File
): Promise<any> => {
  try {
    const userToken = import.meta.env.VITE_USER_TOKEN || "tu_token_secreto_aqui_cambiar_en_produccion";

    const formData = new FormData();
    formData.append("emisorId", emisorId.toString());
    formData.append("password", password);
    formData.append("CSC", csc);
    formData.append("certificado", certificadoFile);

    const response = await fetch(`${API_BASE_URL}/certificado-emisor`, {
      method: "POST",
      headers: {
        user_token: userToken,
        // NO incluir Content-Type, el navegador lo establece automáticamente con boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al subir certificado");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al subir certificado:", error);
    throw error;
  }
};

/**
 * Buscar documento por CDC
 * GET /documentos/consulta-cdc/:cdc
 * Endpoint según tecasis-facturacion.json línea 160-199
 */
export const consultarDocumentoPorCDC = async (cdc: string): Promise<any> => {
  try {
    const userToken = import.meta.env.VITE_USER_TOKEN || "tu_token_secreto_aqui_cambiar_en_produccion";

    const response = await fetch(`${API_BASE_URL}/documentos/consulta-cdc/${cdc}`, {
      method: "GET",
      headers: {
        user_token: userToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al consultar documento");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al consultar documento por CDC:", error);
    throw error;
  }
};

/**
 * Buscar documento por lote
 * GET /documentos/consulta-lote/:lote
 * Endpoint según tecasis-facturacion.json línea 202-243
 */
export const consultarDocumentoPorLote = async (lote: string): Promise<any> => {
  try {
    const userToken = import.meta.env.VITE_USER_TOKEN || "tu_token_secreto_aqui_cambiar_en_produccion";

    const response = await fetch(`${API_BASE_URL}/documentos/consulta-lote/${lote}`, {
      method: "GET",
      headers: {
        user_token: userToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al consultar lote");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al consultar documento por lote:", error);
    throw error;
  }
};
