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
 * @returns Código numérico: 1 = IVA 10%, 2 = IVA 5%, 3 = exentas
 *
 * @example
 * convertIvaToCode(10) // returns 1
 * convertIvaToCode(5) // returns 2
 * convertIvaToCode(0) // returns 3
 */
export function convertIvaToCode(iva: number): 1 | 2 | 3 {
  if (iva === 10) return 1; // IVA 10%
  if (iva === 5) return 2; // IVA 5%
  return 3; // Exentas (0%)
}

/**
 * Mapea códigos de unidades de medida a códigos numéricos de la SET (Paraguay)
 * Según tabla de unidades de medida de facturación electrónica
 * @param unidad - Código de unidad (UNI, KG, L, M, M2, M3)
 * @returns Código numérico según tabla de la SET
 *
 * @example
 * mapUnidadMedidaToCode("UNI") // returns 77 (Unidad)
 * mapUnidadMedidaToCode("KG") // returns 83 (Kilogramo)
 * mapUnidadMedidaToCode("M2") // returns 109 (Metros cuadrados)
 */
export function mapUnidadMedidaToCode(unidad: string): number {
  const unidadUpper = unidad.toUpperCase();

  // Tabla de códigos de unidades de medida según SET Paraguay
  // Códigos corregidos según documentación oficial de la API
  const codigosUnidad: Record<string, number> = {
    UNI: 77,    // Unidad
    KG: 83,     // Kilogramo
    L: 89,      // Litro
    M: 87,      // Metro
    M2: 109,    // Metro cuadrado
    M3: 110,    // Metro cúbico
    GR: 86,     // Gramo
    HR: 100,    // Hora
    MIN: 101,   // Minuto
    SEG: 666,   // Segundo
    KM: 625,    // Kilómetro
    CM: 91,     // Centímetro
    MM: 95,     // Milímetro
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

/**
 * Calcula el dígito verificador (DV) de un RUC paraguayo
 * Algoritmo: Módulo 11 con pesos 2-9 (de derecha a izquierda, cíclico)
 *
 * @param rucBase - Número base del RUC (sin el DV)
 * @returns Dígito verificador calculado (0-9)
 *
 * @example
 * calcularDVRuc("80012345") // returns 3
 */
export function calcularDVRuc(rucBase: string): number {
  // Limpiar el RUC base (solo números)
  const baseNumeros = rucBase.replace(/[^0-9]/g, "");

  // Pesos del algoritmo módulo 11: se repiten cíclicamente de 2 a 9
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];

  let suma = 0;
  const digitos = baseNumeros.split("").reverse();

  for (let i = 0; i < digitos.length; i++) {
    const digito = parseInt(digitos[i], 10);
    const peso = pesos[i % pesos.length];
    suma += digito * peso;
  }

  const resto = suma % 11;
  const dv = resto === 0 ? 0 : resto === 1 ? 1 : 11 - resto;

  return dv;
}

/**
 * Valida el formato y dígito verificador de un RUC paraguayo
 * Formato esperado: XXXXXXXX-Y donde Y es el dígito verificador
 *
 * @param ruc - RUC completo a validar
 * @returns Objeto con validez y mensaje de error si aplica
 *
 * @example
 * validarRuc("80012345-3") // returns { valido: true }
 * validarRuc("80012345") // returns { valido: false, error: "El RUC debe incluir el dígito verificador..." }
 * validarRuc("80012345-5") // returns { valido: false, error: "El dígito verificador del RUC es incorrecto..." }
 */
export function validarRuc(ruc: string): { valido: boolean; error?: string } {
  if (!ruc || ruc.trim() === "") {
    return {
      valido: false,
      error: "El RUC es requerido para emitir la factura"
    };
  }

  // Limpiar espacios
  const rucLimpio = ruc.trim();

  // Verificar formato básico (debe tener guión y dígito verificador)
  if (!rucLimpio.includes("-")) {
    return {
      valido: false,
      error: "El RUC debe incluir el dígito verificador en el formato: XXXXXXXX-Y"
    };
  }

  // Separar base y DV
  const partes = rucLimpio.split("-");
  if (partes.length !== 2) {
    return {
      valido: false,
      error: "El formato del RUC es incorrecto. Use el formato: XXXXXXXX-Y"
    };
  }

  const [base, dvStr] = partes;

  // Validar que la base sea numérica y tenga longitud adecuada (7-8 dígitos)
  if (!/^\d{7,8}$/.test(base)) {
    return {
      valido: false,
      error: "La parte numérica del RUC debe contener entre 7 y 8 dígitos"
    };
  }

  // Validar que el DV sea numérico y de un solo dígito
  if (!/^\d$/.test(dvStr)) {
    return {
      valido: false,
      error: "El dígito verificador debe ser un número entre 0 y 9"
    };
  }

  // Calcular el DV esperado
  const dvEsperado = calcularDVRuc(base);
  const dvRecibido = parseInt(dvStr, 10);

  if (dvEsperado !== dvRecibido) {
    return {
      valido: false,
      error: `El dígito verificador del RUC es incorrecto. El dígito correcto es: ${dvEsperado}`
    };
  }

  return { valido: true };
}

/**
 * Formatea un RUC asegurando que tenga el formato correcto con DV
 * Si el RUC no tiene DV, lo calcula y lo agrega
 *
 * @param ruc - RUC a formatear (con o sin DV)
 * @returns RUC formateado con DV en formato XXXXXXXX-Y
 *
 * @example
 * formatearRuc("80012345") // returns "80012345-3"
 * formatearRuc("80012345-3") // returns "80012345-3"
 * formatearRuc("80012345-") // returns "80012345-3"
 */
export function formatearRuc(ruc: string): string {
  if (!ruc || ruc.trim() === "") {
    return "";
  }

  // Limpiar espacios
  let rucLimpio = ruc.trim();

  // Si ya tiene el formato correcto, validar y retornar
  if (rucLimpio.includes("-")) {
    const validacion = validarRuc(rucLimpio);
    if (validacion.valido) {
      return rucLimpio;
    }
    // Si no es válido, intentar reconstruirlo
    const base = rucLimpio.split("-")[0].replace(/[^0-9]/g, "");
    if (base.length >= 7) {
      const dv = calcularDVRuc(base);
      return `${base}-${dv}`;
    }
  }

  // Si no tiene guión, asumir que es solo la base
  const baseNumeros = rucLimpio.replace(/[^0-9]/g, "");
  if (baseNumeros.length >= 7) {
    const dv = calcularDVRuc(baseNumeros);
    return `${baseNumeros}-${dv}`;
  }

  // Si no se puede formatear, retornar como estaba
  return ruc;
}

/**
 * Formatea una fecha para la API de SET Paraguay
 * Formato requerido: "2025-08-14T10:57:26" (sin milisegundos ni zona horaria)
 *
 * @param date - Fecha a formatear (por defecto: fecha actual)
 * @returns Fecha en formato ISO sin milisegundos ni zona horaria
 *
 * @example
 * formatDateForSET() // returns "2025-10-13T22:35:11"
 * formatDateForSET(new Date("2025-08-14T10:57:26.496Z")) // returns "2025-08-14T10:57:26"
 */
export function formatDateForSET(date: Date = new Date()): string {
  // Convertir a ISO string y remover milisegundos (.XXX) y zona horaria (Z)
  // "2025-10-13T22:35:11.496Z" -> "2025-10-13T22:35:11"
  return date.toISOString().split('.')[0];
}
