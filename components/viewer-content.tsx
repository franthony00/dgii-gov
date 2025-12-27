"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ViewerContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("c");

  const [vehicleData, setVehicleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!code) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/vehiculo/get?code=${code}`);
        const json = await res.json();

        console.log("RESPUESTA DEL SERVIDOR:", json);

        if (json.success) {
          setVehicleData(json.data);
        } else {
          setVehicleData(null);
        }
      } catch (error) {
        console.error("ERROR FETCHING VEHICLE:", error);
        setVehicleData(null);
      }

      setLoading(false);
    }

    fetchData();
  }, [code]);

  // LOADING
  if (loading) {
    return <p style={{ padding: 40 }}>Cargando información oficial...</p>;
  }

  // NO DATA
  if (!vehicleData) {
    return <p style={{ padding: 40 }}>No existe un documento asociado a este código.</p>;
  }

  // FINAL VIEW
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
        <table className="data_table">
          <tbody>
            <tr><td className="left-col">Código</td><td className="right-col">{vehicleData.codigo}</td></tr>
            <tr><td className="left-col">Placa</td><td className="right-col">{vehicleData.placa}</td></tr>
            <tr><td className="left-col">Tipo Vehículo</td><td className="right-col">{vehicleData.tipo_vehiculo}</td></tr>
            <tr><td className="left-col">Marca</td><td className="right-col">{vehicleData.marca}</td></tr>
            <tr><td className="left-col">Modelo</td><td className="right-col">{vehicleData.modelo}</td></tr>
            <tr><td className="left-col">Color</td><td className="right-col">{vehicleData.color}</td></tr>
            <tr><td className="left-col">Año</td><td className="right-col">{vehicleData.ano}</td></tr>
            <tr><td className="left-col">Chasis</td><td className="right-col">{vehicleData.chasis}</td></tr>
            <tr><td className="left-col">Fecha Expiración</td><td className="right-col">{vehicleData.fecha_expiracion}</td></tr>
          </tbody>
        </table>
      </div>

      <div id="footer">Dirección General de Impuestos Internos</div>
    </div>
  );
}
