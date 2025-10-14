import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchProductos,
  searchProductos,
  deleteProducto,
  clearError,
} from "../store/slices/productosSlice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function ProductosList() {
  const dispatch = useAppDispatch();
  const { productos, isLoading, isDeleting, error, searchQuery } =
    useAppSelector((state) => state.productos);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    dispatch(fetchProductos());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      dispatch(searchProductos({ search: searchInput.trim() }));
    } else {
      dispatch(fetchProductos());
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (e.target.value === "") {
      dispatch(fetchProductos());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDeleteClick = (id: number) => {
    setProductoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productoToDelete) {
      try {
        await dispatch(deleteProducto(productoToDelete)).unwrap();
        toast.success("Producto eliminado", {
          description: "El producto se eliminó correctamente",
          duration: 4000,
        });
        setDeleteDialogOpen(false);
        setProductoToDelete(null);
      } catch (error) {
        toast.error("Error al eliminar", {
          description: error instanceof Error ? error.message : "No se pudo eliminar el producto",
          duration: 5000,
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(price);
  };

  const getStockStatus = (stockMinimo?: number, controlaStock?: number) => {
    if (!controlaStock || stockMinimo === undefined) {
      return { label: "Sin control", variant: "secondary" as const };
    }
    return { label: `Mín: ${stockMinimo}`, variant: "default" as const };
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-full">
        <div className="page-header-title-section">
          <Package className="h-6 w-6" />
          <h1 className="section-title">Productos</h1>
        </div>
        <Link to="/productos/crear">
          <Button className="btn-primary">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre, descripción o código de barras..."
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-primary"
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Resultados para: "{searchQuery}"
            </p>
          )}
        </CardContent>
      </Card>

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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos ({productos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              {searchQuery
                ? "No se encontraron productos"
                : "No hay productos registrados"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio de Venta</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Código de Barras</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => {
                  const stockStatus = getStockStatus(
                    producto.stock_minimo,
                    producto.controla_stock
                  );
                  return (
                    <TableRow key={producto.id_producto}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{producto.nombre}</div>
                          {producto.descripcion && (
                            <div className="text-sm text-muted-foreground">
                              {producto.descripcion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(producto.precio_venta1)}
                        </div>
                        {producto.precio_venta2 && (
                          <div className="text-sm text-muted-foreground">
                            Alt: {formatPrice(producto.precio_venta2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{producto.iva}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {producto.codigo_barras ? (
                          <code className="code-block">
                            {producto.codigo_barras}
                          </code>
                        ) : (
                          <span className="text-secondary">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link
                            to={`/productos/editar/${producto.id_producto}`}
                          >
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(producto.id_producto!)
                            }
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este producto? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
