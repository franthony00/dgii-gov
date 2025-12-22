"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { VehicleData } from "@/lib/types"
import { getVehicleData } from "@/lib/storage"

export function ViewerContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get("c")

  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!code) {
        setLoading(false)
        return
      }

      const data = await getVehicleData(code)
      setVehicleData(data || null)
      setLoading(false)
    }

    fetchData()
  }, [code])

  // --- ESTADO CARGANDO ---
  if (loading) {
    return (
      <div className="container">
        <div id="header">
          <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
        </div>
        <div id="title">
          <span className="title-orange">Sistema Datamatrix</span>
          <h1 className="title-green">Validación de Documentos</h1>
        </div>
        <div id="content">
          <p>Cargando información oficial...</p>
        </div>
        <div id="footer">Dirección General de Impuestos Internos</div>
      </div>
    )
  }

  // --- ESTADO SIN DATOS ---
  if (!vehicleData) {
    return (
      <div className="container">
        <div id="header">
          <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
        </div>
        <div id="title">
          <span className="title-orange">Sistema Datamatrix</span>
          <h1 className="title-green">Validación de Documentos</h1>
        </div>
        <div id="content">
          <p>No existe un documento asociado a este código.</p>
        </div>
        <div id="footer">Dirección General de Impuestos Internos</div>
      </div>
    )
  }

  // --- DISEÑO FINAL PIXEL-PERFECT ---
  return (
    <div className="container">
      {/* HEADER VERDE CON IMAGEN INTEGRADA */}
      <div id="header">
        <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
      </div>

      {/* SUBTÍTULOS DGII */}
      <div id="title">
        <span className="title-orange">Sistema Datamatrix</span>
        <h1 className="title-green">Validación de Documentos</h1>
      </div>

      {/* TABLA DE DATOS CON CLASES DE DGII.CSS */}
      <div id="content">
        <table className="data_table">
          <tbody>
            <tr>
              <td className="left-col">Código</td>
              <td className="right-col">{vehicleData.id}</td>
            </tr>
            <tr>
              <td className="left-col">Placa</td>
              <td className="right-col">{vehicleData.placa}</td>
            </tr>
            <tr>
              <td className="left-col">Tipo de Vehículo</td>
              <td className="right-col">{vehicleData.tipoVehiculo}</td>
            </tr>
            <tr>
              <td className="left-col">Marca</td>
              <td className="right-col">{vehicleData.marca}</td>
            </tr>
            <tr>
              <td className="left-col">Modelo</td>
              <td className="right-col">{vehicleData.modelo}</td>
            </tr>
            <tr>
              <td className="left-col">Color</td>
              <td className="right-col">{vehicleData.color}</td>
            </tr>
            <tr>
              <td className="left-col">Año</td>
              <td className="right-col">{vehicleData.año}</td>
            </tr>
            <tr>
              <td className="left-col">Chasis</td>
              <td className="right-col">{vehicleData.chasis}</td>
            </tr>
            <tr>
              <td className="left-col">Fecha Expiración</td>
              <td className="right-col">{vehicleData.fechaExpiracion}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER GRIS INSTITUCIONAL */}
      <div id="footer">Dirección General de Impuestos Internos</div>
    </div>
  )
}
