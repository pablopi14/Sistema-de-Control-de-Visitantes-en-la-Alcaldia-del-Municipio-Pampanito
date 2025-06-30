import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Users } from "lucide-react";
import { toast } from "sonner";
import apiService from "../services/api";
import { User } from "../models/dbModels";

const Personal: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user"
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users on component mount
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
    
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      
      if (editingUser) {
        // Update user
        await apiService.users.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password && { password: formData.password })
        });
        toast.success("Usuario actualizado exitosamente");
      } else {
        // Create user
        await apiService.users.createUser(formData);
        toast.success("Usuario creado exitosamente");
      }
      
      // Reset form and refresh list
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
      email: user.email,
      password: "",
      role: user.role
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
      email: "",
      password: "",
      role: "user"
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestión de Personal
          </h1>
          <p className="text-muted-foreground mt-1">
            Administre los usuarios del sistema
          </p>
        </div>
      </div>

      {/* Mobile Toggle Buttons */}
      <div className="flex md:hidden gap-2 mb-6">
        <Button
          variant={!showForm ? "default" : "outline"}
          onClick={() => setShowForm(false)}
          className="flex-1"
        >
          Lista de Personal
        </Button>
        <Button
          variant={showForm ? "default" : "outline"}
          onClick={() => setShowForm(true)}
          className="flex-1"
        >
          {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className={`${showForm ? "block" : "hidden"} md:block`}>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </CardTitle>
              <CardDescription>
                {editingUser 
                  ? "Modifique los datos del usuario seleccionado"
                  : "Complete el formulario para agregar un nuevo usuario"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-start">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ingrese el nombre completo"
                    required
                  />
                </div>

                <div className="flex flex-col items-start">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>

                <div className="flex flex-col items-start">
                  <Label htmlFor="password">
                    Contraseña {editingUser ? "(dejar vacío para mantener actual)" : "*"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                    required={!editingUser}
                  />
                </div>

                <div className="flex flex-col items-start">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Guardando..." : editingUser ? "Actualizar" : "Crear Usuario"}
                  </Button>
                  {editingUser && (
                    <Button
                      type="button"
                      variant="outline"
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

        {/* List Section */}
        <div className={`${!showForm ? "block" : "hidden"} md:block`}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Registrado</CardTitle>
              <CardDescription>
                Lista de usuarios del sistema ({users.length} registros)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Cargando personal...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay personal registrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Administrador" : "Usuario"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.active ? "default" : "destructive"}>
                            {user.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              title="Desactivar usuario"
                            >
                              <Trash2 className="h-4 w-4" />
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