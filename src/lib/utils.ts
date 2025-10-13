import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función de utilidad para combinar clases de Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mapea el nombre de una unidad de medida a su código estándar
 * @param unidad - Nombre de la unidad (ej: "Unidad", "Kilogramo", "KG")
 * @returns Código de unidad estándar (UNI, KG, L, M, M2, M3)
 *
 * @example
 * mapUnidadMedida("Kilogramo") // returns "KG"
 * mapUnidadMedida("KG") // returns "KG"
 * mapUnidadMedida("Unidad") // returns "UNI"
 */
export function mapUnidadMedida(unidad?: string): string {
  if (!unidad) return "UNI";

  const unidadUpper = unidad.toUpperCase();

  // Si ya es un código válido, devolverlo directamente
  if (["UNI", "KG", "L", "M", "M2", "M3"].includes(unidadUpper)) {
    return unidadUpper;
  }

  // Mapear nombres comunes a sus códigos estándar
  if (unidad.toLowerCase().includes("unidad")) return "UNI";
  if (unidad.toLowerCase().includes("kilo")) return "KG";
  if (unidad.toLowerCase().includes("litro")) return "L";
  if (unidad.toLowerCase().includes("metro")) {
    if (unidad.toLowerCase().includes("cuadrado")) return "M2";
    if (
      unidad.toLowerCase().includes("cúbico") ||
      unidad.toLowerCase().includes("cubico")
    )
      return "M3";
    return "M";
  }

  // Por defecto, retornar unidad
  return "UNI";
}

/**
 * Convierte un porcentaje de IVA a su tipo correspondiente para facturación
 * @param iva - Porcentaje de IVA (0, 5, 10, 19, etc.)
 * @returns Tipo de IVA ("exentas", "iva5", "iva10")
 *
 * @example
 * convertIvaToType(0) // returns "exentas"
 * convertIvaToType(5) // returns "iva5"
 * convertIvaToType(10) // returns "iva10"
 * convertIvaToType(19) // returns "iva10"
 */
export function convertIvaToType(iva: number): "exentas" | "iva5" | "iva10" {
  if (iva === 0) return "exentas";
  if (iva === 5) return "iva5";
  return "iva10";
}

/**
 * Convierte un porcentaje de IVA a su código numérico para la SET (Paraguay)
 * Según estándares de facturación electrónica paraguaya
 * @param iva - Porcentaje de IVA (0, 5, 10, 19, etc.)
 * @returns Código numérico: 1 = exentas, 2 = 5%, 3 = 10%
 *
 * @example
 * convertIvaToCode(0) // returns 1
 * convertIvaToCode(5) // returns 2
 * convertIvaToCode(10) // returns 3
 * convertIvaToCode(19) // returns 3
 */
export function convertIvaToCode(iva: number): 1 | 2 | 3 {
  if (iva === 0) return 1; // Exentas
  if (iva === 5) return 2; // IVA 5%
  return 3; // IVA 10%
}

/**
 * Mapea códigos de unidades de medida a códigos numéricos de la SET (Paraguay)
 * Según tabla de unidades de medida de facturación electrónica
 * @param unidad - Código de unidad (UNI, KG, L, M, M2, M3)
 * @returns Código numérico según tabla de la SET
 *
 * @example
 * mapUnidadMedidaToCode("UNI") // returns 77 (Unidad)
 * mapUnidadMedidaToCode("KG") // returns 22 (Kilogramo)
 */
export function mapUnidadMedidaToCode(unidad: string): number {
  const unidadUpper = unidad.toUpperCase();

  // Tabla de códigos de unidades de medida según SET Paraguay
  const codigosUnidad: Record<string, number> = {
    UNI: 77,    // Unidad
    KG: 22,     // Kilogramo
    L: 27,      // Litro
    M: 10,      // Metro
    M2: 11,     // Metro cuadrado
    M3: 12,     // Metro cúbico
    GR: 21,     // Gramo
    HR: 31,     // Hora
    MIN: 32,    // Minuto
    SEG: 33,    // Segundo
    KM: 6,      // Kilómetro
    CM: 8,      // Centímetro
    MM: 9,      // Milímetro
  };

  return codigosUnidad[unidadUpper] || 77; // Por defecto: Unidad
}

/**
 * Normaliza un número de teléfono al formato E.164
 * Según README-API.md: "Conversión automática al formato E.164"
 *
 * @param telefono - Número de teléfono sin normalizar
 * @param pais - Código de país (default: "PY" para Paraguay)
 * @returns Número normalizado en formato E.164
 *
 * @example
 * normalizarTelefono("0981123456", "PY") // returns "595981123456"
 * normalizarTelefono("981123456", "PY")  // returns "595981123456"
 * normalizarTelefono("021123456", "PY")  // returns "59521123456"
 * normalizarTelefono("+595981123456")    // returns "595981123456"
 */
export function normalizarTelefono(telefono: string, pais: string = "PY"): string {
  if (!telefono || telefono.trim() === "") {
    return "";
  }

  // Limpiar el teléfono: quitar espacios, guiones, paréntesis
  let cleaned = telefono.replace(/[\s\-\(\)]/g, "");

  // Si ya tiene el prefijo +, quitarlo
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Si es Paraguay
  if (pais === "PY") {
    // Si ya empieza con 595, retornarlo
    if (cleaned.startsWith("595")) {
      return cleaned;
    }

    // Si empieza con 0, quitarlo y agregar 595
    if (cleaned.startsWith("0")) {
      return "595" + cleaned.substring(1);
    }

    // Si no empieza con 0 ni 595, agregar 595
    return "595" + cleaned;
  }

  // Para otros países, retornar sin modificar (podría expandirse en el futuro)
  return cleaned;
}
