import type { LoginFormData, LoginResponse } from "../schemas/auth/login";

const API_BASE_URL = import.meta.env.VITE_API_URL_AUTH;

/**
 * Login de usuario con JWT Token
 * Endpoint público que no requiere autenticación previa
 * @param credentials - username y password del usuario
 * @returns LoginResponse con access_token y datos del usuario
 */
export const login = async (
  credentials: LoginFormData
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let mensajeError = "No se pudo iniciar sesión. Por favor, intente nuevamente";

      try {
        const errorData = await response.json();

        // Mapear códigos de error HTTP a mensajes amigables
        switch (response.status) {
          case 401:
            mensajeError = "Usuario o contraseña incorrectos. Verifique sus credenciales";
            break;
          case 403:
            mensajeError = "Su cuenta no tiene permisos para acceder al sistema";
            break;
          case 404:
            mensajeError = "Usuario no encontrado. Verifique su nombre de usuario";
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
    // Si es un error de red (fetch falló)
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el servidor. Verifique su conexión a internet");
    }
    // Re-lanzar el error original si ya tiene un mensaje personalizado
    throw error;
  }
};

/**
 * Logout de usuario
 * Limpia el localStorage (no hay endpoint de logout en el backend)
 */
export const logout = async (): Promise<void> => {
  try {
    // Limpiar tokens del localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  } catch (error) {
    console.error("Error en logout:", error);
    throw error;
  }
};


/**
 * Valida el token JWT actual
 * Endpoint: GET /users/validate (documentado en AUTHENTICATION.md)
 * @returns boolean indicando si el token es válido
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/users/validate`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    // Error de validación de token - simplemente retornar false
    // No es necesario mostrar error al usuario
    return false;
  }
};
