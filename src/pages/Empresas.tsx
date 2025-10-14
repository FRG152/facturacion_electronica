import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  toggleEmpresaStatus,
  searchEmpresas,
  setSearchQuery,
  setFiltros,
  setEmpresaSeleccionada,
  clearEmpresaActual,
  clearError,
} from "../store/slices/empresasSlice";
import { EmpresasList } from "../components/EmpresasList";
import { EmpresaForm } from "../components/EmpresaForm";
import { Button } from "../components/ui/button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { Empresa, CrearEmpresaDTO } from "../interfaces/empresas";
import { Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function Empresas() {
  const dispatch = useAppDispatch();
  const {
    empresas,
    paginacion,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    searchQuery,
    filtros,
  } = useAppSelector((state) => state.empresas);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    dispatch(fetchEmpresas(filtros));
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
    dispatch(searchEmpresas({ ...filtros, search: searchInput }));
  };

  const handleRefresh = () => {
    setSearchInput("");
    dispatch(setSearchQuery(""));
    dispatch(setFiltros({ page: 1, activo: 1 }));
    dispatch(fetchEmpresas({ page: 1, limit: filtros.limit, activo: 1 }));
  };

  const handleNuevaEmpresa = () => {
    setEmpresaEditando(null);
    setIsFormOpen(true);
  };

  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaEditando(empresa);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEmpresaEditando(null);
    dispatch(clearEmpresaActual());
  };

  const handleSubmitForm = async (data: CrearEmpresaDTO) => {
    try {
      if (empresaEditando) {
        await dispatch(
          updateEmpresa({
            id: empresaEditando.id,
            empresa: data,
          })
        ).unwrap();
        toast.success("Empresa actualizada", {
          description: "La empresa se actualizó correctamente",
          duration: 4000,
        });
      } else {
        // Crear empresa y obtener la respuesta con api_token
        const empresaCreada = await dispatch(createEmpresa(data)).unwrap();

        // Auto-seleccionar la empresa recién creada
        dispatch(setEmpresaSeleccionada(empresaCreada));

        toast.success("Empresa creada", {
          description: `${empresaCreada.nombre} - API Token generado`,
          duration: 4000,
        });
      }
      handleCloseForm();
      dispatch(fetchEmpresas(filtros));
    } catch (err) {
      // El error ya se maneja en el reducer
    }
  };

  const handleEliminarEmpresa = async (id: number) => {
    try {
      await dispatch(deleteEmpresa(id)).unwrap();
      toast.success("Empresa eliminada", {
        description: "La empresa se eliminó correctamente",
        duration: 4000,
      });
      dispatch(fetchEmpresas(filtros));
    } catch (err) {
      // El error ya se maneja en el reducer
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dispatch(toggleEmpresaStatus(id)).unwrap();
      toast.success("Estado actualizado", {
        description: "El estado de la empresa se actualizó correctamente",
        duration: 4000,
      });
      dispatch(fetchEmpresas(filtros));
    } catch (err) {
      // El error ya se maneja en el reducer
    }
  };

  const handleFiltroActivos = (value: string) => {
    const activo = value === "1" ? 1 : value === "0" ? 0 : undefined;
    dispatch(setFiltros({ ...filtros, activo }));
    dispatch(fetchEmpresas({ ...filtros, activo }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFiltros({ ...filtros, page }));
    dispatch(fetchEmpresas({ ...filtros, page }));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-full">
        <div>
          <h1 className="page-title">Empresas</h1>
          <p className="page-subtitle">
            Administra las empresas del sistema
          </p>
        </div>
        <Button
          onClick={handleNuevaEmpresa}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nueva Empresa
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
                placeholder="Buscar por razón social, RUC o nombre comercial..."
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
            value={
              filtros.activo === undefined ? "todos" : filtros.activo.toString()
            }
            options={[
              { value: "todos", label: "Todos" },
              { value: "1", label: "Activos" },
              { value: "0", label: "Inactivos" },
            ]}
            onValueChange={handleFiltroActivos}
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

      {/* Lista de empresas */}
      {!isLoading && (
        <>
          <EmpresasList
            empresas={empresas}
            onEdit={handleEditarEmpresa}
            onDelete={handleEliminarEmpresa}
            onToggleStatus={handleToggleStatus}
            isDeleting={isDeleting}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {empresaEditando ? "Editar Empresa" : "Nueva Empresa"}
            </DialogTitle>
          </DialogHeader>
          <EmpresaForm
            empresa={empresaEditando || undefined}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
