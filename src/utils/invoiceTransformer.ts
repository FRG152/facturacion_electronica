import type {
  CompleteInvoiceStructure,
  FacturaData,
  InvoiceCliente,
  InvoiceUsuario,
  InvoiceCondicion,
  InvoiceItemAPI,
} from "../interfaces";
import {
  mapUnidadMedida,
  mapUnidadMedidaToCode,
  convertIvaToCode,
  normalizarTelefono,
} from "../lib/utils";

/**
 * Transforms the current form data structure to the complete API structure
 */
export function transformToCompleteInvoiceStructure(
  facturaData: FacturaData,
  additionalData: {
    tipoDocumento?: number;
    establecimiento?: string;
    punto?: string;
    numero?: number;
    codigoSeguridadAleatorio?: string;
    descripcion?: string;
    observacion?: string;
    fecha?: string;
    tipoEmision?: number;
    tipoTransaccion?: number;
    tipoImpuesto?: number;
    moneda?: string;
    condicionAnticipo?: number;
    condicionTipoCambio?: number;
    descuentoGlobal?: number;
    anticipoGlobal?: number;
    cambio?: string;
    usuario?: InvoiceUsuario;
  }
): CompleteInvoiceStructure {
  const now = new Date().toISOString();

  return {
    tipoDocumento: additionalData.tipoDocumento || 1,
    establecimiento: additionalData.establecimiento || "001",
    punto: additionalData.punto || "001",
    numero: additionalData.numero || 10,
    codigoSeguridadAleatorio:
      additionalData.codigoSeguridadAleatorio || generateRandomCode(),
    descripcion: additionalData.descripcion || "Factura electrónica",
    observacion: additionalData.observacion || "",
    fecha: additionalData.fecha || now,
    tipoEmision: additionalData.tipoEmision || 1,
    tipoTransaccion: additionalData.tipoTransaccion || 2,
    tipoImpuesto: additionalData.tipoImpuesto || 1,
    moneda: additionalData.moneda || "PYG",
    condicionAnticipo: additionalData.condicionAnticipo || 0,
    condicionTipoCambio: additionalData.condicionTipoCambio || 0,
    descuentoGlobal: additionalData.descuentoGlobal || 0,
    anticipoGlobal: additionalData.anticipoGlobal || 0,
    cambio: additionalData.cambio || "",
    factura: {
      presencia: 1,
      fecha: additionalData.fecha || now,
    },
    cliente: transformCliente(facturaData.cliente),
    usuario: additionalData.usuario || getDefaultUsuario(),
    condicion: transformCondicion(
      // facturaData.condicionPago,
      facturaData.totales.totalVenta
    ),
    items: transformItems(facturaData.items),
  };
}

/**
 * Transforms the current Client interface to InvoiceCliente
 * Maneja correctamente personas físicas y jurídicas según datos de README-API.md
 * y el formato requerido por final_structure.json
 */
function transformCliente(cliente: any): InvoiceCliente {
  if (!cliente) {
    throw new Error("Cliente es requerido para emitir la factura");
  }

  // Determinar tipo de persona y documento
  // Si viene de la API de clientes, tiene tipo_persona y campos separados
  // Si viene de la interfaz Client antigua, solo tiene ruc
  const tipoPersona = cliente.tipo_persona || (cliente.ruc ? "juridica" : "fisica");
  const esPersonaJuridica = tipoPersona === "juridica";

  // Determinar RUC/CI según el tipo de persona
  let ruc = "";
  let documentoNumero = "";

  if (esPersonaJuridica) {
    // Persona Jurídica: usa RUC completo y extrae el número
    ruc = cliente.ruc || "";
    documentoNumero = ruc.replace(/[^0-9]/g, ""); // Extraer solo números del RUC
  } else {
    // Persona Física: puede tener RUC o solo CI
    const tieneRuc = cliente.tiene_ruc === 1 || (cliente.ruc && cliente.ruc.length > 0);

    if (tieneRuc && cliente.ruc) {
      // Tiene RUC: usar RUC completo y extraer número
      ruc = cliente.ruc;
      documentoNumero = ruc.replace(/[^0-9]/g, "");
    } else if (cliente.ci) {
      // Solo tiene CI: usar CI como documento
      documentoNumero = cliente.ci.replace(/[^0-9]/g, "");
      ruc = ""; // Persona física sin RUC
    } else {
      // Fallback: intentar usar ruc como documento genérico
      documentoNumero = (cliente.ruc || "").replace(/[^0-9]/g, "");
    }
  }

  // Normalizar teléfono al formato E.164
  const telefonoNormalizado = cliente.telefono
    ? normalizarTelefono(cliente.telefono, cliente.pais_telefono || "PY")
    : "";

  // Usar datos geográficos del cliente si están disponibles, sino usar valores por defecto
  const departamento = cliente.id_departamento || 11; // Por defecto: Alto Paraná
  const distrito = cliente.id_distrito || 173; // Por defecto: Ciudad del Este
  const ciudad = cliente.id_ciudad || 4278; // Por defecto: Ciudad del Este

  // Mapeo de nombres de departamento (puede expandirse según necesidades)
  const departamentoDescripcion = getDepartamentoNombre(departamento);
  const distritoDescripcion = getDistritoNombre(distrito);
  const ciudadDescripcion = getCiudadNombre(ciudad);

  return {
    contribuyente: true,
    razonSocial: cliente.nombre || "",
    tipoOperacion: 1, // B2B
    tipoContribuyente: esPersonaJuridica ? 2 : 1, // 1=Persona física, 2=Persona jurídica
    direccion: cliente.direccion || "",
    numeroCasa: "0",
    departamento,
    departamentoDescripcion,
    distrito,
    distritoDescripcion,
    ciudad,
    ciudadDescripcion,
    pais: "PRY",
    paisDescripcion: "Paraguay",
    telefono: telefonoNormalizado,
    celular: telefonoNormalizado,
    email: cliente.email || "",
    codigo: "026", // Código genérico
    ruc: ruc,
    documentoTipo: 1, // 1=RUC/CI según SET Paraguay
    documentoNumero: documentoNumero,
  };
}

/**
 * Helper functions para obtener nombres de ubicaciones geográficas
 * Estos mapeos básicos pueden expandirse o conectarse a un servicio
 */
function getDepartamentoNombre(id: number): string {
  const departamentos: { [key: number]: string } = {
    1: "CONCEPCION",
    2: "SAN PEDRO",
    3: "CORDILLERA",
    4: "GUAIRA",
    5: "CAAGUAZU",
    6: "CAAZAPA",
    7: "ITAPUA",
    8: "MISIONES",
    9: "PARAGUARI",
    10: "ALTO PARANA",
    11: "ALTO PARANA",
    12: "CENTRAL",
    13: "ÑEEMBUCU",
    14: "AMAMBAY",
    15: "CANINDEYU",
    16: "PRESIDENTE HAYES",
    17: "BOQUERON",
    18: "ALTO PARAGUAY",
  };
  return departamentos[id] || "ALTO PARANA";
}

function getDistritoNombre(id: number): string {
  const distritos: { [key: number]: string } = {
    173: "CIUDAD DEL ESTE",
    // Agregar más distritos según se necesite
  };
  return distritos[id] || "CIUDAD DEL ESTE";
}

function getCiudadNombre(id: number): string {
  const ciudades: { [key: number]: string } = {
    4278: "CIUDAD DEL ESTE",
    // Agregar más ciudades según se necesite
  };
  return ciudades[id] || "CIUDAD DEL ESTE";
}

/**
 * Transforms the current InvoiceItem interface to InvoiceItemAPI
 * Usa las funciones correctas de utils.ts con códigos oficiales de la SET Paraguay
 */
function transformItems(items: any[]): InvoiceItemAPI[] {
  return items.map((item) => {
    // Normalizar la unidad primero (ej: "Kilogramo" → "KG")
    const unidadNormalizada = mapUnidadMedida(item.unidad);

    // Convertir a código numérico de la SET (ej: "KG" → 22)
    const unidadMedidaCode = mapUnidadMedidaToCode(unidadNormalizada);

    // Obtener porcentaje de IVA desde el tipo
    const ivaPercentage = getIvaPercentage(item.tipoIva);

    // Convertir a código numérico de la SET (ej: 10% → 3)
    const ivaTipoCode = convertIvaToCode(ivaPercentage);

    return {
      codigo: item.codigo || "",
      descripcion: item.descripcion || "",
      observacion: "",
      unidadMedida: unidadMedidaCode,
      cantidad: item.cantidad || 0,
      precioUnitario: item.precio || 0,
      cambio: 0,
      descuento: 0,
      anticipo: 0,
      pais: "PRY",
      paisDescripcion: "Paraguay",
      ivaTipo: ivaTipoCode,
      ivaBase: 100,
      iva: ivaPercentage,
    };
  });
}

/**
 * Transforms payment condition to InvoiceCondicion
 */
function transformCondicion(
  // condicionPago: string,
  totalVenta: number
): InvoiceCondicion {
  return {
    tipo: 1,
    entregas: [
      {
        tipo: 1,
        monto: totalVenta,
        moneda: "PYG",
        cambio: 0,
      },
    ],
  };
}

/**
 * Gets the default usuario data
 * NOTA: Esta función debería recibir el usuario autenticado desde Redux
 * Ver GenerateInvoice.tsx para pasar el usuario real
 */
function getDefaultUsuario(): InvoiceUsuario {
  // Valores por defecto si no se proporciona usuario
  return {
    documentoTipo: 1,
    documentoNumero: "0",
    nombre: "Usuario del Sistema",
    cargo: "Vendedor",
  };
}

/**
 * Generates a random 6-digit code
 */
function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * ⚠️ NOTA: Las funciones getUnidadMedidaCode y getIvaTipoCode fueron removidas.
 * Ahora usamos las funciones correctas de utils.ts:
 * - mapUnidadMedidaToCode() para códigos de unidad de medida
 * - convertIvaToCode() para códigos de IVA
 *
 * Estos códigos están basados en la tabla oficial de la SET Paraguay.
 */

/**
 * Gets IVA percentage based on type
 */
function getIvaPercentage(tipoIva: string): number {
  const ivaMap: { [key: string]: number } = {
    exentas: 0,
    iva5: 5,
    iva10: 10,
  };
  return ivaMap[tipoIva] || 10;
}
