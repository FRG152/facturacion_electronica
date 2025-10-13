/**
 * Schema de validación para Empresas
 * Basado en postman_collection.json
 */

import { z } from "zod";

// Schema para crear empresa
export const crearEmpresaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre de la empresa es requerido")
    .max(255, "El nombre es demasiado largo"),

  // RUC: formato "80012345-6" (7-8 dígitos, guion, 1 dígito)
  ruc: z
    .string()
    .regex(/^\d{7,8}-\d{1}$/, "Formato de RUC inválido. Ejemplo: 80012345-6"),

  email: z
    .string()
    .email("Formato de email inválido")
    .optional()
    .or(z.literal("")),

  telefono: z.string().optional().or(z.literal("")),

  direccion: z.string().optional().or(z.literal("")),
});

// Schema para actualizar empresa
export const actualizarEmpresaSchema = crearEmpresaSchema.partial();

// Tipos inferidos
export type CrearEmpresaFormData = z.infer<typeof crearEmpresaSchema>;
export type ActualizarEmpresaFormData = z.infer<typeof actualizarEmpresaSchema>;
