"use client";

import { useEffect, useState } from "react";

export function ViewerContent({ codigo }: { codigo: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/vehiculo/get?codigo=${codigo}`);
      const json = await res.json();
      setData(json.data);
    }

    fetchData();
  }, [codigo]);

  if (!data) {
    return <div style={{ padding: 20 }}>Loading information...</div>;
  }

  return (
    <div className="container">
      <div id="header">
        <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
      </div>

      <div id="title">
        <span className="title-orange">Datamatrix System</span>
        <h1 className="title-green">Document Validation</h1>
      </div>

      <div id="content">

        <p><strong>Plate:</strong> {data.placa}</p>
        <p><strong>Brand:</strong> {data.marca}</p>
        <p><strong>Model:</strong> {data.modelo}</p>
        <p><strong>Color:</strong> {data.color}</p>
        <p><strong>Year:</strong> {data.ano}</p>
        <p><strong>Chassis:</strong> {data.chasis}</p>
        <p><strong>Expiration:</strong> {data.fecha_expiracion}</p>

      </div>

      <footer id="footer">General Directorate of Internal Taxes (DGII)</footer>
    </div>
  );
}
