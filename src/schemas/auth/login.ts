import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
}
