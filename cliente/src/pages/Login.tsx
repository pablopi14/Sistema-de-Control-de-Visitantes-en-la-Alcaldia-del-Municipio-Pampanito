"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import apiService from "../services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Estados para el modal de recuperación de contraseña
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState(1) // 1: preguntas de seguridad, 2: cambiar contraseña
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [securityAnswer1, setSecurityAnswer1] = useState("")
  const [securityAnswer2, setSecurityAnswer2] = useState("")
  const [securityAnswer3, setSecurityAnswer3] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate fields
    if (!email || !password) {
      setError("Todos los campos son requeridos") 
      return
    }

    try {
      setIsSubmitting(true)
      await login(email, password)
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error al iniciar sesión")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSecurityQuestions = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recoveryEmail || !securityAnswer1 || !securityAnswer2 || !securityAnswer3) {
      setRecoveryMessage("Por favor complete todos los campos")
      return
    }

    try {
      setIsVerifying(true)
      setRecoveryMessage("")

      // Llamar al backend para verificar las preguntas de seguridad
      const response = await apiService.auth.verifySecurityQuestions(
        recoveryEmail,
        securityAnswer1,
        securityAnswer2,
        securityAnswer3,
      )

      // Guardar el token de reseteo
      setResetToken(response.resetToken)

      // Pasar al paso 2: cambiar contraseña
      setRecoveryStep(2)
      toast.success("Identidad verificada correctamente")
    } catch (error: any) {
      setRecoveryMessage(error.response?.data?.message || "Error al verificar las respuestas")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      setRecoveryMessage("Por favor complete todos los campos")
      return
    }

    if (newPassword.length < 6) {
      setRecoveryMessage("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setRecoveryMessage("Las contraseñas no coinciden")
      return
    }

    try {
      setIsVerifying(true)
      setRecoveryMessage("")

      // Llamar al backend para resetear la contraseña
      await apiService.auth.resetPassword(resetToken, newPassword)

      toast.success("Contraseña cambiada exitosamente")

      // Limpiar y cerrar después de 1 segundo
      setTimeout(() => {
        handleCloseRecoveryModal()
      }, 1000)
    } catch (error: any) {
      setRecoveryMessage(error.response?.data?.message || "Error al cambiar la contraseña")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCloseRecoveryModal = () => {
    setShowRecoveryModal(false)
    setRecoveryStep(1)
    setRecoveryEmail("")
    setSecurityAnswer1("")
    setSecurityAnswer2("")
    setSecurityAnswer3("")
    setNewPassword("")
    setConfirmPassword("")
    setRecoveryMessage("")
    setResetToken("")
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden">
      {/* Imagen de fondo estratégica - posicionada a la derecha con overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/logo.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <Card className="glass-card hover-glow shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Sistema de Asistencias</CardTitle>
            <CardDescription>Ingrese sus credenciales para acceder</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-destructive/20 text-destructive-foreground p-3 rounded-md mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User size={18} />
                  </span>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={18} />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Botón de olvidaste contraseña */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center text-sm text-muted-foreground">
            <div className="w-full text-center">
              Para propósitos de demostración, use:
              <br />
              <span className="font-mono text-xs">admin@example.com / 123456</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Modal de recuperación de contraseña con preguntas de seguridad */}
      <Dialog open={showRecoveryModal} onOpenChange={handleCloseRecoveryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{recoveryStep === 1 ? "Recuperar Contraseña" : "Cambiar Contraseña"}</DialogTitle>
            <DialogDescription>
              {recoveryStep === 1
                ? "Complete la información para verificar su identidad"
                : "Ingrese su nueva contraseña"}
            </DialogDescription>
          </DialogHeader>

          {recoveryStep === 1 ? (
            // Paso 1: Preguntas de seguridad
            <form onSubmit={handleSecurityQuestions} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="Ingrese su email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-1">¿Cuál es el nombre de tu primera mascota?</Label>
                <Input
                  id="security-1"
                  type="text"
                  placeholder="Respuesta"
                  value={securityAnswer1}
                  onChange={(e) => setSecurityAnswer1(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-2">¿Segundo nombre de tu padre?</Label>
                <Input
                  id="security-2"
                  type="text"
                  placeholder="Respuesta"
                  value={securityAnswer2}
                  onChange={(e) => setSecurityAnswer2(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-3">¿Cuál es tu color favorito?</Label>
                <Input
                  id="security-3"
                  type="text"
                  placeholder="Respuesta"
                  value={securityAnswer3}
                  onChange={(e) => setSecurityAnswer3(e.target.value)}
                />
              </div>

              {recoveryMessage && (
                <div className="bg-destructive/20 text-destructive-foreground p-3 rounded-md text-sm">
                  {recoveryMessage}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleCloseRecoveryModal} className="hover:bg-slate-200/50">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying ? "Verificando..." : "Verificar"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            // Paso 2: Cambiar contraseña
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Ingrese su nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme su nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {recoveryMessage && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    recoveryMessage.includes("exitosamente")
                      ? "bg-green-500/20 text-green-700 dark:text-green-300"
                      : "bg-destructive/20 text-destructive-foreground"
                  }`}
                >
                  {recoveryMessage}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleCloseRecoveryModal} className="hover:bg-slate-200/50"> 
                  Cancelar
                </Button>
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
