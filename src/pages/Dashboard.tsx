import { StockAlerts } from "../components/StockAlerts";
import { FileText, Users, BarChart3 } from "lucide-react";

export function Dashboard() {
  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Panel principal de facturación electrónica
        </p>
      </div>

      {/* Stock Alerts Section */}
      <div className="mt-8">
        <StockAlerts />
      </div>

      {/* Main Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6 bg-white hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Facturas</h3>
          </div>
          <p className="text-secondary">
            Gestiona tus facturas electrónicas
          </p>
        </div>
        
        <div className="rounded-lg border p-6 bg-white hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Clientes</h3>
          </div>
          <p className="text-secondary">
            Administra tu base de clientes
          </p>
        </div>
        
        <div className="rounded-lg border p-6 bg-white hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Reportes</h3>
          </div>
          <p className="text-secondary">
            Visualiza estadísticas y reportes
          </p>
        </div>
      </div>
    </div>
  );
}
