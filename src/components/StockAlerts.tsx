import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProductosBajoStock } from "../store/slices/productosSlice";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, Package } from "lucide-react";

export function StockAlerts() {
  const dispatch = useAppDispatch();
  const { productosBajoStock, isLoading } = useAppSelector(
    (state) => state.productos
  );

  useEffect(() => {
    dispatch(fetchProductosBajoStock());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas de Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="loading-container py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (productosBajoStock.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Alertas de Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">
            Todos los productos tienen stock suficiente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Stock ({productosBajoStock.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productosBajoStock.map((producto) => (
            <div
              key={producto.id_producto}
              className="flex items-start justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">
                    {producto.nombre}
                  </h4>
                </div>
                {producto.descripcion && (
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    {producto.descripcion}
                  </p>
                )}
                <div className="flex gap-4 mt-2 ml-6 text-sm">
                  <span className="text-gray-700">
                    Stock actual:{" "}
                    <span className="font-semibold text-red-600">
                      {producto.stock_actual || 0}
                    </span>
                  </span>
                  <span className="text-gray-700">
                    Stock mínimo:{" "}
                    <span className="font-semibold text-orange-600">
                      {producto.stock_minimo || 0}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
