import "../../styles/globals.css";
import "./dgii.css"; 
import { Suspense } from "react";
import ViewerContent from "@/components/viewer-content";

function LoadingFallback() {
  return (
    <div>

      {/* HEADER DGII */}
      <div id="header">
        <img src="/placa-provisional-header.png" alt="PLACA PROVISIONAL" />
      </div>

      {/* TITULOS DGII */}
      <div id="title">
        <span className="title-orange">Sistema Datamatrix</span>
        <span className="title-green">Validación de Documentos</span>
      </div>

      {/* MENSAJE DE CARGA */}
      <div id="content">
        <p>Cargando información...</p>
      </div>

    </div>
  );
}

export default function VerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ViewerContent />
    </Suspense>
  );
}
