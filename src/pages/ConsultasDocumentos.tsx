import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card } from "../components/ui/card";
import { Search, FileX, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { consultarDocumentoPorLote, consultarDocumentoPorCDC, generarEventoCancelacion } from "../api/documentos";
import { toast } from "sonner";

export function ConsultasDocumentos() {
  // Estado para consulta por lote
  const [numeroLote, setNumeroLote] = useState("");
  const [resultadoLote, setResultadoLote] = useState<any>(null);
  const [isLoadingLote, setIsLoadingLote] = useState(false);

  // Estado para consulta por CDC
  const [cdcConsulta, setCdcConsulta] = useState("");
  const [resultadoCdc, setResultadoCdc] = useState<any>(null);
  const [isLoadingCdc, setIsLoadingCdc] = useState(false);

  // Estado para cancelación
  const [cdcCancelacion, setCdcCancelacion] = useState("");
  const [resultadoCancelacion, setResultadoCancelacion] = useState<any>(null);
  const [isLoadingCancelacion, setIsLoadingCancelacion] = useState(false);

  // Handler para consultar por lote
  const handleConsultarLote = async () => {
    if (!numeroLote.trim()) {
      toast.error("Campo requerido", {
        description: "Por favor, ingrese un número de lote",
        duration: 4000,
      });
      return;
    }

    setIsLoadingLote(true);
    setResultadoLote(null);

    try {
      const resultado = await consultarDocumentoPorLote(numeroLote.trim());
      setResultadoLote(resultado);
      toast.success("Consulta exitosa", {
        description: "Se encontró información del lote",
        duration: 4000,
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error al consultar el lote";
      toast.error("Error en la consulta", {
        description: mensaje,
        duration: 5000,
      });
    } finally {
      setIsLoadingLote(false);
    }
  };

  // Handler para consultar por CDC
  const handleConsultarCdc = async () => {
    if (!cdcConsulta.trim()) {
      toast.error("Campo requerido", {
        description: "Por favor, ingrese un CDC",
        duration: 4000,
      });
      return;
    }

    setIsLoadingCdc(true);
    setResultadoCdc(null);

    try {
      const resultado = await consultarDocumentoPorCDC(cdcConsulta.trim());
      setResultadoCdc(resultado);
      toast.success("Consulta exitosa", {
        description: "Se encontró el documento",
        duration: 4000,
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error al consultar el CDC";
      toast.error("Error en la consulta", {
        description: mensaje,
        duration: 5000,
      });
    } finally {
      setIsLoadingCdc(false);
    }
  };

  // Handler para cancelar documento
  const handleCancelarDocumento = async () => {
    if (!cdcCancelacion.trim()) {
      toast.error("Campo requerido", {
        description: "Por favor, ingrese el CDC del documento a cancelar",
        duration: 4000,
      });
      return;
    }

    // Confirmación antes de cancelar
    if (!window.confirm("¿Está seguro de que desea cancelar este documento? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsLoadingCancelacion(true);
    setResultadoCancelacion(null);

    try {
      const resultado = await generarEventoCancelacion(cdcCancelacion.trim());
      setResultadoCancelacion(resultado);
      toast.success("Documento cancelado", {
        description: "El evento de cancelación se generó correctamente",
        duration: 5000,
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error al cancelar el documento";
      toast.error("Error en la cancelación", {
        description: mensaje,
        duration: 5000,
      });
    } finally {
      setIsLoadingCancelacion(false);
    }
  };

  // Función auxiliar para renderizar el estado del documento
  const renderEstadoBadge = (estado: string) => {
    const estilos = {
      APROBADO: "bg-green-100 text-green-800 border-green-300",
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      RECHAZADO: "bg-red-100 text-red-800 border-red-300",
      ENVIADO: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const iconos = {
      APROBADO: <CheckCircle className="w-4 h-4" />,
      PENDIENTE: <AlertCircle className="w-4 h-4" />,
      RECHAZADO: <XCircle className="w-4 h-4" />,
      ENVIADO: <Loader2 className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${estilos[estado as keyof typeof estilos] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
        {iconos[estado as keyof typeof iconos]}
        {estado}
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Consultas y Cancelaciones</h1>
        <p className="page-subtitle">
          Consulte documentos por lote o CDC, y gestione cancelaciones
        </p>
      </div>

      <Tabs defaultValue="lote" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lote">
            <Search className="w-4 h-4 mr-2" />
            Consultar por Lote
          </TabsTrigger>
          <TabsTrigger value="cdc">
            <Search className="w-4 h-4 mr-2" />
            Consultar por CDC
          </TabsTrigger>
          <TabsTrigger value="cancelacion">
            <FileX className="w-4 h-4 mr-2" />
            Cancelar Documento
          </TabsTrigger>
        </TabsList>

        {/* TAB: Consultar por Lote */}
        <TabsContent value="lote" className="mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Consultar Documentos por Número de Lote</h2>
            <p className="text-sm text-gray-600">
              Ingrese el número de lote para consultar todos los documentos asociados
            </p>

            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <Input
                  label=""
                  value={numeroLote}
                  onChange={setNumeroLote}
                  placeholder="Ej: 11835008931753765442"
                  disabled={isLoadingLote}
                />
              </div>
              <Button
                onClick={handleConsultarLote}
                disabled={isLoadingLote}
                className="mt-auto"
              >
                {isLoadingLote ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Consultar
                  </>
                )}
              </Button>
            </div>

            {/* Resultado de la consulta por lote */}
            {resultadoLote && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Resultado de la Consulta</h3>
                <pre className="text-sm bg-white p-4 rounded border overflow-auto max-h-96">
                  {JSON.stringify(resultadoLote, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB: Consultar por CDC */}
        <TabsContent value="cdc" className="mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Consultar Documento por CDC</h2>
            <p className="text-sm text-gray-600">
              Ingrese el CDC (Código de Control del Documento) para consultar su estado
            </p>

            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <Input
                  label=""
                  value={cdcConsulta}
                  onChange={setCdcConsulta}
                  placeholder="Ej: 01029921414001001000001012025100210007997920"
                  disabled={isLoadingCdc}
                />
              </div>
              <Button
                onClick={handleConsultarCdc}
                disabled={isLoadingCdc}
                className="mt-auto"
              >
                {isLoadingCdc ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Consultar
                  </>
                )}
              </Button>
            </div>

            {/* Resultado de la consulta por CDC */}
            {resultadoCdc && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Información del Documento</h3>

                {resultadoCdc.estado && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700 mr-2">Estado:</span>
                    {renderEstadoBadge(resultadoCdc.estado)}
                  </div>
                )}

                <div className="bg-white p-4 rounded border">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(resultadoCdc, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB: Cancelar Documento */}
        <TabsContent value="cancelacion" className="mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Cancelar Documento Electrónico</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Advertencia: Acción Irreversible
                  </p>
                  <p className="text-sm text-yellow-800">
                    Una vez cancelado un documento, no podrá ser revertido. Asegúrese de ingresar el CDC correcto.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="CDC del Documento"
                  value={cdcCancelacion}
                  onChange={setCdcCancelacion}
                  placeholder="Ej: 01029921414001001000001012025090610000003567"
                  disabled={isLoadingCancelacion}
                />
              </div>
              <Button
                onClick={handleCancelarDocumento}
                disabled={isLoadingCancelacion}
                variant="destructive"
                className="mt-auto"
              >
                {isLoadingCancelacion ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <FileX className="w-4 h-4" />
                    Cancelar Documento
                  </>
                )}
              </Button>
            </div>

            {/* Resultado de la cancelación */}
            {resultadoCancelacion && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Cancelación Exitosa</h3>
                </div>
                <p className="text-sm text-green-800 mb-4">
                  El evento de cancelación se ha generado correctamente
                </p>
                <div className="bg-white p-4 rounded border">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(resultadoCancelacion, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
