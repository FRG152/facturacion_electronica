/**
 * Formulario para crear/editar clientes
 * Usa Zod para validación según clienteSchema.ts
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./ui/button";
import type {
  Cliente,
  CrearClienteDTO,
  TipoPersona,
} from "../interfaces/clientes";
import {
  crearClienteSchema,
  type CrearClienteFormData,
} from "../schemas/clientes/clienteSchema";
import { Save, X } from "lucide-react";

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: CrearClienteDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const tipoPersonaOptions = [
  { value: "fisica", label: "Persona Física" },
  { value: "juridica", label: "Persona Jurídica" },
];

export function ClienteForm({
  cliente,
  onSubmit,
  onCancel,
  isLoading = false,
}: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CrearClienteFormData>({
    resolver: zodResolver(crearClienteSchema),
    defaultValues: {
      nombre: "",
      tipo_persona: "fisica",
      ci: "",
      fecha_nacimiento: "",
      tiene_ruc: 0,
      ruc: "",
      telefono: "",
      direccion: "",
      email: "",
    },
  });

  // Watch tipo_persona y tiene_ruc para mostrar/ocultar campos
  const tipoPersona = watch("tipo_persona");
  const tieneRuc = watch("tiene_ruc");

  useEffect(() => {
    if (cliente) {
      reset({
        nombre: cliente.nombre,
        tipo_persona: cliente.tipo_persona,
        ci: cliente.ci || "",
        fecha_nacimiento: cliente.fecha_nacimiento || "",
        tiene_ruc: cliente.tiene_ruc || 0,
        ruc: cliente.ruc || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        email: cliente.email || "",
      });
    }
  }, [cliente, reset]);

  const onSubmitForm = (data: CrearClienteFormData) => {
    onSubmit(data as CrearClienteDTO);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="max-w-6xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Persona */}
        <Select
          label="Tipo de Persona"
          value={tipoPersona}
          options={tipoPersonaOptions}
          onValueChange={(value) => setValue("tipo_persona", value as TipoPersona)}
          required
          disabled={isLoading}
        />

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre / Razón Social <span className="text-red-500">*</span>
          </label>
          <input
            {...register("nombre")}
            placeholder="Ingrese el nombre completo"
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.ci && (
                <p className="text-sm text-red-500 mt-1">{errors.ci.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Nacimiento
              </label>
              <input
                {...register("fecha_nacimiento")}
                type="text"
                placeholder="YYYY-MM-DD"
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Checkbox Tiene RUC */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="tiene_ruc"
                checked={tieneRuc === 1}
                onChange={(e) => setValue("tiene_ruc", e.target.checked ? 1 : 0)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="tiene_ruc" className="text-sm font-medium">
                Tiene RUC
              </label>
            </div>
          </>
        )}

        {/* RUC */}
        {(tipoPersona === "juridica" || tieneRuc === 1) && (
          <div>
            <label className="block text-sm font-medium mb-1">
              RUC {tipoPersona === "juridica" && <span className="text-red-500">*</span>}
            </label>
            <input
              {...register("ruc")}
              placeholder="80012345-6"
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md"
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
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="ejemplo@email.com"
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            {...register("direccion")}
            placeholder="Avda. España 123"
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md"
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
          {isLoading ? "Guardando..." : cliente ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
