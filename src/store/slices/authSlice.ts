import {
  login as loginApi,
  logout as logoutApi,
  validateToken,
} from "../../api";

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { LoginFormData, User } from "../../schemas/auth/login";

interface AuthState {
  user: User | null;
  logout: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  logout: false,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);

      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("user_data", JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión. Por favor, intente nuevamente";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    } catch (error) {
      // Limpiar de todas formas
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      return rejectWithValue(
        "Error al cerrar sesión. La sesión se cerró localmente"
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        return null;
      } else {
        const user_data = localStorage.getItem("user_data");
        return JSON.parse(user_data || "") as User;
      }

      // // Si el token no es válido, limpiar el localStorage
      // localStorage.removeItem("auth_token");
      // localStorage.removeItem("user_data");
      return null;
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      return rejectWithValue(
        "Su sesión ha expirado. Por favor, inicie sesión nuevamente"
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setModalLogout: (state, action) => {
      state.logout = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Incluso si falla, limpiamos el estado
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        checkAuth.fulfilled,
        (state, action: PayloadAction<User | null>) => {
          state.isLoading = false;
          if (action.payload) {
            state.user = action.payload;
            state.isAuthenticated = true;
          } else {
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      )
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setModalLogout } = authSlice.actions;
export default authSlice.reducer;
