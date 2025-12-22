import "../globals.css"; // Ruta corregida asumiendo que está en app/globals.css
import "./dgii.css"; 

import { Suspense } from "react";
// Importación corregida a inglés y con guiones (sin espacios)
import { ViewerContent } from "@/components/viewer-content";

function LoadingFallback() {
  return (
    <div className="container">
      {/* HEADER DGII - Identificadores coincidentes con dgii.css */}
      <div id="header">
        <img
          src="/placa-provisional-header.png" 
          alt="PLACA PROVISIONAL"
        />
      </div>

      {/* TÍTULOS - En inglés para consistencia */}
      <div id="title">
        <span className="title-orange">Datamatrix System</span>
        <h1 className="title-green">Document Validation</h1>
      </div>

      {/* CONTENIDO DE CARGA */}
      <div id="content">
        <p style={{ padding: "20px 0", color: "#666" }}>Loading official information...</p>
      </div>

      {/* FOOTER */}
      <footer id="footer">
        General Directorate of Internal Taxes (DGII)
      </footer>
    </div>
  );
}

export default function VerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* El componente ViewerContent ahora usará los mismos IDs del CSS */}
      <ViewerContent />
    </Suspense>
  );
}
