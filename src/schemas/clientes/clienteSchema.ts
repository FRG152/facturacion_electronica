/**
 * Schema de validación para Clientes
 * Basado en README-API.md
 */

import { z } from "zod";

// Schema para crear cliente
export const crearClienteSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es requerido")
      .max(255, "El nombre es demasiado largo"),

    tipo_persona: z.enum(["fisica", "juridica"], {
      message: "Tipo de persona inválido",
    }),

    // CI: exactamente 8 dígitos (solo persona física)
    ci: z
      .string()
      .regex(/^\d{8}$/, "La cédula debe tener exactamente 8 dígitos")
      .optional()
      .or(z.literal("")),

    fecha_nacimiento: z.string().optional().or(z.literal("")),

    tiene_ruc: z.number().min(0).max(1).optional(),

    // RUC: formato 80012345-6 (7-8 dígitos + guion + 1 dígito)
    ruc: z
      .string()
      .regex(
        /^\d{7,8}-\d{1}$/,
        "RUC inválido (formato: 80012345-6)"
      )
      .optional()
      .or(z.literal("")),

    telefono: z.string().optional().or(z.literal("")),

    direccion: z.string().optional().or(z.literal("")),

    email: z
      .string()
      .email("Formato de email inválido")
      .optional()
      .or(z.literal("")),

    empresa_id: z.number().optional(),
  })
  .refine(
    (data) => {
      // Validación condicional: persona física requiere CI
      if (data.tipo_persona === "fisica") {
        return data.ci && data.ci.length > 0;
      }
      return true;
    },
    {
      message: "La cédula es obligatoria para personas físicas",
      path: ["ci"],
    }
  )
  .refine(
    (data) => {
      // Validación condicional: persona jurídica requiere RUC
      if (data.tipo_persona === "juridica") {
        return data.ruc && data.ruc.length > 0;
      }
      return true;
    },
    {
      message: "El RUC es obligatorio para personas jurídicas",
      path: ["ruc"],
    }
  )
  .refine(
    (data) => {
      // Validación: si tiene_ruc es 1 y es física, debe tener RUC
      if (data.tipo_persona === "fisica" && data.tiene_ruc === 1) {
        return data.ruc && data.ruc.length > 0;
      }
      return true;
    },
    {
      message: "El RUC es obligatorio si 'tiene RUC' está marcado",
      path: ["ruc"],
    }
  );

// Schema para actualizar cliente (todos los campos opcionales excepto validaciones condicionales)
export const actualizarClienteSchema = crearClienteSchema.partial();

// Tipos inferidos
export type CrearClienteFormData = z.infer<typeof crearClienteSchema>;
export type ActualizarClienteFormData = z.infer<typeof actualizarClienteSchema>;
