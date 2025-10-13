# Endpoints para Gestión de Documentos

## Listar Documentos con Filtros

### GET `/generar-documento/listar`

Permite listar documentos con filtros opcionales y paginación.

#### Parámetros de Query (opcionales):

- **estado**: Filtra por estado del documento
  - Valores válidos: `PENDIENTE`, `ENVIADO`, `APROBADO`, `RECHAZADO`
- **numeroDocumento**: Filtra por número de documento
- **cdc**: Filtra por código de control (CDC)
- **page**: Número de página (por defecto: 1)
- **limit**: Cantidad de documentos por página (por defecto: 10)
- **sortBy**: Campo para ordenar (por defecto: `fechaCreacion`)
- **sortOrder**: Orden ascendente o descendente (por defecto: `DESC`)

#### Ejemplos de uso:

```bash
# Listar todos los documentos (página 1, 10 por página)
GET /generar-documento/listar

# Filtrar por estado
GET /generar-documento/listar?estado=PENDIENTE

# Filtrar por estado y paginación
GET /generar-documento/listar?estado=APROBADO&page=2&limit=20

# Buscar por número de documento
GET /generar-documento/listar?numeroDocumento=DOC-123

# Buscar por CDC
GET /generar-documento/listar?cdc=ABC123

# Ordenar por fecha de creación ascendente
GET /generar-documento/listar?sortOrder=ASC

# Combinar múltiples filtros
GET /generar-documento/listar?estado=ENVIADO&page=1&limit=15&sortBy=fechaCreacion&sortOrder=DESC
```

#### Respuesta:

```json
{
  "documentos": [
    {
      "id": 1,
      "numeroDocumento": "DOC-123",
      "estado": "APROBADO",
      "cdc": "ABC123",
      "fechaCreacion": "2024-01-15T10:30:00.000Z",
      "fechaActualizacion": "2024-01-15T10:35:00.000Z",
      "lote": {
        "id": 1,
        "numeroLote": "LOTE-001",
        "estado": "APROBADO"
      }
    }
  ],
  "paginacion": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Obtener Estados Disponibles

### GET `/generar-documento/estados`

Retorna la lista de estados disponibles para los documentos.

#### Respuesta:

```json
{
  "estados": [
    {
      "valor": "PENDIENTE",
      "descripcion": "Documento pendiente de envío"
    },
    {
      "valor": "ENVIADO",
      "descripcion": "Documento enviado a la SET"
    },
    {
      "valor": "APROBADO",
      "descripcion": "Documento aprobado por la SET"
    },
    {
      "valor": "RECHAZADO",
      "descripcion": "Documento rechazado por la SET"
    }
  ]
}
```

## Endpoints Existentes

### GET `/generar-documento/estadisticas`
Obtiene estadísticas generales de documentos y lotes.

### GET `/generar-documento/documento/:id`
Obtiene un documento específico por su ID.

### GET `/generar-documento/lote/:numeroLote`
Obtiene un lote específico por su número.

## Casos de Uso Comunes

1. **Dashboard de Usuario**: Usar `/listar` con paginación para mostrar documentos del usuario
2. **Filtrado por Estado**: Filtrar documentos pendientes, aprobados o rechazados
3. **Búsqueda Específica**: Buscar documentos por número o CDC
4. **Monitoreo de Lotes**: Ver documentos agrupados por lotes
5. **Auditoría**: Revisar historial de documentos con ordenamiento por fecha

## Notas de Implementación

- Los filtros son opcionales y se pueden combinar
- La paginación es automática y respeta los límites establecidos
- El ordenamiento por defecto es por fecha de creación descendente (más recientes primero)
- Se incluyen las relaciones con lotes para información completa
- Todos los endpoints retornan respuestas estructuradas con manejo de errores
