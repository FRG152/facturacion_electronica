import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "./ui/select";

import {
  fetchEmpresas,
  setEmpresaSeleccionada,
} from "../store/slices/empresasSlice";

import { useEffect } from "react";

import { Building2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../store/hooks";

export function EmpresaSelector() {
  const dispatch = useAppDispatch();
  const { empresas, empresaSeleccionada, isLoading } = useAppSelector(
    (state) => state.empresas
  );

  useEffect(() => {
    dispatch(fetchEmpresas({ activo: 1 }));
  }, [dispatch]);

  useEffect(() => {
    const empresaId = localStorage.getItem("empresa_id");
    if (empresaId && empresas.length > 0 && !empresaSeleccionada) {
      const empresa = empresas.find((e) => e.id === parseInt(empresaId));
      if (empresa) {
        dispatch(setEmpresaSeleccionada(empresa));
      }
    }
  }, [empresas, empresaSeleccionada, dispatch]);

  useEffect(() => {
    if (empresas.length === 1 && !empresaSeleccionada) {
      dispatch(setEmpresaSeleccionada(empresas[0] || null));
    }
  }, [empresas, empresaSeleccionada, dispatch]);

  const handleEmpresaChange = (empresaId: string) => {
    const empresa = empresas.find((e) => e.id === parseInt(empresaId));
    if (empresa) {
      dispatch(setEmpresaSeleccionada(empresa));
    }
  };

  const formatEmpresaLabel = (nombre: string) => {
    return nombre;
  };

  if (isLoading || empresas.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Cargando empresas...</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Empresa Activa
        </span>
      </div>
      <Select
        value={empresaSeleccionada?.id.toString() || ""}
        onValueChange={handleEmpresaChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar empresa">
            {empresaSeleccionada &&
              formatEmpresaLabel(empresaSeleccionada.nombre)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id.toString()}>
              {formatEmpresaLabel(empresa.nombre)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {empresaSeleccionada && (
        <div className="mt-2 text-xs text-muted-foreground">
          <div>RUC: {empresaSeleccionada.ruc}</div>
        </div>
      )}
    </div>
  );
}
