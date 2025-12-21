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
      // Realizar OCR con Tesseract.js
      const result = await Tesseract.recognize(file, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`[v0] OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        },
      })

      // Procesar el texto con nuestras utilidades
      const processedData = processOCRText(result.data.text)

      // Validar los resultados
      const validation = validateOCRResult(processedData)

      if (!validation.valid) {
        setValidationError(
          `No se pudieron detectar algunos campos: ${validation.missing.join(", ")}. Por favor, revisa y completa la información manualmente.`,
        )
      }

      setOcrResult(processedData)
      setStep("review")
    } catch (error) {
      console.error("Error en OCR:", error)
      setValidationError(
        "Error al procesar el documento. Por favor, intenta con otra imagen o completa los datos manualmente.",
      )
      setOcrResult({})
      setStep("review")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (data: OCRResult) => {
    setIsProcessing(true)

    try {
      // Guardar en la base de datos
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
      setIsProcessing(false)
    } catch (error) {
      console.error("Error al guardar:", error)
      setValidationError("Error al guardar los datos. Por favor, intenta nuevamente.")
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

  const clientUrl =
    typeof window !== "undefined" && generatedCode ? `${window.location.origin}/ver?c=${generatedCode}` : ""

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-balance">Sistema de Escáner de Documentos</h1>
          <p className="text-muted-foreground text-lg text-balance">
            Sube una imagen o PDF de tu documento vehicular para extraer la información automáticamente
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === "upload" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
              }`}
            >
              1
            </div>
            <span className="font-medium hidden sm:inline">Subir</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step === "review" ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === "review" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
              }`}
            >
              2
            </div>
            <span className="font-medium hidden sm:inline">Revisar</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step === "qr" ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === "qr" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
              }`}
            >
              3
            </div>
            <span className="font-medium hidden sm:inline">QR</span>
          </div>
        </div>

        {/* Content */}
        {step === "upload" && <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />}

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
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">Información Extraída</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Revisa y completa la información detectada del documento. Los campos marcados son obligatorios.
              </p>

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
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-200">¡Documento procesado exitosamente!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Se ha generado el código <strong className="font-mono">{generatedCode}</strong> para este vehículo.
              </AlertDescription>
            </Alert>

            <QRGenerator url={clientUrl} codigo={generatedCode} />

            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Escanear otro documento
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
