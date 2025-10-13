
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import type { Empresa, CrearEmpresaDTO } from "../interfaces/empresas";
import {
  crearEmpresaSchema,
  type CrearEmpresaFormData,
} from "../schemas/empresas/empresaSchema";
import { Save, X } from "lucide-react";

interface EmpresaFormProps {
  empresa?: Empresa;
  onSubmit: (data: CrearEmpresaDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmpresaForm({
  empresa,
  onSubmit,
  onCancel,
  isLoading = false,
}: EmpresaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CrearEmpresaFormData>({
    resolver: zodResolver(crearEmpresaSchema),
    defaultValues: {
      nombre: "",
      ruc: "",
      email: "",
      telefono: "",
      direccion: "",
    },
  });

  useEffect(() => {
    console.log("empresa:", empresa)
    if (empresa) {
      reset({
        nombre: empresa.nombre,
        ruc: empresa.ruc,
        email: empresa.email || "",
        telefono: empresa.telefono || "",
        direccion: empresa.direccion || "",
      });
    }
  }, [empresa, reset]);

  const onSubmitForm = (data: CrearEmpresaFormData) => {
    onSubmit(data as CrearEmpresaDTO);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Datos de la Empresa */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Datos de la Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Nombre de la Empresa <span className="text-red-500">*</span>
            </label>
            <input
              {...register("nombre")}
              placeholder="Mi Empresa S.A."
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.nombre && (
              <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              RUC <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="contacto@miempresa.com"
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              {...register("telefono")}
              placeholder="021500100"
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input
              {...register("direccion")}
              placeholder="Avda. España 1234, Asunción"
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
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
          {isLoading ? "Guardando..." : empresa ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
