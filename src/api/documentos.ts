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
    const userToken =
      import.meta.env.VITE_USER_TOKEN ||
      "tu_token_secreto_aqui_cambiar_en_produccion";

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
      let mensajeError =
        "No se pudieron cargar los documentos. Intente nuevamente";

      try {
        const errorData = await response.json();
        switch (response.status) {
          case 401:
            mensajeError =
              "Su sesión ha expirado. Por favor, inicie sesión nuevamente";
            break;
          case 403:
            mensajeError = "No tiene permisos para ver los documentos";
            break;
          case 500:
            mensajeError = "Error en el servidor. Intente nuevamente más tarde";
            break;
          default:
            mensajeError = errorData.message || mensajeError;
        }
      } catch {
        // Si no se puede parsear el error, usar mensaje por defecto
      }

      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique su conexión a internet"
      );
    }
    throw error;
  }
};

export const crearDocumento = async (
  invoiceData: CompleteInvoiceStructure
): Promise<CrearDocumentoResponse> => {
  try {
    const token = localStorage.getItem("auth_token");
    const userToken =
      import.meta.env.VITE_USER_TOKEN ||
      "tu_token_secreto_aqui_cambiar_en_produccion";

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
      let mensajeError =
        "No se pudo generar la factura. Verifique los datos e intente nuevamente";

      try {
        const errorData = await response.json();

        // Extraer el mensaje de error más específico si existe
        let detalleError = errorData.message || "";

        switch (response.status) {
          case 400:
            // Error de validación - mostrar detalles específicos
            mensajeError = "Datos de factura inválidos:\n" + detalleError;
            break;
          case 401:
            mensajeError =
              "Su sesión ha expirado. Por favor, inicie sesión nuevamente";
            break;
          case 403:
            mensajeError = "No tiene permisos para generar facturas";
            break;
          case 422:
            mensajeError = "Error en los datos de la factura:\n" + detalleError;
            break;
          case 500:
            mensajeError =
              "Error en el servidor al procesar la factura. Intente nuevamente";
            break;
          default:
            mensajeError = detalleError || mensajeError;
        }
      } catch {
        // Si no se puede parsear el error, usar mensaje por defecto
      }

      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique su conexión a internet"
      );
    }
    throw error;
  }
};

export const generarPDF = async (xmlData: string): Promise<Blob> => {
  try {
    if (!xmlData || xmlData.trim() === "") {
      throw new Error(
        "No se puede generar el PDF sin datos XML. Verifique que la factura esté completa"
      );
    }

    const formData = new FormData();
    formData.append("xmlConQR", xmlData);

    const response = await fetch("/generarPdfDesdeXML.php", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let mensajeError = "No se pudo generar el PDF. Intente nuevamente";

      try {
        const errorData = await response.json();
        switch (response.status) {
          case 400:
            mensajeError =
              "Los datos del documento son inválidos. Verifique que la factura esté aprobada";
            break;
          case 404:
            mensajeError =
              "El servicio de generación de PDF no está disponible. Contacte al administrador";
            break;
          case 500:
            mensajeError =
              "Error en el servidor al generar el PDF. Intente nuevamente más tarde";
            break;
          default:
            mensajeError = errorData.message || mensajeError;
        }
      } catch {}

      throw new Error(mensajeError);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique su conexión a internet"
      );
    }
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
    const userToken =
      import.meta.env.VITE_USER_TOKEN ||
      "tu_token_secreto_aqui_cambiar_en_produccion";

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
    const userToken =
      import.meta.env.VITE_USER_TOKEN ||
      "tu_token_secreto_aqui_cambiar_en_produccion";

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
    const userToken =
      import.meta.env.VITE_USER_TOKEN ||
      "tu_token_secreto_aqui_cambiar_en_produccion";

    const response = await fetch(
      `${API_BASE_URL}/documentos/consulta-cdc/${cdc}`,
      {
        method: "GET",
        headers: {
          user_token: userToken,
        },
      }
    );

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
    const userToken =
      import.meta.env.VITE_USER_TOKEN ||
      "tu_token_secreto_aqui_cambiar_en_produccion";

    const response = await fetch(
      `${API_BASE_URL}/documentos/consulta-lote/${lote}`,
      {
        method: "GET",
        headers: {
          user_token: userToken,
        },
      }
    );

    if (!response.ok) {
      let mensajeError = "No se pudo consultar el lote. Intente nuevamente";

      try {
        const errorData = await response.json();
        switch (response.status) {
          case 404:
            mensajeError =
              "No se encontró ningún documento con ese número de lote";
            break;
          case 401:
            mensajeError =
              "Su sesión ha expirado. Por favor, inicie sesión nuevamente";
            break;
          case 500:
            mensajeError = "Error en el servidor. Intente nuevamente más tarde";
            break;
          default:
            mensajeError = errorData.message || mensajeError;
        }
      } catch {
        // Si no se puede parsear el error, usar mensaje por defecto
      }

      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique su conexión a internet"
      );
    }
    throw error;
  }
};

/**
 * Generar evento de cancelación de documento
 * POST /documentos/generar-documento-cancelacion/:cdc
 * Endpoint según tecasis-facturacion.json línea 309-346
 */
export const generarEventoCancelacion = async (cdc: string): Promise<any> => {
  try {
    const userToken =
      import.meta.env.VITE_USER_TOKEN ||
      "tu_token_secreto_aqui_cambiar_en_produccion";

    const response = await fetch(
      `${API_BASE_URL}/documentos/generar-documento-cancelacion/${cdc}`,
      {
        method: "POST",
        headers: {
          user_token: userToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let mensajeError = "No se pudo cancelar el documento. Intente nuevamente";

      try {
        const errorData = await response.json();
        switch (response.status) {
          case 400:
            mensajeError =
              "El documento no puede ser cancelado: " +
              (errorData.message || "datos inválidos");
            break;
          case 404:
            mensajeError =
              "No se encontró el documento con el CDC proporcionado";
            break;
          case 401:
            mensajeError =
              "Su sesión ha expirado. Por favor, inicie sesión nuevamente";
            break;
          case 409:
            mensajeError = "El documento ya fue cancelado anteriormente";
            break;
          case 500:
            mensajeError = "Error en el servidor. Intente nuevamente más tarde";
            break;
          default:
            mensajeError = errorData.message || mensajeError;
        }
      } catch {
        // Si no se puede parsear el error, usar mensaje por defecto
      }

      throw new Error(mensajeError);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique su conexión a internet"
      );
    }
    throw error;
  }
};
