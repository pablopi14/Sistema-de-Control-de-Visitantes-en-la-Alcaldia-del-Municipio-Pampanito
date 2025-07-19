const { Attendance } = require("../models")
const { Op, fn, col, literal } = require("sequelize")
const PDFDocument = require("pdfkit")

// Función auxiliar para obtener los datos del reporte
const fetchReportData = async (startDate, endDate) => {
  // Validar fechas
  if (!startDate || !endDate) {
    throw new Error("Las fechas de inicio y fin son requeridas")
  }

  const start = new Date(startDate + "T00:00:00.000Z")
  const end = new Date(endDate + "T23:59:59.999Z")

  // Validar que la fecha de inicio no sea mayor que la fecha de fin
  if (start > end) {
    throw new Error("La fecha de inicio no puede ser mayor que la fecha de fin")
  }

  // Obtener total de visitas en el rango seleccionado
  const totalVisitas = await Attendance.count({
    where: {
      createdAt: {
        [Op.between]: [start, end],
      },
    },
  })

  // Todas las estadísticas ahora se basan en el rango de fechas seleccionado
  // Visitas por día dentro del rango
  const visitasPorDia = await Attendance.findAll({
    attributes: [
      [fn("DATE", col("createdAt")), "fecha"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      createdAt: {
        [Op.between]: [start, end],
      },
    },
    group: [fn("DATE", col("createdAt"))],
    order: [[fn("DATE", col("createdAt")), "ASC"]],
    raw: true,
  })

  // Formatear visitas por día
  const visitasPorDiaFormateadas = visitasPorDia.map((dia) => ({
    fecha: dia.fecha,
    count: Number.parseInt(dia.count),
  }))

  // Calcular estadísticas basadas en el rango seleccionado
  let visitasHoy = 0
  let visitasSemana = 0
  let visitasMes = 0

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  // Solo calcular visitas de hoy si hoy está dentro del rango
  if (start <= today && today <= end) {
    const visitasHoyData = visitasPorDiaFormateadas.find((dia) => dia.fecha === todayStr)
    visitasHoy = visitasHoyData ? visitasHoyData.count : 0
  }

  // Calcular visitas de la última semana dentro del rango
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekStart = oneWeekAgo > start ? oneWeekAgo : start

  if (weekStart <= end) {
    visitasSemana = await Attendance.count({
      where: {
        createdAt: {
          [Op.between]: [weekStart, end],
        },
      },
    })
  }

  // Calcular visitas del último mes dentro del rango
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const monthStart = oneMonthAgo > start ? oneMonthAgo : start

  if (monthStart <= end) {
    visitasMes = await Attendance.count({
      where: {
        createdAt: {
          [Op.between]: [monthStart, end],
        },
      },
    })
  }

  // Motivos de visita más populares en el rango seleccionado
  const motivosPopulares = await Attendance.findAll({
    attributes: ["motivo_visita", [fn("COUNT", col("motivo_visita")), "count"]],
    where: {
      createdAt: {
        [Op.between]: [start, end],
      },
      motivo_visita: {
        [Op.ne]: null,
        [Op.ne]: "",
      },
    },
    group: ["motivo_visita"],
    order: [[literal("count"), "DESC"]],
    limit: 10,
    raw: true,
  })

  // Formatear motivos populares
  const motivosFormateados = motivosPopulares.map((motivo) => ({
    motivo: motivo.motivo_visita,
    count: Number.parseInt(motivo.count),
  }))

  // Visitantes recurrentes en el rango seleccionado (más de 1 visita)
  const visitantesRecurrentes = await Attendance.findAll({
    attributes: ["nombres", "apellidos", "cedula", [fn("COUNT", col("cedula")), "visitas"]],
    where: {
      createdAt: {
        [Op.between]: [start, end],
      },
      cedula: {
        [Op.ne]: null,
        [Op.ne]: "",
      },
    },
    group: ["cedula", "nombres", "apellidos"],
    having: literal("COUNT(cedula) > 1"),
    order: [[literal("visitas"), "DESC"]],
    limit: 10,
    raw: true,
  })

  // Formatear visitantes recurrentes
  const visitantesFormateados = visitantesRecurrentes.map((visitante) => ({
    nombres: visitante.nombres,
    apellidos: visitante.apellidos,
    cedula: visitante.cedula,
    visitas: Number.parseInt(visitante.visitas),
  }))

  return {
    totalVisitas,
    visitasHoy,
    visitasSemana,
    visitasMes,
    motivosPopulares: motivosFormateados,
    visitasPorDia: visitasPorDiaFormateadas,
    visitantesRecurrentes: visitantesFormateados,
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
    hasData: totalVisitas > 0, // Indicador si hay datos en el rango
  }
}

exports.getReportData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const reportData = await fetchReportData(startDate, endDate)
    res.status(200).send(reportData)
  } catch (error) {
    console.error("Error generating report:", error)
    res.status(500).send({
      message: error.message || "Ocurrió un error al generar el reporte.",
    })
  }
}

exports.generatePDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.body

    // Obtener los datos del reporte usando la función auxiliar
    const reportData = await fetchReportData(startDate, endDate)

    // Crear un nuevo documento PDF con mejor formato
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60,
      },
    })

    // Configurar headers para descarga de PDF
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=reporte-asistencia-${startDate}.pdf`)

    // Pipe el PDF directamente a la respuesta
    doc.pipe(res)

    // Constantes para el layout
    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 60
    const contentWidth = pageWidth - margin * 2

    // Función auxiliar para agregar líneas divisorias
    const addDivider = () => {
      const currentY = doc.y
      doc
        .moveTo(margin, currentY + 5)
        .lineTo(margin + contentWidth, currentY + 5)
        .stroke("#E5E7EB")
      doc.y = currentY + 15
    }

    // Header del documento con mejor diseño
    doc.rect(0, 0, pageWidth, 90).fill("#1F2937")
    doc.fillColor("#FFFFFF").fontSize(26).font("Helvetica-Bold").text("REPORTE DE ASISTENCIA", margin, 35, {
      align: "center",
      width: contentWidth,
    })

    doc.y = 110
    doc.fillColor("#000000")

    // Información del reporte en un recuadro
    const infoBoxY = doc.y
    doc.rect(margin, infoBoxY, contentWidth, 90).stroke("#E5E7EB").fillColor("#F9FAFB").fill()

    doc
      .fillColor("#000000")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("INFORMACIÓN DEL REPORTE", margin + 15, infoBoxY + 15)

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(`Período: ${startDate} al ${endDate}`, margin + 15, infoBoxY + 35)
      .text(`Generado: ${new Date().toLocaleString("es-ES")}`, margin + 15, infoBoxY + 50)
      .text(`Total de registros en el período: ${reportData.totalVisitas}`, margin + 15, infoBoxY + 65)

    doc.y = infoBoxY + 110

    // Verificar si hay datos para mostrar
    if (!reportData.hasData) {
      // Mostrar mensaje cuando no hay datos
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#DC2626").text("SIN DATOS DISPONIBLES", margin, doc.y)

      addDivider()

      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(
          `No se encontraron registros de asistencia para el período seleccionado (${startDate} al ${endDate}).`,
          margin + 20,
          doc.y,
          { width: contentWidth - 40, align: "justify" },
        )
        .moveDown(2)
        .text("Posibles razones:", margin + 20, doc.y)
        .moveDown(0.5)
        .text("• No hubo visitas registradas en estas fechas", margin + 40, doc.y)
        .moveDown(0.3)
        .text("• El rango de fechas seleccionado está fuera del período de registros", margin + 40, doc.y)
        .moveDown(0.3)
        .text("• Los datos pueden haber sido eliminados o no se han sincronizado", margin + 40, doc.y)

      // Footer
    //   doc
    //     .fontSize(9)
    //     .fillColor("#6B7280")
    //     .text(`Reporte generado el ${new Date().toLocaleString("es-ES")}`, margin, pageHeight - 40, {
    //       align: "center",
    //       width: contentWidth,
    //     })

      doc.end()
      return
    }

    // Estadísticas generales con mejor formato
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#1F2937").text("ESTADÍSTICAS DEL PERÍODO", margin, doc.y)

    addDivider()
    doc.fillColor("#000000")

    // Crear una tabla de estadísticas con mejor espaciado
    const stats = [
      ["Total de visitas en el período:", reportData.totalVisitas.toString()],
      ["Visitas hoy (si está en el rango):", reportData.visitasHoy.toString()],
      ["Visitas última semana (en el rango):", reportData.visitasSemana.toString()],
      ["Visitas último mes (en el rango):", reportData.visitasMes.toString()],
    ]

    stats.forEach(([label, value]) => {
      const currentY = doc.y
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(label, margin + 20, currentY, { width: 300 })
        .font("Helvetica-Bold")
        .text(value, margin + 330, currentY, { width: 100, align: "right" })
      doc.y = currentY + 18
    })

    doc.y += 20

    // Motivos populares con mejor formato
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#1F2937").text("MOTIVOS DE VISITA MÁS POPULARES", margin, doc.y)

    addDivider()
    doc.fillColor("#000000")

    if (reportData.motivosPopulares && reportData.motivosPopulares.length > 0) {
      // Header de la tabla
      const tableHeaderY = doc.y
      doc.rect(margin, tableHeaderY, contentWidth, 25).fillColor("#F3F4F6").fill().stroke("#E5E7EB")

      doc
        .fillColor("#000000")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("MOTIVO", margin + 10, tableHeaderY + 8, { width: 300 })
        .text("CANTIDAD", margin + 320, tableHeaderY + 8, { width: 100, align: "center" })

      doc.y = tableHeaderY + 35

      reportData.motivosPopulares.forEach((motivo, index) => {
        if (doc.y > pageHeight - 100) {
          doc.addPage()
          doc.y = margin
        }

        const rowY = doc.y
        const rowHeight = 20

        // Alternar color de fondo para las filas
        if (index % 2 === 0) {
          doc.rect(margin, rowY, contentWidth, rowHeight).fillColor("#FAFAFA").fill()
        }

        doc
          .fillColor("#000000")
          .fontSize(10)
          .font("Helvetica")
          .text(`${index + 1}. ${motivo.motivo}`, margin + 10, rowY + 5, { width: 300 })
          .font("Helvetica-Bold")
          .text(motivo.count.toString(), margin + 320, rowY + 5, { width: 100, align: "center" })

        doc.y = rowY + rowHeight
      })
    } else {
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(`No se registraron motivos de visita en el período ${startDate} al ${endDate}`, margin + 20, doc.y, {
          width: contentWidth - 40,
        })
    }

    doc.y += 30

    // Visitantes recurrentes con mejor formato
    if (doc.y > pageHeight - 200) {
      doc.addPage()
      doc.y = margin
    }

    doc.fontSize(18).font("Helvetica-Bold").fillColor("#1F2937").text("VISITANTES RECURRENTES", margin, doc.y)

    addDivider()
    doc.fillColor("#000000")

    if (reportData.visitantesRecurrentes && reportData.visitantesRecurrentes.length > 0) {
      // Header de la tabla
      const tableHeaderY = doc.y
      doc.rect(margin, tableHeaderY, contentWidth, 25).fillColor("#F3F4F6").fill().stroke("#E5E7EB")

      doc
        .fillColor("#000000")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("NOMBRE COMPLETO", margin + 10, tableHeaderY + 8, { width: 200 })
        .text("CÉDULA", margin + 220, tableHeaderY + 8, { width: 120 })
        .text("VISITAS", margin + 350, tableHeaderY + 8, { width: 80, align: "center" })

      doc.y = tableHeaderY + 35

      reportData.visitantesRecurrentes.forEach((visitante, index) => {
        if (doc.y > pageHeight - 100) {
          doc.addPage()
          doc.y = margin
        }

        const rowY = doc.y
        const rowHeight = 20

        // Alternar color de fondo para las filas
        if (index % 2 === 0) {
          doc.rect(margin, rowY, contentWidth, rowHeight).fillColor("#FAFAFA").fill()
        }

        const nombreCompleto = `${visitante.nombres} ${visitante.apellidos}`
        doc
          .fillColor("#000000")
          .fontSize(10)
          .font("Helvetica")
          .text(`${index + 1}. ${nombreCompleto}`, margin + 10, rowY + 5, { width: 200 })
          .text(visitante.cedula, margin + 220, rowY + 5, { width: 120 })
          .font("Helvetica-Bold")
          .text(visitante.visitas.toString(), margin + 350, rowY + 5, { width: 80, align: "center" })

        doc.y = rowY + rowHeight
      })
    } else {
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(`No hay visitantes recurrentes en el período ${startDate} al ${endDate}`, margin + 20, doc.y, {
          width: contentWidth - 40,
        })
    }

    // Resumen de visitas por día si hay datos
    if (reportData.visitasPorDia && reportData.visitasPorDia.length > 0) {
      doc.y += 30

      if (doc.y > pageHeight - 200) {
        doc.addPage()
        doc.y = margin
      }

      doc.fontSize(18).font("Helvetica-Bold").fillColor("#1F2937").text("DISTRIBUCIÓN DIARIA", margin, doc.y)

      addDivider()
      doc.fillColor("#000000")

      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Total de días con visitas: ${reportData.visitasPorDia.length}`, margin + 20, doc.y)

      const totalDaysInRange = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
      const daysWithoutVisits = totalDaysInRange - reportData.visitasPorDia.length

      doc.text(`Días sin visitas: ${daysWithoutVisits}`, margin + 20, doc.y + 15) 
    }

    // Footer
    // doc
    //   .fontSize(9)
    //   .fillColor("#6B7280")
    //   .text(`Reporte generado el ${new Date().toLocaleString("es-ES")}`, margin, pageHeight - 40, {
    //     align: "center",
    //     width: contentWidth,
    //   })

    // Finalizar el documento
    doc.end()
  } catch (error) {
    console.error("Error generating PDF:", error)
    res.status(500).send({
      message: error.message || "Ocurrió un error al generar el PDF.",
    })
  }
}

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { periodo = "week" } = req.query

    let startDate
    const today = new Date()

    switch (periodo) {
      case "today":
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        break
      case "week":
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
    }

    const summary = await Attendance.findAll({
      attributes: [
        [fn("DATE", col("createdAt")), "fecha"],
        [fn("COUNT", col("id")), "total"],
        [fn("COUNT", fn("DISTINCT", col("cedula"))), "visitantes_unicos"],
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "DESC"]],
      raw: true,
    })

    res.status(200).send(summary)
  } catch (error) {
    console.error("Error getting attendance summary:", error)
    res.status(500).send({
      message: error.message || "Ocurrió un error al obtener el resumen.",
    })
  }
}
