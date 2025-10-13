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
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en login:", error);
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
    console.error("Error al validar token:", error);
    return false;
  }
};
