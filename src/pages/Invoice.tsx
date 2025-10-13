import {
  Copy,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import InvoiceFilter from "@/components/InvoiceFilter";
import { type Factura } from "../constants/invoice";
import { useState, useEffect } from "react";
import { generarPDF, getListaDocumentos } from "../api";
import type { DocumentoItem, ListarDocumentosParams } from "@/interfaces";

export function Facturas() {
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [limitePorPagina] = useState(10);
  const [totalDocumentos, setTotalDocumentos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const loadDocumentos = async (params: ListarDocumentosParams = {}) => {
    try {
      setLoading(true);

      const requestParams: ListarDocumentosParams = {
        page: params.page || paginaActual,
        limit: params.limit || limitePorPagina,
        sortBy: "fechaCreacion",
        sortOrder: "DESC",
        ...params,
      };

      const response = await getListaDocumentos(requestParams);

      const facturasData: Factura[] = response.documentos.map(
        (doc: DocumentoItem) => ({
          id: doc.id,
          numeroFactura: doc.numeroDocumento,
          timbrado: doc.lote.numeroLote,
          estado: doc.estado,
          cdc: doc.cdc,
          lote: doc.lote.numeroLote,
          estadoLote: doc.lote.estado as
            | "PENDIENTE"
            | "ENVIADO"
            | "RECHAZADO"
            | "APROBADO",
          fechaCreacion: new Date(doc.fechaCreacion).toLocaleDateString(),
          xmlConQR: doc.xmlConQR,
        })
      );

      setFilteredFacturas(facturasData);
      setTotalDocumentos(response.paginacion.total);
      setTotalPaginas(response.paginacion.totalPages);
      setPaginaActual(response.paginacion.page);
      setHasNextPage(response.paginacion.hasNextPage);
      setHasPrevPage(response.paginacion.hasPrevPage);
    } catch (err) {
      console.error("Error al cargar documentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentos();
  }, []);

  const handleFilter = (filters: {
    estado: string;
    numeroDocumento: string;
    cdc: string;
  }) => {
    setPaginaActual(1);

    loadDocumentos({
      page: 1,
      limit: limitePorPagina,
      estado:
        filters.estado !== "todos"
          ? (filters.estado as
              | "PENDIENTE"
              | "ENVIADO"
              | "APROBADO"
              | "RECHAZADO")
          : undefined,
      numeroDocumento: filters.numeroDocumento || undefined,
      cdc: filters.cdc || undefined,
    });
  };

  const handleClear = () => {
    setPaginaActual(1);
    loadDocumentos({ page: 1, limit: limitePorPagina });
  };

  const handlePageChange = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    loadDocumentos({ page: nuevaPagina, limit: limitePorPagina });
  };

  const handlePreviousPage = () => {
    if (hasPrevPage && !loading) {
      const nuevaPagina = Math.max(1, Number(paginaActual) - 1);
      handlePageChange(nuevaPagina);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && !loading) {
      const nuevaPagina = Number(paginaActual) + 1;
      handlePageChange(nuevaPagina);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleGeneratePDF = async (factura: Factura) => {
    let xmlData: string = "";

    if (factura.xmlConQR) {
      xmlData = factura.xmlConQR;
    }

    const pdfBlob = await generarPDF(xmlData);
    console.log(pdfBlob);

    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Factura_${factura.numeroFactura}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleGeneratePDFTest = async () => {
    try {
      await generarPDFConJsPDF();
    } catch (error) {
      console.error("Error al generar PDF de prueba:", error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-full">
        <h1 className="page-title">Facturas Emitidas</h1>
      </div>

      <InvoiceFilter onFilter={handleFilter} onClear={handleClear} />

      <div className="card-modern">
        <Table>
          <TableHeader>
            <TableRow className="table-header-row">
              <TableHead className="font-semibold text-gray-900">ID</TableHead>
              <TableHead className="font-semibold text-gray-900">
                Número Factura
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Timbrado
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Estado
              </TableHead>
              <TableHead className="font-semibold text-gray-900">CDC</TableHead>
              <TableHead className="font-semibold text-gray-900">
                Lote
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Fecha Creación
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="loading-container">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Cargando documentos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFacturas.map((factura) => (
                <TableRow key={factura.id} className="table-row-hover">
                  <TableCell className="font-medium">{factura.id}</TableCell>
                  <TableCell className="font-medium">
                    {factura.numeroFactura}
                  </TableCell>
                  <TableCell>{factura.timbrado}</TableCell>
                  <TableCell>
                    <StatusBadge status={factura.estado} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <p className="code-inline">
                        {factura.cdc}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(factura.cdc)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="code-inline">
                        {factura.lote}
                      </div>
                      <div>
                        <StatusBadge status={factura.estadoLote} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {factura.fechaCreacion}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="btn-primary"
                        onClick={() => handleGeneratePDF(factura)}
                      >
                        <FileText size={30} />
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredFacturas.length === 0 && !loading && (
        <div className="text-center py-8 text-secondary">
          No se encontraron facturas con los filtros aplicados.
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {(paginaActual - 1) * limitePorPagina + 1} a{" "}
            {Math.min(paginaActual * limitePorPagina, totalDocumentos)} de{" "}
            {totalDocumentos} resultados
          </div>

          <div className="pagination-buttons">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!hasPrevPage || loading}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={30} />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let pageNumber;
                if (totalPaginas <= 5) {
                  pageNumber = i + 1;
                } else if (paginaActual <= 3) {
                  pageNumber = i + 1;
                } else if (paginaActual >= totalPaginas - 2) {
                  pageNumber = totalPaginas - 4 + i;
                } else {
                  pageNumber = paginaActual - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={
                      paginaActual === pageNumber ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className="pagination-page-number"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasNextPage || loading}
              className="flex items-center gap-1"
            >
              Siguiente
              <ChevronRight size={30} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
