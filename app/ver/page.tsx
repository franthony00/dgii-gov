import "../../styles/globals.css";
import "./dgii.css";

import { Suspense } from "react";
import ViewerContent from "@/components/viewer-content";

function LoadingFallback() {
  return (
    <div className="dgii-container">
      {/* HEADER DGII */}
      <div className="dgii-header-green">
        <img
          src="/placa-provisional-header.png"
          alt="PLACA PROVISIONAL"
          className="header-image"
        />
      </div>

      {/* TÍTULOS */}
      <div className="dgii-title">
        <span className="title-orange">Sistema Datamatrix</span>
        <span className="title-green">Validación de Documentos</span>
      </div>

      {/* CONTENIDO */}
      <div className="dgii-content">
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
