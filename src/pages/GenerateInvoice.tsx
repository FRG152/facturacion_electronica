import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../components/ui/table";
import { Input } from "../components/Input";
import { Button } from "../components/ui/button";
import { Select } from "../components/Select";
import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import { ProductSearchModal } from "../components/Modals/ProductSearchModal";
import { CustomerSearchModal } from "../components/Modals/CustomerSearchModal";
import { ConfirmInvoiceModal } from "../components/Modals/ConfirmInvoiceModal";
import { paymentCondition, unit } from "@/constants/invoice";
import { Plus, Search, Trash2, Minus, FileText } from "lucide-react";
import type { InvoiceItem, Client, FacturaData } from "../interfaces";
import { transformToCompleteInvoiceStructure } from "../utils/invoiceTransformer";
import { crearDocumento } from "../api/documentos";
import { toast } from "sonner";
import { formatDateForSET } from "../lib/utils";

export function GenerarFactura() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [cliente, setCliente] = useState<Client | null>(null);
  const [proximoId, setProximoId] = useState(1);
  const [condicionPago, setCondicionPago] = useState("Contado");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener usuario autenticado desde Redux
  const { user } = useAppSelector((state) => state.auth);

  // Obtener empresa seleccionada desde Redux
  const { empresaSeleccionada } = useAppSelector((state) => state.empresas);

  const agregarItem = () => {
    const nuevoItem: InvoiceItem = {
      id: proximoId,
      codigo: "",
      descripcion: "",
      unidad: "UNI",
      cantidad: 1,
      precio: 0,
      tipoIva: "iva10",
    };
    setItems([...items, nuevoItem]);
    setProximoId(proximoId + 1);
  };

  const eliminarItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const actualizarItem = (id: number, campo: keyof InvoiceItem, valor: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  const actualizarCantidad = (id: number, cambio: number) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      const nuevaCantidad = Math.max(0, item.cantidad + cambio);
      actualizarItem(id, "cantidad", nuevaCantidad);
    }
  };

  const handleSelectCustomer = (customer: Client) => setCliente(customer);

  const handleSelectProduct = (product: Omit<InvoiceItem, "id">) => {
    const nuevoItem: InvoiceItem = {
      ...product,
      id: proximoId,
    };
    console.log("Agregando producto a la factura:", nuevoItem);
    setItems([...items, nuevoItem]);
    setProximoId(proximoId + 1);
  };

  const handleConfirmInvoice = async () => {
    try {
      setIsSubmitting(true);

      // 1. Validar que haya una empresa seleccionada
      if (!empresaSeleccionada) {
        toast.error("Error - Sin empresa seleccionada", {
          description: "Debe seleccionar una empresa antes de emitir la factura",
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Configuración de numeración
      // NOTA: Usando valores por defecto para establecimiento, punto y número
      // El usuario configurará estos valores más adelante
      const establecimiento = "001";
      const puntoExpedicion = "001";
      const numeroFactura = 1; // Número hardcodeado temporalmente

      // 3. Preparar datos del usuario para la factura
      const usuarioFactura = user
        ? {
            documentoTipo: 1,
            documentoNumero: user.id?.toString() || "0",
            nombre: user.username || "Usuario",
            cargo: "Vendedor",
          }
        : undefined;

      // 4. Construir la estructura completa de la factura
      const completeInvoiceStructure = transformToCompleteInvoiceStructure(
        facturaData,
        {
          tipoDocumento: 1,
          establecimiento: establecimiento,
          punto: puntoExpedicion,
          numero: numeroFactura,
          codigoSeguridadAleatorio: Math.floor(
            100000 + Math.random() * 900000
          ).toString(),
          descripcion: "Factura electrónica",
          observacion: "",
          fecha: formatDateForSET(),
          tipoEmision: 1,
          tipoTransaccion: 2,
          tipoImpuesto: 1,
          moneda: "PYG",
          condicionAnticipo: 0,
          condicionTipoCambio: 0,
          descuentoGlobal: 0,
          anticipoGlobal: 0,
          cambio: "",
          usuario: usuarioFactura,
        }
      );

      console.log("=== ESTRUCTURA COMPLETA DE LA FACTURA ===");
      console.log(JSON.stringify(completeInvoiceStructure, null, 2));
      console.log("==========================================");

      // 5. Enviar la factura a la API
      const response = await crearDocumento(completeInvoiceStructure);

      console.log("=== RESPUESTA DE LA API ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("===========================");

      if (response.success) {
        toast.success("Factura emitida correctamente", {
          description: `Número de documento: ${
            response.documento?.numeroDocumento || "N/A"
          }`,
          duration: 5000,
        });

        // Limpiar el formulario
        setIsConfirmModalOpen(false);
        setCliente(null);
        setItems([]);
        setProximoId(1);
      } else {
        toast.error("Error al emitir la factura", {
          description: response.message || "Ocurrió un error desconocido",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error al emitir la factura:", error);

      let titulo = "Error al emitir la factura";
      let descripcion = "Ocurrió un error inesperado. Intente nuevamente";

      if (error instanceof Error) {
        descripcion = error.message;

        // Personalizar el título según el tipo de error
        if (error.message.includes("RUC")) {
          titulo = "Error en RUC del cliente";
        } else if (error.message.includes("cliente")) {
          titulo = "Error en datos del cliente";
        } else if (error.message.includes("datos de factura")) {
          titulo = "Error en datos de la factura";
        } else if (error.message.includes("sesión")) {
          titulo = "Sesión expirada";
        } else if (error.message.includes("conectar")) {
          titulo = "Error de conexión";
        } else if (error.message.includes("permisos")) {
          titulo = "Sin permisos";
        }
      }

      toast.error(titulo, {
        description: descripcion,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calcularSubtotal = (tipoIva: string) => {
    return items.reduce((total, item) => {
      const subtotalItem = item.cantidad * item.precio;
      if (tipoIva === "exentas" && item.tipoIva === "exentas")
        return total + subtotalItem;
      if (tipoIva === "iva5" && item.tipoIva === "iva5")
        return total + subtotalItem;
      if (tipoIva === "iva10" && item.tipoIva === "iva10")
        return total + subtotalItem;
      return total;
    }, 0);
  };

  const subtotalExentas = calcularSubtotal("exentas");
  const subtotal5 = calcularSubtotal("iva5");
  const subtotal10 = calcularSubtotal("iva10");
  const totalVenta = subtotalExentas + subtotal5 + subtotal10;
  const totalIva = subtotal5 * 0.05 + subtotal10 * 0.1;
  const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);

  const emitirFactura = () => {
    // Validación 1: Empresa seleccionada
    if (!empresaSeleccionada) {
      toast.error("Empresa no seleccionada", {
        description: "Debe seleccionar una empresa antes de emitir la factura",
        duration: 5000,
      });
      return;
    }

    // Validación 2: Cliente seleccionado
    if (!cliente) {
      toast.error("Cliente no seleccionado", {
        description: "Debe seleccionar un cliente para emitir la factura",
        duration: 5000,
      });
      return;
    }

    // Validación 3: Items agregados
    if (items.length === 0) {
      toast.error("Factura sin productos", {
        description: "Debe agregar al menos un producto a la factura",
        duration: 5000,
      });
      return;
    }

    // Validación 4: Validar cada item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue; // Saltar si el item no existe (no debería pasar)

      const itemNum = i + 1;

      if (!item.descripcion || item.descripcion.trim() === "") {
        toast.error(`Error en producto #${itemNum}`, {
          description: "La descripción del producto no puede estar vacía",
          duration: 5000,
        });
        return;
      }

      if (item.cantidad <= 0) {
        toast.error(`Error en producto #${itemNum}`, {
          description: "La cantidad debe ser mayor a cero",
          duration: 5000,
        });
        return;
      }

      if (item.precio < 0) {
        toast.error(`Error en producto #${itemNum}`, {
          description: "El precio no puede ser negativo",
          duration: 5000,
        });
        return;
      }
    }

    // Validación 5: Validar RUC del cliente si es persona jurídica
    if (cliente.tipo_persona === "juridica") {
      if (!cliente.ruc || cliente.ruc.trim() === "") {
        toast.error("RUC faltante", {
          description: "El cliente seleccionado (persona jurídica) debe tener un RUC válido",
          duration: 5000,
        });
        return;
      }

      // Verificar que el RUC tenga el formato correcto con DV
      if (!cliente.ruc.includes("-")) {
        toast.error("RUC sin dígito verificador", {
          description: `El RUC del cliente debe incluir el dígito verificador (formato: XXXXXXXX-Y)`,
          duration: 6000,
        });
        return;
      }
    }

    // Todas las validaciones pasaron
    setIsConfirmModalOpen(true);
  };

  const facturaData: FacturaData = {
    cliente,
    condicionPago,
    items,
    totales: {
      cantidadTotal,
      subtotalExentas,
      subtotal5,
      subtotal10,
      totalVenta,
      totalIva,
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Generar Factura</h1>
      </div>

      <div className="card-header-section mb-6">
        <h2 className="card-title">Información del Cliente</h2>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <div className="flex items-center gap-2">
              <Input
                label=""
                placeholder="Nombre del cliente"
                value={cliente?.nombre || ""}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setIsCustomerModalOpen(true)}
              >
                <Search size={30} />
              </Button>
            </div>
          </div>

          <Select
            label="Condición de pago"
            value={condicionPago}
            options={paymentCondition}
            className="mb-1"
            placeholder="Seleccione condición de pago"
            onValueChange={setCondicionPago}
          />
        </div>
      </div>

      <div className="page-header-actions mb-2">
        <Button
          onClick={agregarItem}
          className="btn-primary"
        >
          <Plus size={30} />
          Agregar Producto
        </Button>
        <Button
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
          onClick={() => setIsProductModalOpen(true)}
        >
          <Search size={30} />
          Buscar Producto
        </Button>
      </div>

      {/* Tabla de Items */}
      {items.length > 0 ? (
        <div className="invoice-item-table mb-2">
          <Table>
            <TableHeader>
              <TableRow className="table-header-row">
                <TableHead className="w-16">Item</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-32">Unidad</TableHead>
                <TableHead className="w-32">Cantidad</TableHead>
                <TableHead className="w-32">Precio</TableHead>
                <TableHead className="w-24">Exentas</TableHead>
                <TableHead className="w-24">IVA 5%</TableHead>
                <TableHead className="w-24">IVA 10%</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className="table-row-hover">
                  <TableCell className="font-medium text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Input
                      label=""
                      value={item.codigo}
                      onChange={(value) =>
                        actualizarItem(item.id, "codigo", value)
                      }
                      placeholder="-"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      label=""
                      value={item.descripcion}
                      onChange={(value) =>
                        actualizarItem(item.id, "descripcion", value)
                      }
                      placeholder="Descripción del ítem"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      label=""
                      value={item.unidad}
                      options={unit}
                      onValueChange={(valor: string) =>
                        actualizarItem(item.id, "unidad", valor)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="invoice-quantity-controls">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => actualizarCantidad(item.id, -1)}
                        className="btn-icon"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        label=""
                        value={item.cantidad.toString()}
                        onChange={(value) =>
                          actualizarItem(
                            item.id,
                            "cantidad",
                            parseFloat(value) || 0
                          )
                        }
                        type="number"
                        className="w-16 text-center"
                        min="0"
                        step="0.01"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => actualizarCantidad(item.id, 1)}
                        className="btn-icon"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      label=""
                      value={item.precio.toString()}
                      onChange={(value) =>
                        actualizarItem(
                          item.id,
                          "precio",
                          parseFloat(value) || 0
                        )
                      }
                      type="number"
                      placeholder="0"
                      className="w-full"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="invoice-radio-group">
                      <input
                        type="radio"
                        name={`iva-${item.id}`}
                        checked={item.tipoIva === "exentas"}
                        onChange={() =>
                          actualizarItem(item.id, "tipoIva", "exentas")
                        }
                        className="mb-1"
                      />
                      <span className="text-xs text-gray-600">
                        {item.tipoIva === "exentas"
                          ? (item.cantidad * item.precio).toFixed(2)
                          : "0"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="invoice-radio-group">
                      <input
                        type="radio"
                        name={`iva-${item.id}`}
                        checked={item.tipoIva === "iva5"}
                        onChange={() =>
                          actualizarItem(item.id, "tipoIva", "iva5")
                        }
                        className="mb-1"
                      />
                      <span className="text-xs text-gray-600">
                        {item.tipoIva === "iva5"
                          ? (item.cantidad * item.precio).toFixed(2)
                          : "0"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="invoice-radio-group">
                      <input
                        type="radio"
                        name={`iva-${item.id}`}
                        checked={item.tipoIva === "iva10"}
                        onChange={() =>
                          actualizarItem(item.id, "tipoIva", "iva10")
                        }
                        className="mb-1"
                      />
                      <span className="text-xs text-gray-600">
                        {item.tipoIva === "iva10"
                          ? (item.cantidad * item.precio).toFixed(2)
                          : "0"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => eliminarItem(item.id)}
                      className="btn-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="card-empty-state mb-6">
          <FileText className="empty-state-icon" />
          <h3 className="empty-state-title">
            No hay productos agregados
          </h3>
          <p className="empty-state-description mb-4">
            Haga clic en "Agregar Producto" para comenzar
          </p>
          <Button
            onClick={agregarItem}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Agregar Primer Producto
          </Button>
        </div>
      )}

      {/* Summary of the Invoice */}
      {items.length > 0 && (
        <div className="invoice-summary-table mb-6">
          <Table>
            <TableHeader>
              <TableRow className="table-header-row">
                <TableHead className="font-semibold text-gray-900">
                  Cantidad Total
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Subtotal
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Total Venta
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Total IVA
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-lg">
                  {cantidadTotal.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      Exentas: {subtotalExentas.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      IVA 5%: {subtotal5.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      IVA 10%: {subtotal10.toLocaleString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="highlight-success text-lg">
                  {totalVenta.toLocaleString()}
                </TableCell>
                <TableCell className="highlight-warning text-lg">
                  {Math.round(totalIva).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" className="px-6">
          Cancelar
        </Button>
        <Button
          onClick={emitirFactura}
          disabled={items.length === 0 || !cliente}
          className="btn-primary px-6"
        >
          <FileText size={30} />
          Emitir Factura
        </Button>
      </div>

      {/* Modals */}
      <CustomerSearchModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />

      <ProductSearchModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      <ConfirmInvoiceModal
        isOpen={isConfirmModalOpen}
        onClose={() => !isSubmitting && setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmInvoice}
        facturaData={facturaData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
