import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de gestión de asistencias
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/cambiar-contrasena">
            <Button variant="outline">Cambiar Contraseña</Button>
          </Link>
          <Button 
            variant="destructive"
            onClick={() => logout()}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Asistencias</CardTitle>
            <CardDescription>Gestionar registros de asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Registre y consulte la asistencia de los visitantes.
            </p>
            <Link to="/asistencias">
              <Button variant="outline" className="w-full">
                Acceder
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Administración de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Gestione el personal que forma parte de la comunidad.
            </p>
            <Link to="/personal">
              <Button variant="outline" className="w-full">
                Acceder
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Reportes</CardTitle>
            <CardDescription>Estadísticas y análisis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Genere informes y estadísticas sobre la asistencia de los miembros.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Próximamente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;