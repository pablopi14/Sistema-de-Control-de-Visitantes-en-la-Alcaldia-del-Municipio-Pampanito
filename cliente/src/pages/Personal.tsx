"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import apiService from "../services/api";
import type { User } from "../models/dbModels";

const Personal: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    cedula: "",
    fecha_nacimiento: "",
    lugar_nacimiento: "",
    nacionalidad: "",
    estado_civil: "",
    telefono: "",
    cargo_laboral: "",
    departamento: "",
    horario: "",
    email: "",
    password: "",
    role: "no-selected" as "admin" | "user" | "no-selected",
    security_answer_1: "",
    security_answer_2: "",
    security_answer_3: ""
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.users.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar el personal");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      (!editingUser && !formData.password)
    ) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    if (!formData.departamento) {
      toast.error("Por favor seleccione un departamento");
      return;
    }

    if (formData.role === "no-selected") {
      toast.error("Por favor seleccione un rol válido");
      return;
    }

    if (formData.role === "user" && !editingUser) {
      if (
        !formData.security_answer_1 ||
        !formData.security_answer_2 ||
        !formData.security_answer_3
      ) {
        toast.error(
          "Por favor complete todas las preguntas de seguridad para usuarios"
        );
        return;
      }
    }

    try {
      setLoading(true);

      if (editingUser) {
        const updateData: any = {
          name: formData.name,
          cedula: formData.cedula,
          fecha_nacimiento: formData.fecha_nacimiento,
          lugar_nacimiento: formData.lugar_nacimiento,
          nacionalidad: formData.nacionalidad,
          estado_civil: formData.estado_civil,
          telefono: formData.telefono,
          cargo_laboral: formData.cargo_laboral,
          departamento: formData.departamento,
          horario: formData.horario,
          email: formData.email,
          role: formData.role,
          ...(formData.password && { password: formData.password })
        };

        if (
          formData.role === "user" &&
          (formData.security_answer_1 ||
            formData.security_answer_2 ||
            formData.security_answer_3)
        ) {
          updateData.security_answer_1 = formData.security_answer_1;
          updateData.security_answer_2 = formData.security_answer_2;
          updateData.security_answer_3 = formData.security_answer_3;
        }

        await apiService.users.updateUser(editingUser.id, updateData);
        toast.success("Usuario actualizado exitosamente");
      } else {
        const createData: any = { ...formData };
        if (formData.role !== "user") {
          delete createData.security_answer_1;
          delete createData.security_answer_2;
          delete createData.security_answer_3;
        }

        await apiService.users.createUser(createData);
        toast.success("Usuario creado exitosamente");
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      cedula: user.cedula || "",
      fecha_nacimiento: user.fecha_nacimiento || "",
      lugar_nacimiento: user.lugar_nacimiento || "",
      nacionalidad: user.nacionalidad || "",
      estado_civil: user.estado_civil || "",
      telefono: user.telefono || "",
      cargo_laboral: user.cargo_laboral || "",
      departamento: user.departamento || "",
      horario: user.horario || "",
      email: user.email,
      password: "",
      role: user.role,
      security_answer_1: "",
      security_answer_2: "",
      security_answer_3: ""
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este usuario?")) {
      return;
    }

    try {
      setLoading(true);
      await apiService.users.deleteUser(userId);
      toast.success("Usuario desactivado exitosamente");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al desactivar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      cedula: "",
      fecha_nacimiento: "",
      lugar_nacimiento: "",
      nacionalidad: "",
      estado_civil: "",
      telefono: "",
      cargo_laboral: "",
      departamento: "",
      horario: "",
      email: "",
      password: "",
      role: "user",
      security_answer_1: "",
      security_answer_2: "",
      security_answer_3: ""
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
            <Users className='h-8 w-8' />
            Gestión de Personal
          </h1>
          <p className='text-muted-foreground mt-1'>
            Administre los usuarios del sistema
          </p>
        </div>
      </div>

      <div className='flex md:hidden gap-2 mb-6'>
        <Button
          variant={!showForm ? "default" : "outline"}
          onClick={() => setShowForm(false)}
          className='flex-1'
        >
          Lista de Personal
        </Button>
        <Button
          variant={showForm ? "default" : "outline"}
          onClick={() => setShowForm(true)}
          className='flex-1'
        >
          {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        <div
          className={`${showForm ? "block" : "hidden"} lg:block lg:col-span-2`}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </CardTitle>
              <CardDescription>
                {editingUser
                  ? "Modifique los datos del usuario seleccionado"
                  : "Complete el formulario para agregar un nuevo usuario"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                    Información Personal
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex flex-col items-start gap-2 md:col-span-2'>
                      <Label htmlFor='name'>Nombre Completo *</Label>
                      <Input
                        id='name'
                        type='text'
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='cedula'>Cédula</Label>
                      <Input
                        id='cedula'
                        type='text'
                        value={formData.cedula}
                        onChange={(e) =>
                          handleInputChange("cedula", e.target.value)
                        }
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='fecha_nacimiento'>
                        Fecha de Nacimiento
                      </Label>
                      <Input
                        id='fecha_nacimiento'
                        type='date'
                        value={formData.fecha_nacimiento}
                        onChange={(e) =>
                          handleInputChange("fecha_nacimiento", e.target.value)
                        }
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='lugar_nacimiento'>
                        Lugar de Nacimiento
                      </Label>
                      <Input
                        id='lugar_nacimiento'
                        type='text'
                        value={formData.lugar_nacimiento}
                        onChange={(e) =>
                          handleInputChange("lugar_nacimiento", e.target.value)
                        }
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='nacionalidad'>Nacionalidad</Label>
                      <Input
                        id='nacionalidad'
                        type='text'
                        value={formData.nacionalidad}
                        onChange={(e) =>
                          handleInputChange("nacionalidad", e.target.value)
                        }
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='estado_civil'>Estado Civil</Label>
                      <Select
                        value={formData.estado_civil}
                        onValueChange={(value) =>
                          handleInputChange("estado_civil", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccione estado civil' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='soltero'>Soltero</SelectItem>
                          <SelectItem value='casado'>Casado</SelectItem>
                          <SelectItem value='divorciado'>Divorciado</SelectItem>
                          <SelectItem value='viudo'>Viudo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='telefono'>Teléfono</Label>
                      <Input
                        id='telefono'
                        type='text'
                        value={formData.telefono}
                        onChange={(e) =>
                          handleInputChange("telefono", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-4 pt-4 border-t'>
                  <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                    Información Laboral
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='cargo_laboral'>Cargo Laboral</Label>
                      <Input
                        id='cargo_laboral'
                        type='text'
                        value={formData.cargo_laboral}
                        onChange={(e) =>
                          handleInputChange("cargo_laboral", e.target.value)
                        }
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='departamento'>Departamento</Label>
                      <Select
                        value={formData.departamento}
                        onValueChange={(value) =>
                          handleInputChange("departamento", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccione departamento' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='servicios-publicos'>
                            Servicios públicos
                          </SelectItem>
                          <SelectItem value='catastro'>Catastro</SelectItem>
                          <SelectItem value='renta-y-licores'>
                            Renta y licores
                          </SelectItem>
                          <SelectItem value='tesoreria'>Tesorería</SelectItem>
                          <SelectItem value='presupuesto'>
                            Presupuesto
                          </SelectItem>
                          <SelectItem value='compras'>Compras</SelectItem>
                          <SelectItem value='contabilidad'>
                            Contabilidad
                          </SelectItem>
                          <SelectItem value='salud-y-bienestar-social'>
                            Salud y bienestar social
                          </SelectItem>
                          <SelectItem value='personal-y-transporte'>
                            Personal y transporte
                          </SelectItem>
                          <SelectItem value='informatica'>
                            Informática
                          </SelectItem>
                          <SelectItem value='tierra'>Tierra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='flex flex-col items-start gap-2 md:col-span-2'>
                      <Label htmlFor='horario'>Horario</Label>
                      <Input
                        id='horario'
                        type='text'
                        value={formData.horario}
                        onChange={(e) =>
                          handleInputChange("horario", e.target.value)
                        }
                        placeholder='Ej: 8:00 AM - 5:00 PM'
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-4 pt-4 border-t'>
                  <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                    Cuenta y Acceso
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex flex-col items-start gap-2 md:col-span-2'>
                      <Label htmlFor='email'>Correo Electrónico *</Label>
                      <Input
                        id='email'
                        type='email'
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder='usuario@ejemplo.com'
                        required
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='password'>
                        Contraseña {editingUser ? "(opcional)" : "*"}
                      </Label>
                      <Input
                        id='password'
                        type='password'
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder={
                          editingUser
                            ? "Dejar vacío para mantener"
                            : "Contraseña"
                        }
                        required={!editingUser}
                      />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                      <Label htmlFor='role'>Rol *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          handleInputChange("role", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccione un rol' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='no-selected'>Rol</SelectItem>
                          <SelectItem value='user'>Usuario</SelectItem>
                          <SelectItem value='admin'>Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {formData.role === "user" && (
                  <div className='space-y-4 pt-4 border-t'>
                    <div>
                      <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                        Preguntas de Seguridad {!editingUser && "*"}
                      </h3>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Requeridas para recuperación de contraseña
                      </p>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex flex-col items-start gap-2'>
                        <Label htmlFor='security_answer_1' className='text-sm'>
                          ¿Cuál es el nombre de tu primera mascota?
                        </Label>
                        <Input
                          id='security_answer_1'
                          type='text'
                          value={formData.security_answer_1}
                          onChange={(e) =>
                            handleInputChange(
                              "security_answer_1",
                              e.target.value
                            )
                          }
                          placeholder='Respuesta'
                          required={!editingUser}
                        />
                      </div>
                      <div className='flex flex-col items-start gap-2'>
                        <Label htmlFor='security_answer_2' className='text-sm'>
                          ¿Segundo nombre de tu padre?
                        </Label>
                        <Input
                          id='security_answer_2'
                          type='text'
                          value={formData.security_answer_2}
                          onChange={(e) =>
                            handleInputChange(
                              "security_answer_2",
                              e.target.value
                            )
                          }
                          placeholder='Respuesta'
                          required={!editingUser}
                        />
                      </div>
                      <div className='flex flex-col items-start gap-2'>
                        <Label htmlFor='security_answer_3' className='text-sm'>
                          ¿Cuál es tu color favorito?
                        </Label>
                        <Input
                          id='security_answer_3'
                          type='text'
                          value={formData.security_answer_3}
                          onChange={(e) =>
                            handleInputChange(
                              "security_answer_3",
                              e.target.value
                            )
                          }
                          placeholder='Respuesta'
                          required={!editingUser}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex gap-2 pt-4'>
                  <Button type='submit' disabled={loading} className='flex-1'>
                    {loading
                      ? "Guardando..."
                      : editingUser
                      ? "Actualizar"
                      : "Crear Usuario"}
                  </Button>
                  {editingUser && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div
          className={`${!showForm ? "block" : "hidden"} lg:block lg:col-span-3`}
        >
          <Card>
            <CardHeader>
              <CardTitle>Personal Registrado</CardTitle>
              <CardDescription>
                Lista de usuarios del sistema ({users.length} registros)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8'>
                  <p>Cargando personal...</p>
                </div>
              ) : users.length === 0 ? (
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No hay personal registrado
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead>Fecha Nac.</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.cedula}</TableCell>
                        <TableCell>{user.fecha_nacimiento}</TableCell>
                        <TableCell>{user.telefono}</TableCell>
                        <TableCell>{user.cargo_laboral}</TableCell>
                        <TableCell>{user.departamento}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role === "admin"
                              ? "Administrador"
                              : "Usuario"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.active ? "default" : "destructive"}
                          >
                            {user.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEdit(user)}
                              title='Editar usuario'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDelete(user.id)}
                              title='Desactivar usuario'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Personal;
