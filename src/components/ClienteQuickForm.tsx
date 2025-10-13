/**
 * Formulario rápido para crear clientes desde el modal de búsqueda
 * Solo incluye campos esenciales para emisión inmediata de facturas
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import type { CrearClienteDTO, TipoPersona } from "../interfaces/clientes";
import {
  crearClienteSchema,
  type CrearClienteFormData,
} from "../schemas/clientes/clienteSchema";
import { Save, X } from "lucide-react";

interface ClienteQuickFormProps {
  onSubmit: (data: CrearClienteDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const tipoPersonaOptions: { value: TipoPersona; label: string }[] = [
  { value: "fisica", label: "Persona Física" },
  { value: "juridica", label: "Persona Jurídica" },
];

export function ClienteQuickForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: ClienteQuickFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CrearClienteFormData>({
    resolver: zodResolver(crearClienteSchema),
    defaultValues: {
      nombre: "",
      tipo_persona: "fisica",
      ci: "",
      ruc: "",
      telefono: "",
      direccion: "",
      tiene_ruc: 0,
    },
  });

  const tipoPersona = watch("tipo_persona");
  const tieneRuc = watch("tiene_ruc");

  const onSubmitForm = (data: CrearClienteFormData) => {
    onSubmit(data as CrearClienteDTO);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-4"
    >
      <div className="space-y-4">
        {/* Tipo de Persona */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de Persona <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {tipoPersonaOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={tipoPersona === option.value}
                  onChange={(e) =>
                    setValue("tipo_persona", e.target.value as TipoPersona)
                  }
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {tipoPersona === "fisica" ? "Nombre Completo" : "Razón Social"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            {...register("nombre")}
            placeholder="Ingrese el nombre completo"
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nombre && (
            <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
          )}
        </div>

        {/* Cédula (solo para persona física) */}
        {tipoPersona === "fisica" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cédula <span className="text-red-500">*</span>
              </label>
              <input
                {...register("ci")}
                placeholder="12345678"
                disabled={isLoading}
                maxLength={8}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.ci && (
                <p className="text-sm text-red-500 mt-1">{errors.ci.message}</p>
              )}
            </div>

            {/* Checkbox Tiene RUC */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="tiene_ruc_quick"
                checked={tieneRuc === 1}
                onChange={(e) => setValue("tiene_ruc", e.target.checked ? 1 : 0)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="tiene_ruc_quick" className="text-sm font-medium">
                Tiene RUC
              </label>
            </div>
          </>
        )}

        {/* RUC */}
        {(tipoPersona === "juridica" || tieneRuc === 1) && (
          <div>
            <label className="block text-sm font-medium mb-1">
              RUC{" "}
              {tipoPersona === "juridica" && <span className="text-red-500">*</span>}
            </label>
            <input
              {...register("ruc")}
              placeholder="80012345-6"
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.ruc && (
              <p className="text-sm text-red-500 mt-1">{errors.ruc.message}</p>
            )}
          </div>
        )}

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            {...register("telefono")}
            placeholder="0981123456"
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            {...register("direccion")}
            placeholder="Avda. España 123"
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar y Seleccionar"}
        </Button>
      </div>
    </form>
  );
}
