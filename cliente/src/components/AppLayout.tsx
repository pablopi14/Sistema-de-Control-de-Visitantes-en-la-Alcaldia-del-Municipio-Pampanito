import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarCheck,
  LogOut,
  Settings,
  Menu,
  X,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Cerrar la barra lateral en dispositivos móviles al cambiar de página
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const menuItems = [
    {
      name: "Panel Principal",
      path: "/",
      icon: <LayoutDashboard className='h-5 w-5' />
    },
    {
      name: "Asistencias",
      path: "/asistencias",
      icon: <CalendarCheck className='h-5 w-5' />
    },
    {
      name: "Personal",
      path: "/personal",
      icon: <Users className='h-5 w-5' />
    }
  ];

  return (
    <div className='min-h-screen bg-background-1'>
      {/* Barra superior móvil */}
      {isMobile && (
        <div className='fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <h1 className='font-semibold text-lg'>Sistema de Asistencias</h1>
          <div className='w-10'></div> {/* Espacio para balance */}
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r z-40 transition-transform duration-300",
          isMobile
            ? sidebarOpen
              ? "transform-none"
              : "-translate-x-full"
            : "transform-none",
          isMobile ? "pt-16" : "pt-0"
        )}
      >
        <div className='flex flex-col h-full'>
          {/* Logo y nombre (solo visible en desktop) */}
          {!isMobile && (
            <div className='h-16 flex items-center justify-center border-b'>
              <h1 className='font-bold text-xl text-primary'>
                Sistema de Asistencias
              </h1>
            </div>
          )}

          {/* Menú de navegación */}
          <nav className='flex-1 p-4'>
            <ul className='space-y-2'>
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted transition-colors",
                      location.pathname === item.path &&
                        "bg-primary text-white hover:bg-primary/90"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sección de usuario */}
          <div className='p-4 border-t'>
            <div className='mb-2'>
              <p className='font-medium'>{user?.name}</p>
              <p className='text-sm text-muted-foreground'>{user?.email}</p>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='w-full flex items-center gap-1'
                asChild
              >
                <Link to='/cambiar-contrasena'>
                  <Settings className='h-4 w-4' />
                  Cuenta
                </Link>
              </Button>
              <Button
                variant='destructive'
                size='sm'
                className='w-full flex items-center gap-1'
                onClick={handleLogout}
              >
                <LogOut className='h-4 w-4' />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main
        className={cn(
          "transition-all duration-300",
          isMobile ? "pt-16 pb-4" : "py-4",
          !isMobile && "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
};

// Función auxiliar para combinar clases condicionales
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default AppLayout;
