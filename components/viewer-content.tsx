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

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
        </div>

        <div className="title-section">
          <h1 className="title-orange">Sistema Datamatrix</h1>
          <h1 className="title-green">Validación de Documentos</h1>
        </div>

        <div className="table-container">
          <p>Cargando información...</p>
        </div>
      </div>
    )
  }

  if (!vehicleData) {
    return (
      <div className="container">
        <div className="header">
          <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
        </div>

        <div className="title-section">
          <h1 className="title-orange">Sistema Datamatrix</h1>
          <h1 className="title-green">Validación de Documentos</h1>
        </div>

        <div className="table-container">
          <p>No existe un documento asociado a este código.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* HEADER VERDE */}
      <div className="header">
        <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
      </div>

      {/* SUBTÍTULOS */}
      <div className="title-section">
        <h1 className="title-orange">Sistema Datamatrix</h1>
        <h1 className="title-green">Validación de Documentos</h1>
      </div>

      {/* TABLA DGII */}
      <div className="table-container">
        <table>
          <tbody>
            <tr>
              <td>Código</td>
              <td>{vehicleData.id}</td>
            </tr>
            <tr>
              <td>Placa</td>
              <td>{vehicleData.placa}</td>
            </tr>
            <tr>
              <td>Tipo de Vehículo</td>
              <td>{vehicleData.tipoVehiculo}</td>
            </tr>
            <tr>
              <td>Marca</td>
              <td>{vehicleData.marca}</td>
            </tr>
            <tr>
              <td>Modelo</td>
              <td>{vehicleData.modelo}</td>
            </tr>
            <tr>
              <td>Color</td>
              <td>{vehicleData.color}</td>
            </tr>
            <tr>
              <td>Año</td>
              <td>{vehicleData.año}</td>
            </tr>
            <tr>
              <td>Chasis</td>
              <td>{vehicleData.chasis}</td>
            </tr>
            <tr>
              <td>Fecha Expiración</td>
              <td>{vehicleData.fechaExpiracion}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER GRIS */}
      <div className="footer">Dirección General de Impuestos Internos</div>
    </div>
  )
}
