"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { VehicleDataForm } from "@/components/vehicle-data-form"
import { QRGenerator } from "@/components/qr-generator"
import { AlertCircle, CheckCircle2, ScanLine, RotateCcw } from "lucide-react"
import type { OCRResult } from "@/lib/types"
import { processOCRText, validateOCRResult } from "@/lib/ocr-utils"
import { saveVehicleData } from "@/lib/storage"
import Tesseract from "tesseract.js"

export default function ScannerPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [step, setStep] = useState<"upload" | "review" | "qr">("upload")
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setIsProcessing(true)
    setValidationError(null)

    try {
      const result = await Tesseract.recognize(file, "spa")
      const processedData = processOCRText(result.data.text)
      const validation = validateOCRResult(processedData)

      if (!validation.valid) {
        setValidationError(`No se pudieron detectar: ${validation.missing.join(", ")}.`);
      }

      setOcrResult(processedData)
      setStep("review")
    } catch (error) {
      setValidationError("Error al procesar el documento.");
      setOcrResult({})
      setStep("review")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (data: OCRResult) => {
    setIsProcessing(true)
    try {
      const codigo = await saveVehicleData({
        placa: data.placa || "",
        tipoVehiculo: data.tipoVehiculo || "",
        marca: data.marca || "",
        modelo: data.modelo || "",
        color: data.color || "",
        año: data.año || "",
        chasis: data.chasis || "",
        fechaExpiracion: data.fechaExpiracion || "",
      })
      setGeneratedCode(codigo)
      setStep("qr")
    } catch (error) {
      setValidationError("Error al guardar.");
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setOcrResult(null)
    setValidationError(null)
    setStep("upload")
    setGeneratedCode(null)
  }

  const clientUrl = typeof window !== "undefined" && generatedCode ? `${window.location.origin}/ver?c=${generatedCode}` : ""

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header con estilo DGII */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", padding: "15px", borderRadius: "50%", backgroundColor: "#e2e8f0", marginBottom: "15px" }}>
            <ScanLine size={32} color="#475569" />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "10px" }}>
            Sistema de Escáner de Documentos
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            Sube una imagen o PDF de tu documento vehicular para extraer la información automáticamente
          </p>
        </div>

        {/* Indicador de Pasos (Step Indicator) */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          {[
            { id: "upload", label: "Subir", num: 1 },
            { id: "review", label: "Revisar", num: 2 },
            { id: "qr", label: "QR", num: 3 }
          ].map((s, i, arr) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "35px", height: "35px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: step === s.id ? "#1e293b" : "white",
                color: step === s.id ? "white" : "#64748b",
                border: "2px solid " + (step === s.id ? "#1e293b" : "#e2e8f0"),
                fontWeight: "bold"
              }}>
                {s.num}
              </div>
              <span style={{ fontWeight: "500", color: step === s.id ? "#1e293b" : "#64748b" }}>{s.label}</span>
              {i < arr.length - 1 && <div style={{ width: "40px", height: "2px", backgroundColor: "#e2e8f0" }} />}
            </div>
          ))}
        </div>

        {/* Contenido Dinámico */}
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          
          {step === "upload" && (
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          )}

          {step === "review" && ocrResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {validationError && (
                <div style={{ padding: "15px", backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444", color: "#b91c1c", borderRadius: "4px" }}>
                  <strong>Atención:</strong> {validationError}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <CheckCircle2 color="#16a34a" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Información Extraída</h2>
              </div>
              <VehicleDataForm
                initialData={ocrResult}
                onSubmit={handleSubmit}
                onCancel={handleReset}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {step === "qr" && generatedCode && (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ padding: "15px", backgroundColor: "#f0fdf4", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                ¡Documento procesado! Código generado: <strong>{generatedCode}</strong>
              </div>
              <QRGenerator url={clientUrl} codigo={generatedCode} />
              <button 
                onClick={handleReset}
                style={{
                  marginTop: "20px", padding: "10px 20px", borderRadius: "6px", border: "1px solid #e2e8f0", 
                  backgroundColor: "white", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <RotateCcw size={16} style={{ marginRight: "8px" }} /> Escanear otro
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
