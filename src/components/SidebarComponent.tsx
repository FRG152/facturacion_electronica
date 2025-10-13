import {
  Home,
  Users,
  LogOut,
  Package,
  FileText,
  Settings,
  PlusCircle,
  Building2,
  FileKey,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarItem,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
} from "./ui/sidebar";
import { logoutUser } from "../store/slices/authSlice";
import { sidebarItems } from "../constants/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { EmpresaSelector } from "./EmpresaSelector";

const iconMap = {
  Home,
  FileText,
  Users,
  Settings,
  PlusCircle,
  Package,
  Building2,
  FileKey,
  Search,
};

const SidebarComponent = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="font-semibold">Facturación</span>
        </div>
      </SidebarHeader>

      {/* Selector de empresa activa */}
      <div className="border-b pb-3 mb-3">
        <EmpresaSelector />
      </div>

      <SidebarContent className="p-0">
        <SidebarGroup>
          {sidebarItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isActive = location.pathname === item.url;

            return (
              <Link key={item.url} to={item.url}>
                <SidebarItem
                  active={isActive}
                  className="mb-2"
                  icon={<IconComponent size={50} />}
                >
                  {item.title}
                </SidebarItem>
              </Link>
            );
          })}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarItem className="sidebar_user">
          {user?.username || user?.email || "Usuario"}
        </SidebarItem>
        <div>
          <SidebarItem
            onClick={handleLogout}
            icon={<LogOut size={50} />}
            className="sidebar_btn_logout"
          >
            Cerrar Sesión
          </SidebarItem>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default SidebarComponent;