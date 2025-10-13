import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { configurarEmisor, subirCertificado } from "../api/documentos";
import { toast } from "sonner";
import { Building2, FileKey, Upload, Save, Plus, Trash2 } from "lucide-react";
import type { ConfigurarEmisorDTO, ActividadEconomica, Establecimiento } from "../interfaces";
import { DEPARTAMENTOS_PARAGUAY } from "../interfaces";

export function ConfigurarEmisor() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("datos-basicos");

  // Estado para datos del emisor
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [nombreFantasia, setNombreFantasia] = useState("");
  const [timbradoNumero, setTimbradoNumero] = useState("");
  const [timbradoFecha, setTimbradoFecha] = useState("");
  const [tipoContribuyente, setTipoContribuyente] = useState("1");
  const [tipoRegimen, setTipoRegimen] = useState("8");

  // Estado para actividades económicas
  const [actividades, setActividades] = useState<ActividadEconomica[]>([
    { codigo: "", descripcion: "" }
  ]);

  // Estado para establecimientos
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([
    {
      codigo: "001",
      direccion: "",
      numeroCasa: "0",
      complementoDireccion1: "",
      complementoDireccion2: "",
      departamento: 11,
      departamentoDescripcion: "ALTO PARANA",
      distrito: 145,
      distritoDescripcion: "CIUDAD DEL ESTE",
      ciudad: 3432,
      ciudadDescripcion: "CIUDAD DEL ESTE (MUNIC)",
      telefono: "",
      email: "",
      denominacion: "Sucursal 1"
    }
  ]);

  // Estado para certificado
  const [emisorId, setEmisorId] = useState("");
  const [certificadoPassword, setCertificadoPassword] = useState("");
  const [csc, setCSC] = useState("");
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);

  // Funciones para actividades económicas
  const agregarActividad = () => {
    setActividades([...actividades, { codigo: "", descripcion: "" }]);
  };

  const eliminarActividad = (index: number) => {
    if (actividades.length > 1) {
      setActividades(actividades.filter((_, i) => i !== index));
    }
  };

  const actualizarActividad = (index: number, campo: keyof ActividadEconomica, valor: string) => {
    const nuevasActividades = [...actividades];
    const actividadActual = nuevasActividades[index];
    if (actividadActual) {
      nuevasActividades[index] = { ...actividadActual, [campo]: valor };
      setActividades(nuevasActividades);
    }
  };

  // Funciones para establecimientos
  const agregarEstablecimiento = () => {
    const nuevoNumero = String(establecimientos.length + 1).padStart(3, "0");
    setEstablecimientos([
      ...establecimientos,
      {
        codigo: nuevoNumero,
        direccion: "",
        numeroCasa: "0",
        complementoDireccion1: "",
        complementoDireccion2: "",
        departamento: 11,
        departamentoDescripcion: "ALTO PARANA",
        distrito: 145,
        distritoDescripcion: "CIUDAD DEL ESTE",
        ciudad: 3432,
        ciudadDescripcion: "CIUDAD DEL ESTE (MUNIC)",
        telefono: "",
        email: "",
        denominacion: `Sucursal ${establecimientos.length + 1}`
      }
    ]);
  };

  const eliminarEstablecimiento = (index: number) => {
    if (establecimientos.length > 1) {
      setEstablecimientos(establecimientos.filter((_, i) => i !== index));
    }
  };

  const actualizarEstablecimiento = (index: number, campo: keyof Establecimiento, valor: any) => {
    const nuevosEstablecimientos = [...establecimientos];
    const establecimientoActual = nuevosEstablecimientos[index];

    if (establecimientoActual) {
      nuevosEstablecimientos[index] = { ...establecimientoActual, [campo]: valor };

      // Actualizar descripción si se cambia el departamento
      if (campo === "departamento") {
        const dept = DEPARTAMENTOS_PARAGUAY.find(d => d.id === Number(valor));
        if (dept) {
          nuevosEstablecimientos[index].departamentoDescripcion = dept.nombre;
        }
      }

      setEstablecimientos(nuevosEstablecimientos);
    }
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    if (!ruc || !razonSocial || !nombreFantasia) {
      toast.error("Error de validación", {
        description: "Complete los campos obligatorios: RUC, Razón Social y Nombre de Fantasía",
      });
      return false;
    }

    if (!timbradoNumero || !timbradoFecha) {
      toast.error("Error de validación", {
        description: "Complete los datos del timbrado",
      });
      return false;
    }

    if (actividades.some(a => !a.codigo || !a.descripcion)) {
      toast.error("Error de validación", {
        description: "Complete todas las actividades económicas",
      });
      return false;
    }

    if (establecimientos.some(e => !e.direccion || !e.telefono || !e.email)) {
      toast.error("Error de validación", {
        description: "Complete todos los datos de los establecimientos",
      });
      return false;
    }

    return true;
  };

  // Guardar configuración del emisor
  const handleGuardarEmisor = async () => {
    if (!validarFormulario()) return;

    setIsSubmitting(true);

    try {
      const emisorData: ConfigurarEmisorDTO = {
        version: 150,
        ruc,
        razonSocial,
        nombreFantasia,
        actividadesEconomicas: actividades,
        timbradoNumero,
        timbradoFecha,
        tipoContribuyente: Number(tipoContribuyente),
        tipoRegimen: Number(tipoRegimen),
        establecimientos
      };

      const response = await configurarEmisor(emisorData);

      if (response.success) {
        toast.success("Emisor configurado correctamente", {
          description: "Los datos del emisor se guardaron exitosamente",
        });

        // Guardar el emisorId para usarlo en el certificado
        if (response.data?.id) {
          setEmisorId(response.data.id.toString());
          setCurrentTab("certificado");
        }
      }
    } catch (error) {
      toast.error("Error al configurar emisor", {
        description: error instanceof Error ? error.message : "Ocurrió un error desconocido",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subir certificado
  const handleSubirCertificado = async () => {
    if (!emisorId || !certificadoPassword || !csc || !certificadoFile) {
      toast.error("Error de validación", {
        description: "Complete todos los campos del certificado",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await subirCertificado(
        Number(emisorId),
        certificadoPassword,
        csc,
        certificadoFile
      );

      if (response.success) {
        toast.success("Certificado subido correctamente", {
          description: "El certificado se cargó exitosamente. Ya puede emitir facturas.",
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error("Error al subir certificado", {
        description: error instanceof Error ? error.message : "Ocurrió un error desconocido",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".p12")) {
        setCertificadoFile(file);
      } else {
        toast.error("Archivo inválido", {
          description: "Solo se permiten archivos .p12",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurar Emisor</h1>
          <p className="text-gray-500">Configure los datos de su empresa para facturación electrónica</p>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="datos-basicos">Datos Básicos</TabsTrigger>
          <TabsTrigger value="establecimientos">Establecimientos</TabsTrigger>
          <TabsTrigger value="certificado">Certificado Digital</TabsTrigger>
        </TabsList>

        {/* TAB 1: DATOS BÁSICOS */}
        <TabsContent value="datos-basicos">
          <Card>
            <CardHeader>
              <CardTitle>Información del Emisor</CardTitle>
              <CardDescription>
                Complete los datos fiscales de su empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="RUC *"
                  value={ruc}
                  onChange={setRuc}
                  placeholder="Ej: 80012345-6"
                  required
                />
                <Input
                  label="Razón Social *"
                  value={razonSocial}
                  onChange={setRazonSocial}
                  placeholder="Nombre legal de la empresa"
                  required
                />
                <Input
                  label="Nombre de Fantasía *"
                  value={nombreFantasia}
                  onChange={setNombreFantasia}
                  placeholder="Nombre comercial"
                  required
                />
              </div>

              {/* Timbrado */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Datos del Timbrado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Número de Timbrado *"
                    value={timbradoNumero}
                    onChange={setTimbradoNumero}
                    placeholder="Ej: 18067572"
                    required
                  />
                  <Input
                    label="Fecha de Vencimiento *"
                    type="text"
                    value={timbradoFecha}
                    onChange={setTimbradoFecha}
                    placeholder="YYYY-MM-DD"
                    required
                  />
                </div>
              </div>

              {/* Tipo de contribuyente */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Clasificación Tributaria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contribuyente *
                    </label>
                    <select
                      value={tipoContribuyente}
                      onChange={(e) => setTipoContribuyente(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="1">Persona Física</option>
                      <option value="2">Persona Jurídica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Régimen *
                    </label>
                    <select
                      value={tipoRegimen}
                      onChange={(e) => setTipoRegimen(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="8">Régimen Simplificado</option>
                      <option value="1">Régimen General</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actividades Económicas */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Actividades Económicas</h3>
                  <Button
                    type="button"
                    onClick={agregarActividad}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Actividad
                  </Button>
                </div>

                {actividades.map((actividad, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <Input
                      label={index === 0 ? "Código" : ""}
                      value={actividad.codigo}
                      onChange={(value) => actualizarActividad(index, "codigo", value)}
                      placeholder="Ej: 62010"
                      className="w-32"
                    />
                    <Input
                      label={index === 0 ? "Descripción" : ""}
                      value={actividad.descripcion}
                      onChange={(value) => actualizarActividad(index, "descripcion", value)}
                      placeholder="Ej: Actividades de programación informática"
                      className="flex-1"
                    />
                    {actividades.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => eliminarActividad(index)}
                        variant="outline"
                        size="sm"
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={handleGuardarEmisor}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : "Guardar y Continuar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ESTABLECIMIENTOS */}
        <TabsContent value="establecimientos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Establecimientos</CardTitle>
                  <CardDescription>
                    Configure los puntos de emisión de sus facturas
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={agregarEstablecimiento}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Establecimiento
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {establecimientos.map((establecimiento, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">
                      Establecimiento {establecimiento.codigo}
                    </h4>
                    {establecimientos.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => eliminarEstablecimiento(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Código"
                      value={establecimiento.codigo}
                      onChange={(value) => actualizarEstablecimiento(index, "codigo", value)}
                      placeholder="001"
                      disabled
                    />
                    <Input
                      label="Denominación *"
                      value={establecimiento.denominacion}
                      onChange={(value) => actualizarEstablecimiento(index, "denominacion", value)}
                      placeholder="Sucursal 1"
                      required
                    />
                    <Input
                      label="Dirección *"
                      value={establecimiento.direccion}
                      onChange={(value) => actualizarEstablecimiento(index, "direccion", value)}
                      placeholder="Calle Principal 123"
                      required
                      className="md:col-span-2"
                    />
                    <Input
                      label="Número de Casa"
                      value={establecimiento.numeroCasa}
                      onChange={(value) => actualizarEstablecimiento(index, "numeroCasa", value)}
                      placeholder="0"
                    />
                    <Input
                      label="Complemento 1"
                      value={establecimiento.complementoDireccion1 || ""}
                      onChange={(value) => actualizarEstablecimiento(index, "complementoDireccion1", value)}
                      placeholder="Entre calle A y B"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento *
                      </label>
                      <select
                        value={establecimiento.departamento}
                        onChange={(e) => actualizarEstablecimiento(index, "departamento", Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {DEPARTAMENTOS_PARAGUAY.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Teléfono *"
                      value={establecimiento.telefono}
                      onChange={(value) => actualizarEstablecimiento(index, "telefono", value)}
                      placeholder="0981123456"
                      required
                    />
                    <Input
                      label="Email *"
                      type="email"
                      value={establecimiento.email}
                      onChange={(value) => actualizarEstablecimiento(index, "email", value)}
                      placeholder="establecimiento@empresa.com"
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={handleGuardarEmisor}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : "Guardar y Continuar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CERTIFICADO DIGITAL */}
        <TabsContent value="certificado">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-5 w-5" />
                Certificado Digital
              </CardTitle>
              <CardDescription>
                Suba el certificado digital (.p12) para firmar las facturas electrónicamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Información importante:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>El archivo debe tener extensión .p12</li>
                  <li>Necesita la contraseña del certificado</li>
                  <li>Necesita el CSC (Código de Seguridad del Contribuyente)</li>
                  <li>Primero debe guardar la configuración del emisor</li>
                </ul>
              </div>

              <div className="space-y-4">
                <Input
                  label="ID del Emisor *"
                  value={emisorId}
                  onChange={setEmisorId}
                  placeholder="Se genera al guardar el emisor"
                  type="number"
                  required
                />

                <Input
                  label="Contraseña del Certificado *"
                  type="password"
                  value={certificadoPassword}
                  onChange={setCertificadoPassword}
                  placeholder="Contraseña del archivo .p12"
                  required
                />

                <Input
                  label="CSC (Código de Seguridad) *"
                  value={csc}
                  onChange={setCSC}
                  placeholder="Código proporcionado por la SET"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo del Certificado (.p12) *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".p12"
                      onChange={handleFileChange}
                      className="hidden"
                      id="certificado-input"
                    />
                    <label
                      htmlFor="certificado-input"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Seleccionar archivo
                    </label>
                    {certificadoFile && (
                      <span className="text-sm text-gray-600">
                        {certificadoFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={handleSubirCertificado}
                  disabled={isSubmitting || !emisorId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Subiendo..." : "Subir Certificado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
