
import React from "react";
import { Eye } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Attendance } from "@/models/dbModels";

interface ViewAttendanceDialogProps {
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewAttendanceDialog = ({ attendance, open, onOpenChange }: ViewAttendanceDialogProps) => {
  if (!attendance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de Asistencia</DialogTitle>
          <DialogDescription>
            Información completa del registro de asistencia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Nombres</Label>
              <p className="text-sm text-muted-foreground">{attendance.nombres}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Apellidos</Label>
              <p className="text-sm text-muted-foreground">{attendance.apellidos}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Edad</Label>
              <p className="text-sm text-muted-foreground">{attendance.edad || "No especificada"}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Cédula / Documento</Label>
              <p className="text-sm text-muted-foreground">{attendance.cedula}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Teléfono</Label>
              <p className="text-sm text-muted-foreground">{attendance.telefono || "No especificado"}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Correo Electrónico</Label>
              <p className="text-sm text-muted-foreground">{attendance.correo || "No especificado"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Motivo de Visita</Label>
            <p className="text-sm text-muted-foreground">{attendance.motivo_visita || "No especificado"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Hora de Entrada</Label>
              <p className="text-sm text-muted-foreground">
                {attendance.hora_entrada ? attendance.hora_entrada.slice(0, 5) : "No registrada"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Hora de Salida</Label>
              <p className="text-sm text-muted-foreground">
                {attendance.hora_salida ? attendance.hora_salida.slice(0, 5) : "No registrada"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Fecha de Registro</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(attendance.createdAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAttendanceDialog;
