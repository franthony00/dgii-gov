"use client"

import React, { useState } from "react"
import { Upload, Image as ImageIcon, FileText, Search } from "lucide-react"

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div className="container">
      {/* HEADER TIPO DGII */}
      <div id="header">
        <img src="/placa-provisional-header.png" alt="DGII" style={{ height: '40px' }} />
      </div>

      <div id="title">
        <span className="title-orange">Sistema de Escáner</span>
        <h1 className="title-green">Extracción de Documentos Vehiculares</h1>
        <p style={{ color: "#666", marginTop: "10px" }}>
          Sube una imagen o PDF para extraer la información automáticamente.
        </p>
      </div>

      <div id="content">
        <div 
          style={{
            border: isDragging ? "2px dashed #7daf18" : "2px dashed #ccc",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            backgroundColor: isDragging ? "#f0fdf4" : "#fafafa",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "15px" }}>
            <Upload size={40} color={isDragging ? "#7daf18" : "#666"} />
            <ImageIcon size={40} color="#666" />
            <FileText size={40} color="#666" />
          </div>

          <h3 style={{ fontSize: "1.2rem", color: "#333", marginBottom: "10px" }}>
            Arrastra tu documento aquí
          </h3>
          <p style={{ color: "#888", marginBottom: "20px" }}>
            o haz clic para seleccionar un archivo
          </p>

          <input 
            type="file" 
            id="fileInput" 
            style={{ display: "none" }} 
            accept="image/*,.pdf" 
          />
          <button 
            onClick={() => document.getElementById('fileInput')?.click()}
            style={{
              backgroundColor: "#7daf18",
              color: "white",
              padding: "10px 25px",
              borderRadius: "5px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Seleccionar Archivo
          </button>

          <p style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
            Formatos soportados: JPG, PNG, WEBP, PDF
          </p>
        </div>

        {/* PASOS DEL PROCESO */}
        <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <div style={{ textAlign: "center", padding: "15px", background: "#efefef", borderRadius: "5px" }}>
            <span style={{ fontWeight: "bold", display: "block", color: "#d58f00" }}>1. Subir</span>
            <small>Carga el documento</small>
          </div>
          <div style={{ textAlign: "center", padding: "15px", background: "#efefef", borderRadius: "5px" }}>
            <span style={{ fontWeight: "bold", display: "block", color: "#d58f00" }}>2. Revisar</span>
            <small>Verifica los datos</small>
          </div>
          <div style={{ textAlign: "center", padding: "15px", background: "#efefef", borderRadius: "5px" }}>
            <span style={{ fontWeight: "bold", display: "block", color: "#d58f00" }}>3. Generar</span>
            <small>Crea el código QR</small>
          </div>
        </div>
      </div>

      <div id="footer">Dirección General de Impuestos Internos</div>
    </div>
  )
}
