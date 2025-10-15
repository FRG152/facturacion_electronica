import {
  fetchClientes,
  createCliente,
  searchClientes,
} from "../../store/slices/clientesSlice";

import { toast } from "sonner";

import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import type { Client } from "@/interfaces";

import { ClienteQuickForm } from "../ClienteQuickForm";

import { useState, useEffect } from "react";

import type { CrearClienteDTO } from "@/interfaces/clientes";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { Search, X, Loader2, Plus, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Client) => void;
}

export function CustomerSearchModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerSearchModalProps) {
  const dispatch = useAppDispatch();
  const { clientes, isLoading, isCreating } = useAppSelector(
    (state) => state.clientes
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"buscar" | "crear">("buscar");

  useEffect(() => {
    if (isOpen) {
      // Cargar clientes activos al abrir el modal
      dispatch(fetchClientes({ eliminado: 0, limit: 50 }));
      // Resetear a la pestaña de búsqueda
      setActiveTab("buscar");
      setSearchTerm("");
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        dispatch(
          searchClientes({
            search: searchTerm,
            eliminado: 0,
            limit: 50,
          })
        );
      } else {
        dispatch(fetchClientes({ eliminado: 0, limit: 50 }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  const handleSelectCustomer = (cliente: any) => {
    // Transformar Cliente de API a Client de interfaz
    const clienteTransformado: Client = {
      id: cliente.id,
      nombre: cliente.nombre,
      ruc: cliente.ruc || cliente.ci || "",
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email,
      // Agregar campos adicionales que puedan necesitarse en la factura
      tipo_persona: cliente.tipo_persona,
      ci: cliente.ci,
      tiene_ruc: cliente.tiene_ruc,
      pais_telefono: cliente.pais_telefono,
      id_departamento: cliente.id_departamento,
      id_distrito: cliente.id_distrito,
      id_ciudad: cliente.id_ciudad,
    };
    onSelectCustomer(clienteTransformado);
    onClose();
  };

  const handleCreateCliente = async (data: CrearClienteDTO) => {
    try {
      const nuevoCliente = await dispatch(createCliente(data)).unwrap();
      toast.success("Cliente creado correctamente");

      // Seleccionar automáticamente el cliente recién creado
      handleSelectCustomer(nuevoCliente);
    } catch (error) {
      toast.error("Error al crear cliente", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  const handleCancelCreate = () => {
    setActiveTab("buscar");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleccionar Cliente
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "buscar" | "crear")}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buscar" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Cliente
            </TabsTrigger>
            <TabsTrigger value="crear" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="buscar"
            className="flex-1 mt-4 overflow-hidden flex flex-col"
          >
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por nombre, CI, RUC o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : clientes.length > 0 ? (
                  <div className="space-y-2">
                    {clientes.map((cliente) => (
                      <div
                        key={cliente.id}
                        className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectCustomer(cliente)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-lg">
                            {cliente.nombre}
                          </div>
                          <Badge
                            variant={
                              cliente.tipo_persona === "fisica"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {cliente.tipo_persona === "fisica"
                              ? "Persona Física"
                              : "Persona Jurídica"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {cliente.tipo_persona === "fisica" ? (
                            <>
                              {cliente.ci && (
                                <div className="text-gray-600">
                                  <span className="font-medium">CI:</span>{" "}
                                  {cliente.ci}
                                </div>
                              )}
                              {cliente.ruc && (
                                <div className="text-gray-600">
                                  <span className="font-medium">RUC:</span>{" "}
                                  {cliente.ruc}
                                </div>
                              )}
                            </>
                          ) : (
                            cliente.ruc && (
                              <div className="text-gray-600">
                                <span className="font-medium">RUC:</span>{" "}
                                {cliente.ruc}
                              </div>
                            )
                          )}
                          {cliente.telefono && (
                            <div className="text-gray-600">
                              <span className="font-medium">Tel:</span>{" "}
                              {cliente.telefono}
                            </div>
                          )}
                          {cliente.email && (
                            <div className="text-gray-600 col-span-2">
                              <span className="font-medium">Email:</span>{" "}
                              {cliente.email}
                            </div>
                          )}
                          {cliente.direccion && (
                            <div className="text-gray-500 col-span-2">
                              {cliente.direccion}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {searchTerm
                        ? "No se encontraron clientes"
                        : "No hay clientes registrados"}
                    </p>
                    <p className="text-sm">
                      {searchTerm
                        ? "Intenta con otros criterios de búsqueda"
                        : "Crea tu primer cliente en la pestaña 'Nuevo Cliente'"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crear" className="flex-1 mt-4 overflow-y-auto">
            <div className="px-1">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Creación rápida:</strong> Completa los campos
                  esenciales. El cliente será guardado y seleccionado
                  automáticamente.
                </p>
              </div>
              <ClienteQuickForm
                onSubmit={handleCreateCliente}
                onCancel={handleCancelCreate}
                isLoading={isCreating}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
