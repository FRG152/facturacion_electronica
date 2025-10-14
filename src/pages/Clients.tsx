import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  restoreCliente,
  searchClientes,
  setSearchQuery,
  setFiltros,
  clearClienteActual,
  clearError,
} from "../store/slices/clientesSlice";
import { ClientesList } from "../components/ClientesList";
import { ClienteForm } from "../components/ClienteForm";
import { Button } from "../components/ui/button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { Cliente, CrearClienteDTO } from "../interfaces/clientes";
import { Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function Clientes() {
  const dispatch = useAppDispatch();
  const {
    clientes,
    paginacion,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    searchQuery,
    filtros,
  } = useAppSelector((state) => state.clientes);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    dispatch(fetchClientes(filtros));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSearch = () => {
    dispatch(setSearchQuery(searchInput));
    dispatch(searchClientes({ ...filtros, search: searchInput }));
  };

  const handleRefresh = () => {
    setSearchInput("");
    dispatch(setSearchQuery(""));
    dispatch(setFiltros({ page: 1, eliminado: 0 }));
    dispatch(fetchClientes({ page: 1, limit: filtros.limit, eliminado: 0 }));
  };

  const handleNuevoCliente = () => {
    setClienteEditando(null);
    setIsFormOpen(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setClienteEditando(null);
    dispatch(clearClienteActual());
  };

  const handleSubmitForm = async (data: CrearClienteDTO) => {
    try {
      if (clienteEditando) {
        await dispatch(
          updateCliente({
            id: clienteEditando.id,
            cliente: data,
          })
        ).unwrap();
        toast.success("Cliente actualizado", {
          description: "El cliente se actualizó correctamente",
          duration: 4000,
        });
      } else {
        await dispatch(createCliente(data)).unwrap();
        toast.success("Cliente creado", {
          description: "El cliente se creó correctamente",
          duration: 4000,
        });
      }
      handleCloseForm();
      dispatch(fetchClientes(filtros));
    } catch (err) {
      // El error ya se maneja en el reducer
    }
  };

  const handleEliminarCliente = async (id: number) => {
    try {
      await dispatch(deleteCliente({ id })).unwrap();
      toast.success("Cliente eliminado", {
        description: "El cliente se eliminó correctamente",
        duration: 4000,
      });
      dispatch(fetchClientes(filtros));
    } catch (err) {
      // El error ya se maneja en el reducer
    }
  };

  const handleRestaurarCliente = async (id: number) => {
    try {
      await dispatch(restoreCliente(id)).unwrap();
      toast.success("Cliente restaurado", {
        description: "El cliente se restauró correctamente",
        duration: 4000,
      });
      dispatch(fetchClientes(filtros));
    } catch (err) {
      // El error ya se maneja en el reducer
    }
  };

  const handleFiltroEliminados = (value: string) => {
    const eliminado = value === "1" ? 1 : 0;
    dispatch(setFiltros({ ...filtros, eliminado }));
    dispatch(fetchClientes({ ...filtros, eliminado }));
  };

  const handleFiltroTipoPersona = (value: string) => {
    const tipo_persona =
      value === "todos" ? undefined : (value as "fisica" | "juridica");
    dispatch(setFiltros({ ...filtros, tipo_persona }));
    dispatch(fetchClientes({ ...filtros, tipo_persona }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFiltros({ ...filtros, page }));
    dispatch(fetchClientes({ ...filtros, page }));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-full">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">
            Administra tu base de clientes
          </p>
        </div>
        <Button
          onClick={handleNuevoCliente}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card-filter">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <div className="search-container">
              <Input
                label=""
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Buscar por nombre, CI, RUC o email..."
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Select
            label=""
            value={filtros.tipo_persona || "todos"}
            options={[
              { value: "todos", label: "Todos los tipos" },
              { value: "fisica", label: "Persona Física" },
              { value: "juridica", label: "Persona Jurídica" },
            ]}
            onValueChange={handleFiltroTipoPersona}
            className="w-48"
          />

          <Select
            label=""
            value={filtros.eliminado?.toString() || "0"}
            options={[
              { value: "0", label: "Activos" },
              { value: "1", label: "Eliminados" },
            ]}
            onValueChange={handleFiltroEliminados}
            className="w-40"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Lista de clientes */}
      {!isLoading && (
        <>
          <ClientesList
            clientes={clientes}
            onEdit={handleEditarCliente}
            onDelete={handleEliminarCliente}
            onRestore={handleRestaurarCliente}
            isDeleting={isDeleting}
            showEliminados={filtros.eliminado === 1}
          />

          {/* Paginación */}
          {paginacion && paginacion.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(paginacion.page - 1)}
                disabled={paginacion.page === 1 || isLoading}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {paginacion.page} de {paginacion.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(paginacion.page + 1)}
                disabled={
                  paginacion.page === paginacion.totalPages || isLoading
                }
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de formulario */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {clienteEditando ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClienteForm
            cliente={clienteEditando || undefined}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
