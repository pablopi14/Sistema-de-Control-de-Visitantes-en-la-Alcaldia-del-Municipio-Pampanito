import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import apiService from "@/services/api";
import { Attendance } from "@/models/dbModels";

interface EditAttendanceDialogProps {
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess: () => void;
}

const EditAttendanceDialog = ({
  attendance,
  open,
  onOpenChange,
  onUpdateSuccess
}: EditAttendanceDialogProps) => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    edad: "",
    cedula: "",
    telefono: "",
    correo: "",
    motivo_visita: "",
    departamento: "",
    hora_entrada: "",
    hora_salida: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Actualizar formulario cuando cambie la asistencia
  useEffect(() => {
    if (attendance) {
      console.log("Cargando datos para edición:", attendance);
      setFormData({
        nombres: attendance.nombres || "",
        apellidos: attendance.apellidos || "",
        edad: attendance.edad?.toString() || "",
        cedula: attendance.cedula || "",
        telefono: attendance.telefono || "",
        correo: attendance.correo || "",
        motivo_visita: attendance.motivo_visita || "",
        departamento: attendance.departamento || "",
        hora_entrada: attendance.hora_entrada || "",
        hora_salida: attendance.hora_salida || ""
      });
    }
  }, [attendance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombres || !formData.apellidos || !formData.cedula) {
      toast.error("Nombres, apellidos y cédula son obligatorios");
      return;
    }

    if (!attendance) {
      toast.error("No se encontró el registro de asistencia");
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {
        ...formData,
        edad: formData.edad ? parseInt(formData.edad) : null
      };

      console.log(
        "Actualizando asistencia con ID:",
        attendance.id,
        "Datos:",
        updateData
      );

      await apiService.attendance.updateAttendance(attendance.id, updateData);

      toast.success("Asistencia actualizada correctamente");
      onOpenChange(false);
      onUpdateSuccess();
    } catch (error) {
      console.error("Error al actualizar asistencia:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Editar Asistencia</DialogTitle>
          <DialogDescription>
            Modifica los datos de la asistencia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-nombres'>Nombres</Label>
              <Input
                id='edit-nombres'
                value={formData.nombres}
                onChange={(e) => handleInputChange("nombres", e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-apellidos'>Apellidos</Label>
              <Input
                id='edit-apellidos'
                value={formData.apellidos}
                onChange={(e) => handleInputChange("apellidos", e.target.value)}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-edad'>Edad</Label>
              <Input
                id='edit-edad'
                type='number'
                value={formData.edad}
                onChange={(e) => handleInputChange("edad", e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-cedula'>Cédula / Documento</Label>
              <Input
                id='edit-cedula'
                value={formData.cedula}
                onChange={(e) => handleInputChange("cedula", e.target.value)}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-telefono'>Teléfono</Label>
              <Input
                id='edit-telefono'
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-correo'>Correo Electrónico</Label>
              <Input
                id='edit-correo'
                type='email'
                value={formData.correo}
                onChange={(e) => handleInputChange("correo", e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-motivo'>Motivo de Visita</Label>
            <Textarea
              id='edit-motivo'
              value={formData.motivo_visita}
              onChange={(e) =>
                handleInputChange("motivo_visita", e.target.value)
              }
              className='resize-none'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='departamento'>Departamento</Label>
              <select
                id='departamento'
                name='departamento'
                className='border rounded px-3 py-2 w-full'
                value={formData.departamento}
                onChange={(e) =>
                  handleInputChange("departamento", e.target.value)
                }
                required
              >
                <option value=''>Seleccione departamento</option>
                <option value='Informática'>Informática</option>
                <option value='Bienes Muebles'>Bienes Muebles</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-hora-entrada'>Hora de Entrada</Label>
              <Input
                id='edit-hora-entrada'
                type='time'
                value={formData.hora_entrada}
                onChange={(e) =>
                  handleInputChange("hora_entrada", e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-hora-salida'>Hora de Salida</Label>
              <Input
                id='edit-hora-salida'
                type='time'
                value={formData.hora_salida}
                onChange={(e) =>
                  handleInputChange("hora_salida", e.target.value)
                }
              />
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Actualizando...
                </>
              ) : (
                "Actualizar Asistencia"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAttendanceDialog;
