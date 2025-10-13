export interface SidebarItem {
  url: string;
  title: string;
  icon: string;
}

export const sidebarItems: SidebarItem[] = [
  {
    url: "/generar_factura",
    title: "Generar Factura",
    icon: "PlusCircle",
  },
  {
    url: "/facturas",
    title: "Facturas",
    icon: "FileText",
  },
  {
    url: "/consultas",
    title: "Consultas y Cancelaciones",
    icon: "Search",
  },
  {
    url: "/productos",
    title: "Productos",
    icon: "Package",
  },
  {
    url: "/clientes",
    title: "Clientes",
    icon: "Users",
  },
  {
    url: "/empresas",
    title: "Empresas",
    icon: "Building2",
  },
  {
    url: "/configurar-emisor",
    title: "Configurar Emisor",
    icon: "FileKey",
  },
  {
    url: "/configuracion",
    title: "Configuración",
    icon: "Settings",
  },
];
