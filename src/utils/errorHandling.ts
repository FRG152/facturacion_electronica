/**
 * Utilidades para manejo de errores amigables para el usuario
 */

/**
 * Convierte errores HTTP en mensajes amigables para el usuario
 * @param response - Response de fetch
 * @param contexto - Contexto de la operación (ej: "listar clientes", "crear producto")
 * @returns Mensaje de error amigable
 */
export async function obtenerMensajeErrorAmigable(
  response: Response,
  contexto: string
): Promise<string> {
  let mensajeError = `No se pudo ${contexto}. Por favor, intente nuevamente`;

  try {
    const errorData = await response.json();
    const detalleError = errorData.message || "";

    switch (response.status) {
      case 400:
        mensajeError = `Datos inválidos al ${contexto}${detalleError ? ": " + detalleError : ""}`;
        break;
      case 401:
        mensajeError = "Su sesión ha expirado. Por favor, inicie sesión nuevamente";
        break;
      case 403:
        mensajeError = `No tiene permisos para ${contexto}`;
        break;
      case 404:
        mensajeError = `No se encontró el recurso solicitado`;
        break;
      case 409:
        mensajeError = `Conflicto al ${contexto}${detalleError ? ": " + detalleError : ""}`;
        break;
      case 422:
        mensajeError = `Error en los datos al ${contexto}${detalleError ? ": " + detalleError : ""}`;
        break;
      case 500:
        mensajeError = "Error en el servidor. Intente nuevamente más tarde";
        break;
      case 503:
        mensajeError = "El servicio no está disponible. Intente nuevamente en unos momentos";
        break;
      default:
        if (detalleError) {
          mensajeError = detalleError;
        }
    }
  } catch {
    // Si no se puede parsear el error, usar mensaje por defecto
  }

  return mensajeError;
}

/**
 * Maneja errores de fetch (errores de red, timeout, etc)
 * @param error - Error capturado
 * @param mensajePersonalizado - Mensaje personalizado opcional
 * @returns Error con mensaje amigable
 */
export function manejarErrorFetch(
  error: unknown,
  mensajePersonalizado?: string
): Error {
  // Error de red (fetch falló)
  if (error instanceof TypeError) {
    return new Error(
      mensajePersonalizado ||
        "No se pudo conectar con el servidor. Verifique su conexión a internet"
    );
  }

  // Error de timeout
  if (error instanceof Error && error.name === "AbortError") {
    return new Error(
      "La operación tardó demasiado tiempo. Intente nuevamente"
    );
  }

  // Si es un Error con mensaje, retornarlo
  if (error instanceof Error) {
    return error;
  }

  // Error desconocido
  return new Error(
    mensajePersonalizado || "Ocurrió un error inesperado. Intente nuevamente"
  );
}
