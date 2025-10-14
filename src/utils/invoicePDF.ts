export const invoicePDF = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: Arial, sans-serif; 
            font-size: 10px; 
            line-height: 1.3;
            color: #333;
        }
        
        .container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10px;
        }
        
        .status-badge {
            background-color: #c0392b;
            color: white;
            padding: 8px;
            text-align: center;
            margin-bottom: 10px;
            font-weight: bold;
            font-size: 10px;
        }
        
        .document-title {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 12px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .main-header { 
            border: 2px solid #34495e; 
            padding: 10px;
            margin-bottom: 8px;
            background-color: #f8f9fa;
        }
        
        .main-header table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .main-header td {
            vertical-align: top;
            padding: 4px;
        }
        
        .header-left {
            width: 58%;
        }
        
        .header-right {
            width: 42%;
            background-color: #ecf0f1;
            padding: 8px;
            border-left: 3px solid #5a6c7d;
            text-align: right;
        }
        
        .company-activity {
            font-size: 8px;
            color: #666;
            font-style: italic;
            margin-bottom: 6px;
        }
        
        .invoice-number {
            background-color: #5a6c7d;
            color: white;
            padding: 8px;
            margin-top: 8px;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
        }
        
        .info-section { 
            border: 2px solid #34495e; 
            padding: 10px;
            margin-bottom: 8px;
            background-color: #fdfdfd;
        }
        
        .info-section table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .info-section td {
            vertical-align: top;
            padding: 4px;
            width: 50%;
        }
        
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #5a6c7d;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }
        
        .items-table { 
            width: 100%; 
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        
        .items-table th { 
            background-color: #34495e;
            color: white;
            border: 1px solid #2c3e50;
            padding: 8px 4px; 
            text-align: center; 
            font-weight: bold;
            font-size: 9px;
        }
        
        .items-table td { 
            border: 1px solid #bdc3c7; 
            padding: 6px 4px; 
            text-align: center;
            font-size: 9px;
        }
        
        .items-table tbody tr:nth-child(odd) {
            background-color: #f8f9fa;
        }
        
        .desc-col { 
            text-align: left !important; 
        }
        
        .num-col { 
            text-align: right !important; 
            font-family: monospace;
            padding-right: 6px !important;
        }
        
        .totals-row { 
            background-color: #ecf0f1 !important;
            font-weight: bold; 
        }
        
        .final-total {
            background-color: #5a6c7d !important;
            color: white !important;
            font-weight: bold;
        }
        
        .tax-summary {
            background-color: #95a5a6;
            color: white;
            padding: 10px; 
            margin: 8px 0;
            text-align: right;
            font-size: 10px;
            font-weight: bold;
        }
        
        .footer-section { 
            border: 2px solid #34495e; 
            padding: 10px;
            margin-top: 10px;
            background-color: #f8f9fa;
        }
        
        .footer-section table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .footer-section td {
            vertical-align: top;
        }
        
        .qr-section {
            width: 25%;
            text-align: center;
            padding-right: 10px;
        }
        
        .qr-enhanced {
            border: 2px solid #5a6c7d;
            padding: 8px;
            background-color: white;
            display: inline-block;
        }
        
        .qr-placeholder {
            width: 100px;
            height: 100px;
            background-color: #ecf0f1;
            border: 2px solid #5a6c7d;
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
        }
        
        .verification-section {
            width: 75%;
            padding-left: 10px;
        }
        
        .highlight-box {
            background-color: #e8f4f8;
            border-left: 3px solid #5a6c7d;
            padding: 8px;
            margin: 8px 0;
        }
        
        .verification-url {
            color: #5a6c7d;
            font-weight: bold;
            font-size: 10px;
        }
        
        .cdc-display { 
            font-size: 9px; 
            font-weight: bold; 
            text-align: center; 
            margin: 10px 0; 
            letter-spacing: 0.5px;
            padding: 8px;
            background-color: #ecf0f1;
            font-family: monospace;
            word-wrap: break-word;
        }
        
        .legal-footer { 
            font-size: 8px; 
            text-align: center; 
            margin-top: 10px;
            line-height: 1.3;
            background-color: #2c3e50;
            color: white;
            padding: 10px;
        }
        
        .text-bold {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-badge">
            KuDE de FACTURA ELECTRONICA
        </div>
        
        <div class="document-title" id="emisor-nombre">
            EMPRESA EJEMPLO S.A.
        </div>
        
        <div class="main-header">
            <table>
                <tr>
                    <td class="header-left">
                        <div class="company-activity" id="emisor-actividad">Actividad Comercial</div>
                        <strong>Dirección:</strong> <span id="emisor-direccion">-</span><br>
                        <strong>Ciudad:</strong> <span id="emisor-ciudad">-</span> - <span id="emisor-departamento">-</span> - PARAGUAY<br>
                        <strong>Teléfono:</strong> <span id="emisor-telefono">-</span>
                        <strong>Correo:</strong> <span id="emisor-email">-</span>
                    </td>
                    <td class="header-right">
                        <strong>RUC:</strong> <span id="emisor-ruc">-</span><br>
                        <strong>Timbrado N°:</strong> <span id="doc-timbrado">-</span><br>
                        <strong>Inicio de vigencia:</strong> <span id="doc-vigencia">-</span><br>
                        <div class="invoice-number">
                            Factura Electrónica<br>
                            <span id="doc-numero">-</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        
        <div class="info-section">
            <table>
                <tr>
                    <td>
                        <div class="section-title">Información de Emisión</div>
                        <strong>Fecha y hora de emisión:</strong> <span id="doc-fecha">-</span><br>
                        <strong>Condición de venta:</strong> <span id="doc-condicion">-</span><br>
                        <strong>Moneda:</strong> <span id="doc-moneda">-</span>
                        <span id="doc-tipo-cambio-container"></span>
                    </td>
                    <td>
                        <div class="section-title">Datos del Cliente</div>
                        <strong>Nombre o Razón Social:</strong> <span id="cliente-nombre">-</span><br>
                        <strong>RUC/Documento de identidad N°:</strong> <span id="cliente-ruc">-</span><br>
                        <span id="cliente-email-container"></span>
                        <span id="cliente-direccion-container"></span>
                        <span id="cliente-telefono-container"></span>
                        <span id="cliente-codigo-container"></span>
                    </td>
                </tr>
            </table>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 10%;">Código</th>
                    <th style="width: 25%;">Descripción</th>
                    <th style="width: 8%;">Cantidad</th>
                    <th style="width: 12%;">Precio</th>
                    <th style="width: 12%;">Exentas</th>
                    <th style="width: 12%;">5%</th>
                    <th style="width: 15%;">10%</th>
                </tr>
            </thead>
            <tbody id="items-body">
                <!-- Items se insertan aquí -->
            </tbody>
        </table>
        
        <div class="tax-summary" id="tax-summary">
            Liquidación Iva: (5%) 0 &nbsp;&nbsp; (10%) 0 &nbsp;&nbsp; <strong>Total Iva: 0</strong>
        </div>
        
        <div class="footer-section">
            <table>
                <tr>
                    <td class="qr-section">
                        <div class="qr-enhanced">
                            <div class="qr-placeholder">
                                QR<br>CODE
                            </div>
                        </div>
                    </td>
                    <td class="verification-section">
                        <div class="highlight-box">
                            <strong>Consulte esta Factura Electrónica con el número impreso abajo:</strong><br>
                            <span class="verification-url">https://ekuatia.set.gov.py/consultas/</span>
                        </div>
                        
                        <div class="cdc-display" id="doc-cdc">
                            -
                        </div>
                        
                        <div style="text-align: center; font-weight: bold; font-size: 10px;">
                            ESTE DOCUMENTO ES UNA REPRESENTACIÓN GRÁFICA DE UN<br>
                            DOCUMENTO ELECTRÓNICO (XML)
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
</html>`;
