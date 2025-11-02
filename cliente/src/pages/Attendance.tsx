import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import apiService from "@/services/api";
import EditAttendanceDialog from "@/components/EditAttendanceDialog";
import ViewAttendanceDialog from "@/components/ViewAttendanceDialog";
import { Attendance } from "@/models/dbModels";

const AttendancePage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null
  );
  const [viewingAttendance, setViewingAttendance] = useState<Attendance | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(false);
  const [creatingAttendance, setCreatingAttendance] = useState(false);
  const [deletingAttendance, setDeletingAttendance] = useState<number | null>(
    null
  );
  const [mobileView, setMobileView] = useState<"list" | "form">("list");
  const isMobile = useIsMobile();

  // Función para cargar las asistencias por fecha
  const loadAttendances = async (date: Date) => {
    setLoadingAttendances(true);
    try {
      // Formatear la fecha correctamente (YYYY-MM-DD)
      const formattedDate = format(date, "yyyy-MM-dd");
      console.log("Cargando asistencias para la fecha:", formattedDate);

      const data = await apiService.attendance.getAttendancesByDateRange(
        formattedDate,
        formattedDate
      );
      console.log("Asistencias cargadas:", data);
      setAttendances(data || []);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
      setAttendances([]);
    } finally {
      setLoadingAttendances(false);
    }
  };

  // Cargar asistencias cuando cambia la fecha
  useEffect(() => {
    loadAttendances(selectedDate);
  }, [selectedDate]);

  // Función para manejar el registro de asistencia
  const handleAttendanceSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setCreatingAttendance(true);

    const formData = new FormData(e.currentTarget);

    const nombres = formData.get("nombres") as string;
    const apellidos = formData.get("apellidos") as string;
    const cedula = formData.get("cedula") as string;

    if (!nombres || !apellidos || !cedula) {
      toast.error("Nombres, apellidos y cédula son obligatorios");
      setCreatingAttendance(false);
      return;
    }

    try {
      // Obtener el resto de los datos del formulario
      const edad = formData.get("edad")
        ? parseInt(formData.get("edad") as string)
        : null;
      const telefono = formData.get("telefono") as string;
      const correo = formData.get("correo") as string;
      const motivo_visita = formData.get("motivo_visita") as string;
      const departamento = formData.get("departamento") as string;
      const hora_entrada = (formData.get("hora_entrada") as string) || null;
      const hora_salida = (formData.get("hora_salida") as string) || null;

      console.log("Creando asistencia con datos:", {
        nombres,
        apellidos,
        edad,
        cedula,
        telefono,
        correo,
        motivo_visita,
        departamento,
        hora_entrada,
        hora_salida
      });

      await apiService.attendance.createAttendance({
        nombres,
        apellidos,
        edad,
        cedula,
        telefono,
        correo,
        motivo_visita,
        departamento,
        hora_entrada,
        hora_salida
      });

      toast.success("Asistencia registrada correctamente");

      // Limpiar el formulario
      const form = document.getElementById(
        "attendance-form"
      ) as HTMLFormElement;
      if (form) form.reset();

      // Recargar las asistencias
      loadAttendances(selectedDate);
    } catch (error) {
      console.error("Error al crear asistencia:", error);
    } finally {
      setCreatingAttendance(false);
    }
  };

  // Función para abrir el diálogo de edición
  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setEditDialogOpen(true);
  };

  // Función para abrir el diálogo de visualización
  const handleViewAttendance = (attendance: Attendance) => {
    setViewingAttendance(attendance);
    setViewDialogOpen(true);
  };

  // Función para manejar la actualización exitosa
  const handleUpdateSuccess = () => {
    loadAttendances(selectedDate);
  };

  // Función para eliminar asistencia
  const handleDeleteAttendance = async (id: number) => {
    setDeletingAttendance(id);
    try {
      await apiService.attendance.deleteAttendance(id);
      toast.success("Asistencia eliminada correctamente");
      loadAttendances(selectedDate);
    } catch (error) {
      console.error("Error al eliminar asistencia:", error);
    } finally {
      setDeletingAttendance(null);
    }
  };

  // Formatear fecha para mostrar
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es
  });

  return (
    // <AppLayout>
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h1 className='text-2xl font-bold'>Control de Asistencias</h1>

        {/* Selector de fecha */}
        <div className='flex items-center space-x-2'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {formattedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0 pointer-events-auto'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className='pointer-events-auto'
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Botones de alternancia para móvil */}
      {isMobile && (
        <div className='flex gap-2 mb-4'>
          <Button
            variant={mobileView === "list" ? "default" : "outline"}
            size='sm'
            onClick={() => setMobileView("list")}
            className='flex-1'
          >
            <Users className='mr-2 h-4 w-4' />
            Lista de Asistencias
          </Button>
          <Button
            variant={mobileView === "form" ? "default" : "outline"}
            size='sm'
            onClick={() => setMobileView("form")}
            className='flex-1'
          >
            <FileText className='mr-2 h-4 w-4' />
            Registrar
          </Button>
        </div>
      )}

      <div
        className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
        )}
      >
        {/* Formulario de registro de asistencia */}
        <Card
          className={cn(
            "lg:col-span-1",
            isMobile && mobileView === "list" && "hidden"
          )}
        >
          <CardHeader>
            <CardTitle>Registrar Asistencia</CardTitle>
            <CardDescription>
              Complete el formulario para registrar una asistencia para la
              fecha: {format(selectedDate, "dd/MM/yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id='attendance-form'
              onSubmit={handleAttendanceSubmit}
              className='space-y-4'
            >
              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='nombres'>Nombres</Label>
                <Input
                  id='nombres'
                  name='nombres'
                  placeholder='Nombres del visitante'
                  required
                />
              </div>

              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='apellidos'>Apellidos</Label>
                <Input
                  id='apellidos'
                  name='apellidos'
                  placeholder='Apellidos del visitante'
                  required
                />
              </div>

              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='edad'>Edad</Label>
                <Input id='edad' name='edad' type='number' placeholder='Edad' />
              </div>

              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='cedula'>Cédula / Documento</Label>
                <Input
                  id='cedula'
                  name='cedula'
                  placeholder='Número de documento'
                  required
                />
              </div>

              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='telefono'>Teléfono</Label>
                <Input
                  id='telefono'
                  name='telefono'
                  placeholder='Número de teléfono'
                />
              </div>

              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='correo'>Correo Electrónico</Label>
                <Input
                  id='correo'
                  name='correo'
                  type='email'
                  placeholder='Correo electrónico'
                />
              </div>

              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='motivo_visita'>Motivo de Visita</Label>
                <Textarea
                  id='motivo_visita'
                  name='motivo_visita'
                  placeholder='Motivo de la visita'
                  className='resize-none'
                  rows={3}
                />
              </div>

              <div className='space-y-2 flex flex-col items-start'>
                <Label htmlFor='departamento'>Departamento</Label>
                <select
                  id='departamento'
                  name='departamento'
                  className='border rounded px-3 py-2 w-full'
                  required
                >
                  <option value=''>Seleccione departamento</option>
                  <option value='servicios-publicos'>Servicios públicos</option>
                  <option value='catastro'>Catastro</option>
                  <option value='renta-y-licores'>Renta y licores</option>
                  <option value='tesoreria'>Tesorería</option>
                  <option value='presupuesto'>Presupuesto</option>
                  <option value='compras'>Compras</option>
                  <option value='contabilidad'>Contabilidad</option>
                  <option value='salud-y-bienestar-social'>
                    Salud y bienestar social
                  </option>
                  <option value='personal-y-transporte'>
                    Personal y transporte
                  </option>
                  <option value='informatica'>Informática</option>
                  <option value='tierra'>Tierra</option>
                </select>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div className='space-y-2'>
                  <Label htmlFor='hora_entrada'>Hora de Entrada</Label>
                  <Input id='hora_entrada' name='hora_entrada' type='time' />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='hora_salida'>Hora de Salida</Label>
                  <Input id='hora_salida' name='hora_salida' type='time' />
                </div>
              </div>

              <Button
                type='submit'
                className='w-full'
                disabled={creatingAttendance}
              >
                {creatingAttendance ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
        <Card
          className={cn(
            "lg:col-span-2",
            isMobile && mobileView === "form" && "hidden"
          )}
        >
          <CardHeader>
            <CardTitle>Asistencias del día</CardTitle>
            <CardDescription>
              Mostrando registros para: {formattedDate} ({attendances.length}{" "}
              registros)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAttendances ? (
              <div className='flex flex-col items-center justify-center p-8'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='mt-2 text-sm text-muted-foreground'>
                  Cargando asistencias...
                </p>
              </div>
            ) : attendances && attendances.length > 0 ? (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombres</TableHead>
                      <TableHead>Apellidos</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Hora Entrada
                      </TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Hora Salida
                      </TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((attendance: Attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell className='font-medium'>
                          {attendance.nombres}
                        </TableCell>
                        <TableCell>{attendance.apellidos}</TableCell>
                        <TableCell>{attendance.cedula}</TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {attendance.hora_entrada
                            ? attendance.hora_entrada.slice(0, 5)
                            : "N/A"}
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {attendance.hora_salida
                            ? attendance.hora_salida.slice(0, 5)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleViewAttendance(attendance)}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleEditAttendance(attendance)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant='outline' size='sm'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Eliminar asistencia?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se
                                    eliminará permanentemente el registro de
                                    asistencia de {attendance.nombres}{" "}
                                    {attendance.apellidos}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteAttendance(attendance.id)
                                    }
                                    disabled={
                                      deletingAttendance === attendance.id
                                    }
                                  >
                                    {deletingAttendance === attendance.id ? (
                                      <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Eliminando...
                                      </>
                                    ) : (
                                      "Eliminar"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center p-8 border border-dashed rounded-lg'>
                <p className='text-muted-foreground'>
                  No hay registros de asistencia para esta fecha
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de edición */}
      <EditAttendanceDialog
        attendance={editingAttendance}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingAttendance(null);
          }
        }}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Diálogo de visualización */}
      <ViewAttendanceDialog
        attendance={viewingAttendance}
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            setViewingAttendance(null);
          }
        }}
      />
    </div>
    // </AppLayout>
  );
};

export default AttendancePage;
