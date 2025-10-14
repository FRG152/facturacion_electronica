import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";

import {
  createProductoSchema,
  updateProductoSchema,
  type CreateProductoFormData,
  type UpdateProductoFormData,
} from "../schemas/productos";

import {
  clearError,
  createProducto,
  updateProducto,
  fetchProductoPorId,
  clearProductoActual,
} from "../store/slices/productosSlice";

import { unit } from "../constants/invoice";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import { mapUnidadMedida } from "../lib/utils";

import { useForm, Controller } from "react-hook-form";

import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../store/hooks";

import { AlertTriangle, Save, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { toast } from "sonner";

export function ProductoForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { productoActual, isLoading, isCreating, isUpdating, error } =
    useAppSelector((state) => state.productos);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<CreateProductoFormData | UpdateProductoFormData>({
    resolver: zodResolver(
      isEditing ? updateProductoSchema : createProductoSchema
    ),
    defaultValues: {
      nombre: "",
      descripcion: "",
      unidad_medida: "UNI",
      iva: 19,
      precio_compra: 0,
      precio_venta1: 0,
      stock_minimo: 0,
      controla_stock: 1,
      venta_granel: 0,
      equivalencia_granel: 1,
    },
  });

  const ventaGranel = watch("venta_granel");
  const controlaStock = watch("controla_stock");

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchProductoPorId(parseInt(id)));
    }

    return () => {
      dispatch(clearProductoActual());
    };
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (productoActual && isEditing) {
      reset({
        nombre: productoActual.nombre,
        codigo_barras: productoActual.codigo_barras || "",
        descripcion: productoActual.descripcion || "",
        unidad_medida: mapUnidadMedida(productoActual.unidad_medida),
        iva: productoActual.iva,
        precio_compra: productoActual.precio_compra,
        precio_compra_promedio: productoActual.precio_compra_promedio,
        precio_venta1: productoActual.precio_venta1,
        precio_venta2: productoActual.precio_venta2,
        precio_venta3: productoActual.precio_venta3,
        precio_minimo: productoActual.precio_minimo,
        venta_granel: productoActual.venta_granel || 0,
        precio_granel: productoActual.precio_granel,
        unidad_granel: productoActual.unidad_granel || "",
        equivalencia_granel: productoActual.equivalencia_granel || 1,
        stock_minimo: productoActual.stock_minimo || 0,
        controla_stock: productoActual.controla_stock || 1,
        imagen1: productoActual.imagen1 || "",
        imagen2: productoActual.imagen2 || "",
      });
    }
  }, [productoActual, reset, isEditing]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const onSubmit = async (
    data: CreateProductoFormData | UpdateProductoFormData
  ) => {
    console.log("data:", data);
    try {
      if (isEditing && id) {
        await dispatch(
          updateProducto({
            id: parseInt(id),
            producto: data as UpdateProductoFormData,
          })
        ).unwrap();
        toast.success("Producto actualizado", {
          description: "El producto se actualizó correctamente",
          duration: 4000,
        });
      } else {
        await dispatch(createProducto(data as CreateProductoFormData)).unwrap();
        toast.success("Producto creado", {
          description: "El producto se creó correctamente",
          duration: 4000,
        });
      }
      navigate("/productos");
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error("Error al guardar", {
        description: error instanceof Error ? error.message : "Ocurrió un error al guardar el producto",
        duration: 5000,
      });
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/productos")}>
          <ArrowLeft className="h-4 w-4 " />
          Volver
        </Button>
        <h1 className="section-title">
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="error-card">
          <CardContent className="pt-6">
            <div className="error-content">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="form-section">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="form-section">
            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  placeholder="Nombre del producto"
                />
                {errors.nombre && (
                  <p className="form-error">{errors.nombre.message}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="codigo_barras">Código de Barras</Label>
                <Input
                  id="codigo_barras"
                  {...register("codigo_barras")}
                  placeholder="Código de barras"
                />
                {errors.codigo_barras && (
                  <p className="form-error">{errors.codigo_barras.message}</p>
                )}
              </div>
            </div>

            <div className="form-field">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                {...register("descripcion")}
                placeholder="Descripción del producto"
              />
              {errors.descripcion && (
                <p className="form-error">{errors.descripcion.message}</p>
              )}
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="unidad_medida">Unidad de Medida</Label>
                <Controller
                  name="unidad_medida"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar unidad" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {unit.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unidad_medida && (
                  <p className="form-error">{errors.unidad_medida.message}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="iva">IVA (%) *</Label>
                <Input
                  id="iva"
                  type="number"
                  min="0"
                  max="100"
                  {...register("iva", { valueAsNumber: true })}
                  placeholder="19"
                />
                {errors.iva && (
                  <p className="form-error">{errors.iva.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precios */}
        <Card>
          <CardHeader>
            <CardTitle>Precios</CardTitle>
          </CardHeader>
          <CardContent className="form-section">
            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="precio_compra">Precio de Compra *</Label>
                <Input
                  id="precio_compra"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("precio_compra", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.precio_compra && (
                  <p className="form-error">{errors.precio_compra.message}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="precio_venta1">Precio de Venta 1 *</Label>
                <Input
                  id="precio_venta1"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("precio_venta1", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.precio_venta1 && (
                  <p className="form-error">{errors.precio_venta1.message}</p>
                )}
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-field">
                <Label htmlFor="precio_venta2">Precio de Venta 2</Label>
                <Input
                  id="precio_venta2"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("precio_venta2", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.precio_venta2 && (
                  <p className="text-sm text-red-600">
                    {errors.precio_venta2.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_venta3">Precio de Venta 3</Label>
                <Input
                  id="precio_venta3"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("precio_venta3", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.precio_venta3 && (
                  <p className="text-sm text-red-600">
                    {errors.precio_venta3.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_minimo">Precio Mínimo</Label>
                <Input
                  id="precio_minimo"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("precio_minimo", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.precio_minimo && (
                  <p className="text-sm text-red-600">
                    {errors.precio_minimo.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venta a Granel */}
        <Card>
          <CardHeader>
            <CardTitle>Venta a Granel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="venta_granel"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="venta_granel"
                    checked={field.value === 1}
                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                    className="rounded"
                  />
                )}
              />
              <Label htmlFor="venta_granel">Se vende a granel</Label>
            </div>

            {ventaGranel === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio_granel">Precio a Granel</Label>
                  <Input
                    id="precio_granel"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("precio_granel", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.precio_granel && (
                    <p className="text-sm text-red-600">
                      {errors.precio_granel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidad_granel">Unidad a Granel</Label>
                  <Input
                    id="unidad_granel"
                    {...register("unidad_granel")}
                    placeholder="Gramo, Litro, etc."
                  />
                  {errors.unidad_granel && (
                    <p className="text-sm text-red-600">
                      {errors.unidad_granel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equivalencia_granel">Equivalencia</Label>
                  <Input
                    id="equivalencia_granel"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("equivalencia_granel", {
                      valueAsNumber: true,
                    })}
                    placeholder="1000"
                  />
                  {errors.equivalencia_granel && (
                    <p className="text-sm text-red-600">
                      {errors.equivalencia_granel.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control de Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Control de Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="controla_stock"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="controla_stock"
                    checked={field.value === 1}
                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                    className="rounded"
                  />
                )}
              />
              <Label htmlFor="controla_stock">Controlar stock</Label>
            </div>

            {controlaStock === 1 && (
              <div className="space-y-2">
                <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  min="0"
                  {...register("stock_minimo", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.stock_minimo && (
                  <p className="text-sm text-red-600">
                    {errors.stock_minimo.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imagen1">URL Imagen 1</Label>
                <Input
                  id="imagen1"
                  {...register("imagen1")}
                  placeholder="https://ejemplo.com/imagen1.jpg"
                />
                {errors.imagen1 && (
                  <p className="text-sm text-red-600">
                    {errors.imagen1.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagen2">URL Imagen 2</Label>
                <Input
                  id="imagen2"
                  {...register("imagen2")}
                  placeholder="https://ejemplo.com/imagen2.jpg"
                />
                {errors.imagen2 && (
                  <p className="text-sm text-red-600">
                    {errors.imagen2.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isCreating || isUpdating || isLoading}
            className="min-w-[120px] btn-primary"
          >
            <Save className="h-4 w-4" />
            {isCreating || isUpdating ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
