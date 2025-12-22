import "../../styles/globals.css";
// Nota: Si ya pusiste todo en globals.css, quizás no necesites dgii.css, 
// pero lo mantenemos por si tienes estilos específicos ahí.
import "./dgii.css"; 

import { Suspense } from "react";
import ViewerContent from "@/components/viewer-content";

function LoadingFallback() {
  return (
    <div className="container"> {/* Cambiado a 'container' según el CSS unificado */}
      
      {/* HEADER DGII con imagen integrada */}
      <div id="header">
        <img
          src="/placa-provisional-header.png" 
          alt="PLACA PROVISIONAL"
          className="header-img"
        />
      </div>

      {/* TÍTULOS */}
      <div id="title">
        <span className="title-orange">Sistema Datamatrix</span>
        <h1 className="title-green">Validación de Documentos</h1>
      </div>

      {/* CONTENIDO DE CARGA */}
      <div id="content">
        <p style={{ padding: "20px 0", color: "#666" }}>Cargando información oficial...</p>
      </div>

      {/* FOOTER (Opcional en fallback para que no salte el diseño) */}
      <footer id="footer">
        Dirección General de Impuestos Internos
      </footer>
    </div>
  );
}

export default function VerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* Asegúrate de que ViewerContent use los mismos IDs (#header, #title, #content) */}
      <ViewerContent />
    </Suspense>
  );
}
