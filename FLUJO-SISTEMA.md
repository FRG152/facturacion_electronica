  🎯 FLUJO PARA EMITIR FACTURA

  📋 FLUJO A: SIN EMPRESA (Solo Facturación)

  Este flujo es más simple pero NO permite gestionar clientes en el sistema.

  ---
  PASO 1: Login del Usuario

  Endpoint: POST /api1/users/login

  // Request
  POST http://localhost/api1/users/login
  Headers: {
    "Content-Type": "application/json"
  }
  Body: {
    "username": "testuser",
    "password": "password123"
  }

  // Response
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser"
    }
  }

  // ✅ Guardar en localStorage
  localStorage.setItem("auth_token", access_token)

  Estado: ✅ Usuario autenticado con JWT

  ---
  PASO 2: Configurar Emisor (Solo primera vez)

  Endpoint: POST /api1/emisor

  // Request
  POST http://localhost/api1/emisor
  Headers: {
    "user_token": "tu_token_secreto_aqui_cambiar_en_produccion",
    "Content-Type": "application/json"
  }
  Body: {
    "version": 150,
    "ruc": "2992141-4",
    "razonSocial": "BENITEZ GAMARRA CARLOS VICTOR",
    "nombreFantasia": "TECASIS SOLUCIONES TECNOLOGICAS",
    "actividadesEconomicas": [
      {
        "codigo": "62010",
        "descripcion": "Actividades de programación informática"
      }
    ],
    "timbradoNumero": "18067572",
    "timbradoFecha": "2025-05-31",
    "tipoContribuyente": 1,  // 1=Persona física, 2=Persona jurídica
    "tipoRegimen": 8,         // 8=Simplificado, 1=General
    "establecimientos": [
      {
        "codigo": "001",
        "direccion": "BENIGNO FERREIRA, A 200 METROS DE LA AVDA.",
        "numeroCasa": "0",
        "complementoDireccion1": "Entre calle 2",
        "complementoDireccion2": "y Calle 7",
        "departamento": 11,
        "departamentoDescripcion": "ALTO PARANA",
        "distrito": 145,
        "distritoDescripcion": "CIUDAD DEL ESTE",
        "ciudad": 3432,
        "ciudadDescripcion": "CIUDAD DEL ESTE (MUNIC)",
        "telefono": "0973583374",
        "email": "contacto@empresa.com",
        "denominacion": "Sucursal 1"
      }
    ]
  }

  // Response
  {
    "success": true,
    "message": "Emisor configurado correctamente",
    "data": { ... }
  }

  Estado: ✅ Emisor configurado

  ---
  PASO 3: Subir Certificado Digital (Solo primera vez)

  Endpoint: POST /api1/certificado-emisor

  // Request (multipart/form-data)
  POST http://localhost/api1/certificado-emisor
  Headers: {
    "user_token": "tu_token_secreto_aqui_cambiar_en_produccion"
    // NO incluir Content-Type, se establece automáticamente
  }
  FormData: {
    "emisorId": "1",
    "password": "carlos1002",
    "CSC": "C222663Ae927cd714F0954cd4AD3940A",
    "certificado": [Archivo .p12]
  }

  // Response
  {
    "success": true,
    "message": "Certificado subido correctamente"
  }

  Estado: ✅ Certificado configurado, listo para emitir

  ---
  PASO 4: Emitir Factura

  Endpoint: POST /api1/documentos

  // Request
  POST http://localhost/api1/documentos
  Headers: {
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_token": "tu_token_secreto_aqui_cambiar_en_produccion",
    "Content-Type": "application/json"
  }
  Body: {
    "tipoDocumento": 1,              // 1=Factura
    "establecimiento": "001",
    "punto": "001",
    "numero": 10,
    "codigoSeguridadAleatorio": "657678",
    "descripcion": "Factura electrónica",
    "observacion": "",
    "fecha": "2025-08-14T10:57:26",
    "tipoEmision": 1,
    "tipoTransaccion": 2,
    "tipoImpuesto": 1,
    "moneda": "PYG",
    "condicionAnticipo": 0,
    "condicionTipoCambio": 0,
    "descuentoGlobal": 0,
    "anticipoGlobal": 0,
    "cambio": "",
    "factura": {
      "presencia": 1,
      "fecha": "2025-08-14T10:57:26"
    },
    "cliente": {
      "contribuyente": true,
      "razonSocial": "Rosmary Brunaga",
      "tipoOperacion": 1,
      "tipoContribuyente": 2,
      "direccion": "",
      "numeroCasa": "0",
      "departamento": 11,
      "departamentoDescripcion": "ALTO PARANA",
      "distrito": 173,
      "distritoDescripcion": "CIUDAD DEL ESTE",
      "ciudad": 4278,
      "ciudadDescripcion": "CIUDAD DEL ESTE",
      "pais": "PRY",
      "paisDescripcion": "Paraguay",
      "telefono": "",
      "celular": "",
      "email": "",
      "codigo": "026",
      "ruc": "4155258-0",
      "documentoTipo": 1,
      "documentoNumero": "4155258"
    },
    "usuario": {
      "documentoTipo": 1,
      "documentoNumero": "1",
      "nombre": "testuser",
      "cargo": "Vendedor"
    },
    "condicion": {
      "tipo": 1,  // 1=Contado
      "entregas": [
        {
          "tipo": 1,
          "monto": 100000,
          "moneda": "PYG",
          "cambio": 0
        }
      ]
    },
    "items": [
      {
        "codigo": "15253621",
        "descripcion": "Servicios profesionales",
        "observacion": "",
        "unidadMedida": 77,
        "cantidad": 1,
        "precioUnitario": 100000,
        "cambio": 0,
        "descuento": 0,
        "anticipo": 0,
        "pais": "PRY",
        "paisDescripcion": "Paraguay",
        "ivaTipo": 1,
        "ivaBase": 100,
        "iva": 10
      }
    ]
  }

  // Response
  {
    "success": true,
    "message": "Factura emitida correctamente",
    "documento": {
      "id": 123,
      "numeroDocumento": "001-001-0000010",
      "cdc": "01029921414001001000001012025...",
      "estado": "aprobado",
      "xmlConQR": "<?xml version='1.0'?>..."
    }
  }

  Estado: ✅ FACTURA EMITIDA EXITOSAMENTE

  ---
  📋 FLUJO B: CON EMPRESA (Sistema Completo)

  Este flujo permite gestionar clientes en el sistema y es el RECOMENDADO.

  ---
  PASO 1: Login del Usuario

  Igual que Flujo A - PASO 1

  POST /api1/users/login
  → Guardar JWT token en localStorage

  Estado: ✅ Usuario autenticado

  ---
  PASO 2: Crear Empresa (Solo primera vez)

  Endpoint: POST /api2/empresas (NO requiere token)

  // Request
  POST http://localhost/api2/empresas
  Headers: {
    "Content-Type": "application/json"
  }
  Body: {
    "nombre": "Mi Empresa S.A.",
    "ruc": "80012345-6",
    "email": "contacto@miempresa.com",
    "telefono": "021500100",
    "direccion": "Avda. España 1234, Asunción"
  }

  // Response
  {
    "success": true,
    "message": "Empresa creada exitosamente",
    "data": {
      "id": 1,
      "nombre": "Mi Empresa S.A.",
      "ruc": "80012345-6",
      "email": "contacto@miempresa.com",
      "telefono": "021500100",
      "direccion": "Avda. España 1234, Asunción",
      "api_token": "empresa_token_abc123xyz...",  // ← ¡IMPORTANTE!
      "activo": 1,
      "created_at": "2025-10-13T10:30:00.000Z"
    }
  }

  // ✅ Guardar empresa y token
  localStorage.setItem("empresa_activa", JSON.stringify(response.data))
  localStorage.setItem("current_api_token", response.data.api_token)
  localStorage.setItem("empresa_id", response.data.id)

  Estado: ✅ Empresa creada con api_token

  ---
  PASO 3: Crear Clientes

  Endpoint: POST /api2/clientes

  // Request - Crear Cliente Persona Física
  POST http://localhost/api2/clientes
  Headers: {
    "X-API-Token": "empresa_token_abc123xyz...",
    "Content-Type": "application/json"
  }
  Body: {
    "nombre": "Juan Carlos Pérez",
    "tipo_persona": "fisica",
    "ci": "12345678",
    "fecha_nacimiento": "1990-05-15",
    "telefono": "0981123456",
    "email": "juan.perez@example.com",
    "direccion": "Avda. España 1234, Asunción"
  }

  // Response
  {
    "success": true,
    "message": "Cliente creado exitosamente",
    "data": {
      "id": 1,
      "nombre": "Juan Carlos Pérez",
      "tipo_persona": "fisica",
      "ci": "12345678",
      "ruc": null,
      "telefono_normalizado": "595981123456",
      "empresa_id": 1,
      ...
    }
  }

  // Request - Crear Cliente Persona Jurídica
  POST http://localhost/api2/clientes
  Headers: {
    "X-API-Token": "empresa_token_abc123xyz...",
    "Content-Type": "application/json"
  }
  Body: {
    "nombre": "Constructora del Este S.A.",
    "tipo_persona": "juridica",
    "ruc": "80012345-6",
    "telefono": "021500100",
    "email": "contacto@constructora.com.py",
    "direccion": "Avda. Aviadores del Chaco 2000"
  }

  // Response
  {
    "success": true,
    "message": "Cliente creado exitosamente",
    "data": {
      "id": 2,
      "nombre": "Constructora del Este S.A.",
      "tipo_persona": "juridica",
      "ruc": "80012345-6",
      "empresa_id": 1,
      ...
    }
  }

  Estado: ✅ Clientes creados y asociados a la empresa

  ---
  PASO 4: Configurar Emisor

  Igual que Flujo A - PASO 2

  POST /api1/emisor
  Headers: { user_token: "tu_token_secreto_aqui..." }
  → Configurar datos fiscales

  Estado: ✅ Emisor configurado

  ---
  PASO 5: Subir Certificado

  Igual que Flujo A - PASO 3

  POST /api1/certificado-emisor
  Headers: { user_token: "tu_token_secreto_aqui..." }
  → Subir certificado .p12

  Estado: ✅ Certificado configurado

  ---
  PASO 6: Emitir Factura con Cliente del Sistema

  Endpoint: POST /api1/documentos

  // Request
  POST http://localhost/api1/documentos
  Headers: {
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_token": "tu_token_secreto_aqui_cambiar_en_produccion",
    "Content-Type": "application/json"
  }
  Body: {
    "tipoDocumento": 1,
    "establecimiento": "001",
    "punto": "001",
    "numero": 10,
    "codigoSeguridadAleatorio": "657678",
    "descripcion": "Factura electrónica",
    "observacion": "",
    "fecha": "2025-08-14T10:57:26",
    "tipoEmision": 1,
    "tipoTransaccion": 2,
    "tipoImpuesto": 1,
    "moneda": "PYG",
    "condicionAnticipo": 0,
    "condicionTipoCambio": 0,
    "descuentoGlobal": 0,
    "anticipoGlobal": 0,
    "cambio": "",
    "factura": {
      "presencia": 1,
      "fecha": "2025-08-14T10:57:26"
    },
    // ✅ Cliente obtenido del sistema (Paso 3)
    "cliente": {
      "contribuyente": true,
      "razonSocial": "Juan Carlos Pérez",
      "tipoOperacion": 1,
      "tipoContribuyente": 1,  // 1=Persona física
      "direccion": "Avda. España 1234, Asunción",
      "numeroCasa": "0",
      "departamento": 11,
      "departamentoDescripcion": "ALTO PARANA",
      "distrito": 145,
      "distritoDescripcion": "CIUDAD DEL ESTE",
      "ciudad": 3432,
      "ciudadDescripcion": "CIUDAD DEL ESTE (MUNIC)",
      "pais": "PRY",
      "paisDescripcion": "Paraguay",
      "telefono": "595981123456",
      "celular": "595981123456",
      "email": "juan.perez@example.com",
      "codigo": "026",
      "ruc": "",
      "documentoTipo": 1,
      "documentoNumero": "12345678"  // CI del cliente
    },
    "usuario": {
      "documentoTipo": 1,
      "documentoNumero": "1",
      "nombre": "testuser",
      "cargo": "Vendedor"
    },
    "condicion": {
      "tipo": 1,
      "entregas": [
        {
          "tipo": 1,
          "monto": 100000,
          "moneda": "PYG",
          "cambio": 0
        }
      ]
    },
    "items": [
      {
        "codigo": "15253621",
        "descripcion": "Servicios profesionales",
        "observacion": "",
        "unidadMedida": 77,
        "cantidad": 1,
        "precioUnitario": 100000,
        "cambio": 0,
        "descuento": 0,
        "anticipo": 0,
        "pais": "PRY",
        "paisDescripcion": "Paraguay",
        "ivaTipo": 1,
        "ivaBase": 100,
        "iva": 10
      }
    ]
  }

  // Response
  {
    "success": true,
    "message": "Factura emitida correctamente",
    "documento": {
      "id": 123,
      "numeroDocumento": "001-001-0000010",
      "cdc": "01029921414001001000001012025...",
      "estado": "aprobado",
      "xmlConQR": "<?xml version='1.0'?>..."
    }
  }

  Estado: ✅ FACTURA EMITIDA CON CLIENTE DEL SISTEMA

  ---
  📊 COMPARACIÓN DE FLUJOS

  | Aspecto               | Sin Empresa      | Con Empresa                  |
  |-----------------------|------------------|------------------------------|
  | Pasos totales         | 4                | 6                            |
  | Gestión de clientes   | ❌ Manual         | ✅ Automatizada               |
  | Tokens necesarios     | JWT + user_token | JWT + user_token + api_token |
  | Búsqueda de clientes  | ❌ No disponible  | ✅ Sí                         |
  | Historial de clientes | ❌ No             | ✅ Sí                         |
  | Recomendado para      | Pruebas rápidas  | Producción                   |

  ---
  🔑 RESUMEN DE TOKENS

  // FLUJO A (Sin Empresa)
  const tokens = {
    jwt_token: "eyJhbGci...",  // Login
    user_token: "tu_token_secreto_aqui..."  // Fijo en .env
  }

  // FLUJO B (Con Empresa)
  const tokens = {
    jwt_token: "eyJhbGci...",  // Login
    user_token: "tu_token_secreto_aqui...",  // Fijo en .env
    api_token: "empresa_token_abc123..."  // Al crear empresa
  }
