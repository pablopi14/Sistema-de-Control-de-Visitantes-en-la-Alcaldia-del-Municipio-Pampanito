"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { CalendarIcon, Loader2, Download, FileText, Users, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import apiService from "@/services/api"

interface ReportData {
  totalVisitas: number
  visitasHoy: number
  visitasSemana: number
  visitasMes: number
  motivosPopulares: Array<{
    motivo: string
    count: number
  }>
  visitasPorDia: Array<{
    fecha: string
    count: number
  }>
  visitantesRecurrentes: Array<{
    nombres: string
    apellidos: string
    cedula: string
    visitas: number
  }>
}

const ReportsPage = () => {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const isMobile = useIsMobile()

  // Estados para vista móvil
  const [mobileView, setMobileView] = useState<"filters" | "data">("filters")

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await apiService.reports.getReportData({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      })
      setReportData(response)
    } catch (error) {
      toast.error("Error al cargar los datos del reporte")
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDFReport = async () => {
    setGeneratingPDF(true)
    try {
      const response = await apiService.reports.generatePDF({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      })

      // Descargar el PDF
      const blob = new Blob([response], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-asistencia-${format(new Date(), "yyyy-MM-dd")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Reporte PDF generado exitosamente")
    } catch (error) {
      toast.error("Error al generar el reporte PDF")
      console.error("Error generating PDF:", error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [startDate, endDate])

  const FiltersSection = () => (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Configuración del Reporte
        </CardTitle>
        <CardDescription>Selecciona el rango de fechas para generar el reporte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Fecha de Inicio
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              Fecha Final
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal h-10", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={generatePDFReport} disabled={generatingPDF || !reportData} className="w-full h-10">
            {generatingPDF && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const DataSection = () => (
    <div className="space-y-6">
      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visitas</p>
                <p className="text-3xl font-bold text-blue-600">{reportData?.totalVisitas || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visitas Hoy</p>
                <p className="text-3xl font-bold text-green-600">{reportData?.visitasHoy || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-3xl font-bold text-orange-600">{reportData?.visitasSemana || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                <p className="text-3xl font-bold text-purple-600">{reportData?.visitasMes || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivos de Visita Populares */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Motivos de Visita Más Populares</CardTitle>
          <CardDescription>Los motivos más frecuentes durante el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Motivo</TableHead>
                  <TableHead className="text-right font-semibold">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData?.motivosPopulares?.length ? (
                  reportData.motivosPopulares.map((motivo, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{motivo.motivo}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {motivo.count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                      No hay datos disponibles para el período seleccionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Visitantes Recurrentes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Visitantes Recurrentes</CardTitle>
          <CardDescription>Personas que han visitado más de una vez en el período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Nombre Completo</TableHead>
                  <TableHead className="font-semibold">Cédula</TableHead>
                  <TableHead className="text-right font-semibold">Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData?.visitantesRecurrentes?.length ? (
                  reportData.visitantesRecurrentes.map((visitante, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{`${visitante.nombres} ${visitante.apellidos}`}</TableCell>
                      <TableCell className="font-mono text-sm">{visitante.cedula}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          {visitante.visitas}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No hay visitantes recurrentes en el período seleccionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (isMobile) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Reportes de Asistencia</h1>
          <p className="text-muted-foreground text-sm">Genera y visualiza reportes detallados</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={mobileView === "filters" ? "default" : "outline"}
            onClick={() => setMobileView("filters")}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button
            variant={mobileView === "data" ? "default" : "outline"}
            onClick={() => setMobileView("data")}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Datos
          </Button>
        </div>

        {mobileView === "filters" ? <FiltersSection /> : <DataSection />}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reportes de Asistencia</h1>
        <p className="text-muted-foreground">Genera y visualiza reportes detallados de asistencia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <FiltersSection />
        </div>
        <div className="lg:col-span-2">
          {loading ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando datos del reporte...</p>
              </div>
            </Card>
          ) : (
            <DataSection />
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
