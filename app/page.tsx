"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { VehicleDataForm } from "@/components/vehicle-data-form"
import { QRGenerator } from "@/components/qr-generator"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, ScanLine, RotateCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { OCRResult } from "@/lib/types"
import { processOCRText, validateOCRResult } from "@/lib/ocr-utils"
import Tesseract from "tesseract.js"

export default function ScannerPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [step, setStep] = useState<"upload" | "review" | "qr">("upload")
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // ============================================
  // 1) Procesar el archivo con OCR
  // ============================================
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setIsProcessing(true)
    setValidationError(null)

    try {
      const result = await Tesseract.recognize(file, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`[v0] OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        },
      })

      const processedData = processOCRText(result.data.text)
      const validation = validateOCRResult(processedData)

      if (!validation.valid) {
        setValidationError(
          `No se detectaron algunos campos: ${validation.missing.join(
            ", "
          )}. Revisa y completa manualmente.`
        )
      }

      setOcrResult(processedData)
      setStep("review")
    } catch (error) {
      console.error("Error OCR:", error)
      setValidationError("No se pudo procesar el documento. Intenta otro archivo.")
      setOcrResult({})
      setStep("review")
    } finally {
      setIsProcessing(false)
    }
  }

  // ============================================
  // 2) Enviar datos al backend y guardar en PostgreSQL
  // ============================================
  const handleSubmit = async (data: OCRResult) => {
    setIsProcessing(true)
    setValidationError(null)

    try {
      const response = await fetch("/api/vehiculo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa: data.placa,
          tipoVehiculo: data.tipoVehiculo,
          marca: data.marca,
          modelo: data.modelo,
          color: data.color,
          ano: data.año, // IMPORTANTE: en DB es "ano"
          chasis: data.chasis,
          fechaExpiracion: data.fechaExpiracion,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error desconocido al guardar")
      }

      setGeneratedCode(result.codigo) // recibiendo el código generado por la API
      setStep("qr")
    } catch (error) {
      console.error(error)
      setValidationError("Hubo un error guardando los datos. Intenta nuevamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  // ============================================
  // 3) Reiniciar proceso
  // ============================================
  const handleReset = () => {
    setSelectedFile(null)
    setOcrResult(null)
    setValidationError(null)
    setStep("upload")
    setGeneratedCode(null)
  }

  const clientUrl =
    typeof window !== "undefined" && generatedCode
      ? `${window.location.origin}/ver?c=${generatedCode}`
      : ""

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Sistema de Escáner de Documentos</h1>
          <p className="text-muted-foreground text-lg">
            Sube una imagen o PDF de tu documento vehicular para extraer la información automáticamente
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["upload", "review", "qr"].map((s, i) => (
            <div key={s} className={`flex items-center gap-2 ${step === s ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === s ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className="font-medium hidden sm:inline">
                {s === "upload" ? "Subir" : s === "review" ? "Revisar" : "QR"}
              </span>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        {step === "upload" && (
          <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        )}

        {step === "review" && ocrResult && (
          <div className="space-y-6">
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atención</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" /> Información Extraída
              </h2>

              <VehicleDataForm
                initialData={ocrResult}
                onSubmit={handleSubmit}
                onCancel={handleReset}
                isProcessing={isProcessing}
              />
            </Card>
          </div>
        )}

        {step === "qr" && generatedCode && (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">¡Documento procesado!</AlertTitle>
              <AlertDescription>
                Código generado: <strong className="font-mono">{generatedCode}</strong>
              </AlertDescription>
            </Alert>

            <QRGenerator url={clientUrl} codigo={generatedCode} />

            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" /> Escanear otro documento
              </Button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
