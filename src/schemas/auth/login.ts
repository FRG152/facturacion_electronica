import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Por favor, ingrese su nombre de usuario"),
  password: z
    .string()
    .min(1, "Por favor, ingrese su contraseña")
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
