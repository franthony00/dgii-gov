"use client";

import { useEffect, useState } from "react";

export function ViewerContent({ code }: { code: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/vehiculo/get?code=${code}`);

        if (!res.ok) {
          setError("Server error loading data.");
          return;
        }

        const json = await res.json();

        if (!json.success) {
          setError("Invalid or not found code.");
          return;
        }

        setData(json.data);
      } catch (err) {
        setError("Could not connect to server.");
      }
    }

    fetchData();
  }, [code]);

  if (error) {
    return (
      <div style={{ padding: 20, color: "red", fontWeight: "bold" }}>
        {error}
      </div>
    );
  }

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

      <footer id="footer">
        General Directorate of Internal Taxes (DGII)
      </footer>
    </div>
  );
}
