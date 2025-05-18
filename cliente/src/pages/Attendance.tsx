
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import apiService from "@/services/api";
import AppLayout from "@/components/AppLayout";

const AttendancePage = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Obtener las asistencias por fecha
  const { 
    data: attendances, 
    isLoading: loadingAttendances 
  } = useQuery({
    queryKey: ["attendances", format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => apiService.attendance.getAttendancesByDateRange(
      format(selectedDate, "yyyy-MM-dd"),
      format(selectedDate, "yyyy-MM-dd")
    ),
  });

  // Mutación para crear asistencia
  const createAttendanceMutation = useMutation({
    mutationFn: (data: any) => 
      apiService.attendance.createAttendance(data),
    onSuccess: () => {
      toast.success("Asistencia registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      
      // Limpiar el formulario
      const form = document.getElementById("attendance-form") as HTMLFormElement;
      if (form) form.reset();
    },
  });

  // Función para manejar el registro de asistencia
  const handleAttendanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const nombres = formData.get("nombres") as string;
    const apellidos = formData.get("apellidos") as string;
    const cedula = formData.get("cedula") as string;
    
    if (!nombres || !apellidos || !cedula) {
      toast.error("Nombres, apellidos y cédula son obligatorios");
      return;
    }
    
    // Obtener el resto de los datos del formulario
    const edad = formData.get("edad") ? parseInt(formData.get("edad") as string) : null;
    const telefono = formData.get("telefono") as string;
    const correo = formData.get("correo") as string;
    const motivo_visita = formData.get("motivo_visita") as string;
    const hora_entrada = formData.get("hora_entrada") as string || null;
    const hora_salida = formData.get("hora_salida") as string || null;
    
    createAttendanceMutation.mutate({
      nombres,
      apellidos,
      edad,
      cedula,
      telefono,
      correo,
      motivo_visita,
      hora_entrada,
      hora_salida
    });
  };

  // Formatear fecha para mostrar
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Control de Asistencias</h1>
          
          {/* Selector de fecha */}
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formattedDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de registro de asistencia */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Registrar Asistencia</CardTitle>
              <CardDescription>
                Complete el formulario para registrar una asistencia para la fecha: {format(selectedDate, "dd/MM/yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="attendance-form" onSubmit={handleAttendanceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input 
                    id="nombres"
                    name="nombres" 
                    placeholder="Nombres del visitante"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input 
                    id="apellidos"
                    name="apellidos" 
                    placeholder="Apellidos del visitante"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad">Edad</Label>
                  <Input 
                    id="edad"
                    name="edad" 
                    type="number"
                    placeholder="Edad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula / Documento</Label>
                  <Input 
                    id="cedula"
                    name="cedula" 
                    placeholder="Número de documento"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono"
                    name="telefono" 
                    placeholder="Número de teléfono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input 
                    id="correo"
                    name="correo" 
                    type="email"
                    placeholder="Correo electrónico"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo_visita">Motivo de Visita</Label>
                  <Textarea 
                    id="motivo_visita"
                    name="motivo_visita" 
                    placeholder="Motivo de la visita"
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="hora_entrada">Hora de Entrada</Label>
                    <Input 
                      id="hora_entrada"
                      name="hora_entrada" 
                      type="time"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora_salida">Hora de Salida</Label>
                    <Input 
                      id="hora_salida"
                      name="hora_salida" 
                      type="time"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createAttendanceMutation.isPending}
                >
                  {createAttendanceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Asistencia"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de asistencias */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Asistencias del día</CardTitle>
              <CardDescription>
                Mostrando registros para: {formattedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAttendances ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Cargando asistencias...</p>
                </div>
              ) : attendances?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombres</TableHead>
                        <TableHead>Apellidos</TableHead>
                        <TableHead>Cédula</TableHead>
                        <TableHead className="hidden md:table-cell">Hora Entrada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendances?.map((attendance: any) => (
                        <TableRow key={attendance.id}>
                          <TableCell className="font-medium">
                            {attendance.nombres}
                          </TableCell>
                          <TableCell>
                            {attendance.apellidos}
                          </TableCell>
                          <TableCell>{attendance.cedula}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {attendance.hora_entrada ? attendance.hora_entrada.slice(0, 5) : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">No hay registros de asistencia para esta fecha</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendancePage;
