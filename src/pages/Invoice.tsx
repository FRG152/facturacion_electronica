import {
  Copy,
  Download,
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

import QRCode from "qrcode";

import html2pdf from "html2pdf.js";

import { toast } from "sonner";

import { Button } from "../components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import InvoiceFilter from "@/components/InvoiceFilter";

import { type Factura } from "../constants/invoice";

import { getListaDocumentos } from "../api";

import { useState, useEffect } from "react";

import type { DocumentoItem, ListarDocumentosParams } from "@/interfaces";

export function Facturas() {
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([]);

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
          estado: doc.estado,
          cdc: doc.cdc,
          lote: doc.lote?.numeroLote || "",
          estadoLote: doc.lote?.estado as
            | "PENDIENTE"
            | "ENVIADO"
            | "RECHAZADO"
            | "APROBADO",
          fechaCreacion: new Date(doc.fechaCreacion).toLocaleDateString(),
          xml: doc.xml,
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

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const handleGeneratePDF = async (factura: Factura) => {
    try {
      setIsGeneratingPDF(true);

      if (!factura.xml || factura.xml.trim() === "") {
        toast.error("Sin datos XML", {
          description:
            "Esta factura no tiene datos XML disponibles para generar el PDF",
          duration: 5000,
        });
        return;
      }

      // Parsear XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(factura.xml, "text/xml");

      // Helper para obtener valores
      const getNodeValue = (tagName: string): string => {
        const node = xmlDoc.getElementsByTagName(tagName)[0];
        return node?.textContent?.trim() || "";
      };

      // Función para formatear números
      const formatNum = (num: number | string): string => {
        const n = typeof num === "string" ? parseFloat(num) : num;
        return new Intl.NumberFormat("es-PY", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(n || 0);
      };

      // Función para formatear fecha
      const formatFecha = (fecha: string): string => {
        if (!fecha) return "-";
        try {
          const d = new Date(fecha);
          return d.toLocaleString("es-PY", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        } catch {
          return fecha;
        }
      };

      // Extraer datos del emisor
      const emisor = {
        nombre: getNodeValue("dNomEmi"),
        ruc: getNodeValue("dRucEm") + "-" + getNodeValue("dDVEmi"),
        direccion: getNodeValue("dDirEmi"),
        telefono: getNodeValue("dTelEmi"),
        email: getNodeValue("dEmailE"),
        departamento: getNodeValue("dDesDepEmi"),
        ciudad: getNodeValue("dDesCiuEmi"),
        actividad: getNodeValue("dDesActEco"),
      };

      // Extraer datos del documento
      const documento = {
        timbrado: getNodeValue("dNumTim"),
        establecimiento: getNodeValue("dEst"),
        puntoExpedicion: getNodeValue("dPunExp"),
        numero: getNodeValue("dNumDoc").padStart(7, "0"),
        fechaVigencia: getNodeValue("dFeIniT"),
        fechaEmision: getNodeValue("dFeEmiDE"),
        cdc:
          getNodeValue("Id") ||
          xmlDoc.querySelector("DE")?.getAttribute("Id") ||
          "",
        condicion: getNodeValue("dDCondOpe"),
        moneda: getNodeValue("cMoneOpe"),
        tipoCambio: getNodeValue("dTiCam"),
      };

      // Extraer datos del receptor
      const receptor = {
        nombre: getNodeValue("dNomRec"),
        ruc: getNodeValue("dRucRec") + "-" + getNodeValue("dDVRec"),
        email: getNodeValue("dEmailRec"),
        direccion: getNodeValue("dDirRec"),
        telefono: getNodeValue("dTelRec"),
        codigoCliente: getNodeValue("dCodCliente"),
      };

      // Extraer items
      const itemNodes = xmlDoc.getElementsByTagName("gCamItem");
      const items = [];

      for (let i = 0; i < itemNodes.length; i++) {
        const item = itemNodes[i];
        if (!item) continue;
        const getItemValue = (tag: string) =>
          item.getElementsByTagName(tag)[0]?.textContent?.trim() || "";

        const cantidad = parseFloat(getItemValue("dCantProSer")) || 0;
        const precioUnitario = parseFloat(getItemValue("dPUniProSer")) || 0;
        const total = parseFloat(getItemValue("dTotOpeItem")) || 0;
        const tasaIva = parseFloat(getItemValue("dTasaIVA")) || 0;

        items.push({
          codigo: getItemValue("dCodInt"),
          descripcion: getItemValue("dDesProSer"),
          cantidad,
          precioUnitario,
          total,
          tasaIva,
          unidad: getItemValue("dDesUniMed"),
        });
      }

      // Extraer totales
      const totales = {
        exentas: parseFloat(getNodeValue("dSubExe")) || 0,
        gravadas5: parseFloat(getNodeValue("dSub5")) || 0,
        gravadas10: parseFloat(getNodeValue("dSub10")) || 0,
        iva5: parseFloat(getNodeValue("dIVA5")) || 0,
        iva10: parseFloat(getNodeValue("dIVA10")) || 0,
        totalIva: parseFloat(getNodeValue("dTotIVA")) || 0,
        totalOperacion: parseFloat(getNodeValue("dTotOpe")) || 0,
      };

      const qrCode = getNodeValue("dCarQR");

      const qrCodeDataURL = await QRCode.toDataURL(qrCode || `${qrCode}`);

      // Generar filas de items
      let itemsHtml = "";
      items.forEach((item) => {
        const exentas = item.tasaIva === 0 ? formatNum(item.total) : "0";
        const grav5 = item.tasaIva === 5 ? formatNum(item.total) : "0";
        const grav10 = item.tasaIva === 10 ? formatNum(item.total) : "0";

        itemsHtml += `
          <tr>
            <td>${item.codigo}</td>
            <td class="desc-col">${item.descripcion}</td>
            <td>${formatNum(item.cantidad)}</td>
            <td class="num-col">${formatNum(item.precioUnitario)}</td>
            <td class="num-col">${exentas}</td>
            <td class="num-col">${grav5}</td>
            <td class="num-col">${grav10}</td>
          </tr>
        `;
      });

      // Agregar fila de subtotal
      itemsHtml += `
        <tr style="background-color: #f0f0f0;">
          <td colspan="4" style="text-align: right; font-weight: bold;">Subtotal:</td>
          <td class="num-col" style="font-weight: bold;">${formatNum(
            totales.exentas
          )}</td>
          <td class="num-col" style="font-weight: bold;">${formatNum(
            totales.gravadas5
          )}</td>
          <td class="num-col" style="font-weight: bold;">${formatNum(
            totales.gravadas10
          )}</td>
        </tr>
      `;

      // Agregar fila de Total a Pagar
      itemsHtml += `
        <tr style="background-color: #34495e; color: white;">
          <td colspan="6" style="text-align: right; font-weight: bold; padding: 8px;">Total a Pagar:</td>
          <td class="num-col" style="font-weight: bold; padding: 8px;">${formatNum(
            totales.totalOperacion
          )}</td>
        </tr>
      `;

      const cdcFormateado =
        documento.cdc.match(/.{1,4}/g)?.join(" ") || documento.cdc;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            .container { 
              color: #000; 
              width: 100%; 
              margin: 0 auto; 
              padding: 15px; 
              max-width: 210mm; 
              font-size: 11px; 
              line-height: 1.4; 
              font-family: Arial, sans-serif; 
            }
            
            .status-badge { 
              color: white; 
              border: none;
              height: 28px;
              font-size: 12px; 
              text-align: center; 
              font-weight: bold; 
              margin-bottom: 10px;
              border-radius: 10px;
              background-color: #dc3545; 
            }
            
            .main-header { 
              border: 2px solid #000; 
              padding: 12px; 
              margin-bottom: 10px; 
              border-radius: 10px;
              background-color: #fff; 
            }
            
            .main-header table { width: 100%; }
            .main-header td { vertical-align: top; padding: 5px; }
            
            .header-left { 
              width: 20%; 
              padding-right: 15px;
            }
            
            .header-center { 
              width: 45%; 
              padding-left: 15px;
              padding-right: 15px;
            }
            
            .header-right { 
              width: 35%; 
              text-align: right;
              padding-left: 15px;
            }
            
            .company-name { 
              color: #000;
              font-size: 13px; 
              font-weight: bold; 
            }
            
            .company-activity { 
              color: #666; 
              font-size: 9px; 
              font-style: italic; 
            }

            .company-location {
              font-size: 9px; 
            }

            .company-address {
              color: #666; 
              font-size: 9px; 
            }

            .company-phone {
              font-size: 9px; 
            }

            .company-email {
              font-size: 9px;
            }
            
            .invoice-number { 
              color: #000; 
              font-size: 14px;
              font-weight: bold;
            }
            
            .info-section { 
              border: 2px solid #000; 
              padding: 12px; 
              margin-bottom: 10px; 
              border-radius: 10px;
              background-color: #fff; 
            }
            
            .info-section table { width: 100%; border-collapse: collapse; }
            .info-section td { 
              vertical-align: top; 
              padding: 8px; 
              width: 50%; 
            }
          
            .section-title { 
              color: #000; 
              padding: 0 0 10px 0;
              font-size: 11px; 
              font-weight: bold; 
              margin-bottom: 8px; 
              border-bottom: 1px solid #000; 
            }
            
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 10px;
              border: 2px solid #000;
            }
            
            .items-table th { 
              background-color: #34495e; 
              color: white; 
              border: 1px solid #000; 
              padding: 8px 5px; 
              text-align: center; 
              font-weight: bold; 
              font-size: 10px; 
            }
            
            .items-table td { 
              border: 1px solid #000; 
              padding: 6px 5px; 
              text-align: center; 
              font-size: 10px; 
            }
            
            .desc-col { text-align: left !important; }
            .num-col { 
              text-align: right !important; 
              font-family: 'Courier New', monospace; 
              padding-right: 8px !important; 
            }
            
            .tax-summary { 
              color: white; 
              height: 32px; 
              font-size: 11px; 
              text-align: right; 
              font-weight: bold; 
              padding-right: 8px; 
              border-radius: 10px;
              background-color: #6c757d; 
            }
            
            .footer-section { 
              border: 2px solid #000; 
              padding: 15px; 
              margin-top: 10px; 
              border-radius: 10px;
              background-color: #fff; 
            }
            
            .footer-section table { width: 100%; border-collapse: collapse; }
            .footer-section td { vertical-align: top; }
            
            .qr-section { 
              width: 30%; 
              text-align: center; 
              padding-right: 15px; 
            }
            
            .verification-section { 
              width: 70%; 
              padding-left: 15px; 
            }
            
            .verification-url { 
              color: #0066cc; 
              font-weight: bold; 
              font-size: 10px; 
            }
            
            .cdc-display { 
              margin: 12px 0; 
              padding: 10px 0 21px 0; 
              word-wrap: break-word;
              font-size: 10px; 
              text-align: center; 
              font-weight: bold; 
              font-family: 'Courier New', monospace; 
              border-radius: 10px;
              letter-spacing: 1px; 
              background-color: #f8f9fa; 
            }
            
            .logo-placeholder {
              color: #999;
              width: 100px;
              height: 80px;
              display: flex;
              font-size: 10px;
              text-align: center;
              align-items: center;
              justify-content: center;
              background-color: #f0f0f0;
            }

            .legal-footer {
              color: white;
              height: 30px;
              padding-bottom: 10px;
              font-size: 8px; 
              text-align: center; 
              margin-top: 10px;
              border-radius: 10px;
              background-color: #2c3e50;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="status-badge">KuDE de FACTURA ELECTRONICA</div>
            
            <div class="main-header">
              <table>
                <tr>

                  <td class="header-left">
                    <div class="logo-placeholder">
                      <img src="/logo.jpg" alt="Logo" />
                    </div>
                  </td>

                  <td class="header-center">

                    <div class="company-name">${emisor.nombre}</div>

                    <div class="company-activity">${emisor.actividad}</div>

                    <div class="company-address">${emisor.direccion}</div>

                    <div class="company-location">${emisor.ciudad} - ${
        emisor.departamento
      } - PARAGUAY<br></div>

                    <div class="company-phone"><strong>Teléfono:</strong> ${
                      emisor.telefono
                    } </div>
                    
                    <div class="company-email"><strong>Correo:</strong> ${
                      emisor.email
                    }</div>

                  </td>

                  <td class="header-right">

                    <strong>RUC:</strong> ${emisor.ruc}<br>

                    <strong>Timbrado N°:</strong> ${documento.timbrado}<br>

                    <strong>Inicio de vigencia:</strong> ${
                      documento.fechaVigencia
                    }

                    <div class="invoice-number">Factura Electrónica<br>${
                      documento.establecimiento
                    }-${documento.puntoExpedicion}-${documento.numero}</div>

                  </td>

                </tr>
              </table>
            </div>
            
            <div class="info-section">
              <table>
                <tr>
                  <td>

                    <div class="section-title">Información de Emisión</div>

                    <strong>Fecha y hora de emisión:</strong> ${formatFecha(
                      documento.fechaEmision
                    )}<br>

                    <strong>Condición de venta:</strong> ${
                      documento.condicion
                    }<br>

                    <strong>Moneda:</strong> ${documento.moneda}

                    ${
                      documento.tipoCambio
                        ? `<br><strong>Tipo de cambio:</strong> ${documento.tipoCambio}`
                        : ""
                    }
                  </td>

                  <td>
                    <div class="section-title">Datos del Cliente</div>

                    <strong>Nombre o Razón Social:</strong> ${
                      receptor.nombre
                    }<br>

                    <strong>RUC/Documento de identidad N°:</strong> ${
                      receptor.ruc
                    }<br>

                    ${
                      receptor.email
                        ? `<strong>Correo:</strong> ${receptor.email}<br>`
                        : ""
                    }

                    ${
                      receptor.direccion
                        ? `<strong>Dirección:</strong> ${receptor.direccion}<br>`
                        : ""
                    }

                    ${
                      receptor.telefono
                        ? `<strong>Teléfono:</strong> ${receptor.telefono}<br>`
                        : ""
                    }

                    ${
                      receptor.codigoCliente
                        ? `<strong>Código Cliente:</strong> ${receptor.codigoCliente}`
                        : ""
                    }
                  </td>

                </tr>
              </table>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 10%;">Código</th>
                  <th style="width: 25%;">Descripción</th>
                  <th style="width: 10%;">Cantidad</th>
                  <th style="width: 12%;">Precio</th>
                  <th style="width: 13%;">Exentas</th>
                  <th style="width: 13%;">5%</th>
                  <th style="width: 17%;">10%</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            
            <div class="tax-summary">
              Liquidación Iva: (5%) ${formatNum(
                totales.iva5
              )} &nbsp;&nbsp; (10%) ${formatNum(
        totales.iva10
      )} &nbsp;&nbsp; <strong>Total Iva: ${formatNum(totales.totalIva)}</strong>
            </div>
            
            <div class="footer-section">
              <table>
                <tr>

                  <td class="qr-section">
                     <img src="${qrCodeDataURL}" alt="QR" width="120" height="120" />
                  </td>

                  <td class="verification-section">

                    <strong>Consulte esta Factura Electrónica con el número impreso abajo:</strong><br>

                    <span class="verification-url">https://ekuatia.set.gov.py/consultas/</span>

                    <div class="cdc-display">${cdcFormateado}</div>

                    <div style="text-align: center; font-weight: bold; font-size: 10px; margin-top: 10px;">
                      ESTE DOCUMENTO ES UNA REPRESENTACIÓN GRÁFICA DE UN<br>DOCUMENTO ELECTRÓNICO (XML)
                    </div>

                  </td>

                </tr>
              </table>
            </div>

            <div class="legal-footer">
              Si su documento electrónico presenta algún error puede solicitar la modificación dentro de las 72 horas siguientes de la emisión de este comprobante.
            </div>

          </div>
        </body>
        </html>
      `;

      const element = document.createElement("div");
      element.innerHTML = htmlContent;
      document.body.appendChild(element);

      const opt = {
        margin: 10,
        filename: `Factura_KuDE_${documento.establecimiento}-${documento.puntoExpedicion}-${documento.numero}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          document.body.removeChild(element);
          toast.success("PDF generado correctamente", {
            description: `El PDF de la factura ${factura.numeroFactura} se descargó exitosamente`,
            duration: 4000,
          });
        });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      let descripcion = "Ocurrió un error inesperado al generar el PDF";
      if (error instanceof Error) descripcion = error.message;
      toast.error("Error al generar PDF", {
        description: descripcion,
        duration: 6000,
      });
    } finally {
      setIsGeneratingPDF(false);
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
                  <TableCell>
                    <StatusBadge status={factura.estado} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <p className="code-inline">{factura.cdc}</p>
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
                    {factura.lote ? (
                      <div className="space-y-1">
                        <div className="code-inline">{factura.lote}</div>
                        <div>
                          <StatusBadge status={factura.estadoLote} />
                        </div>
                      </div>
                    ) : (
                      <div className="code-inline">-</div>
                    )}
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
                        disabled={isGeneratingPDF}
                      >
                        {isGeneratingPDF ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Download size={30} />
                            PDF
                          </>
                        )}
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

      {/* Paginacion */}
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
