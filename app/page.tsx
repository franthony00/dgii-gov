"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FileUpload } from "@/components/file-upload";
import { VehicleDataForm } from "@/components/vehicle-data-form";
import { QRGenerator } from "@/components/qr-generator";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { AlertCircle, CheckCircle2, ScanLine, RotateCcw } from "lucide-react";

import type { OCRResult } from "@/lib/types";
import { processOCRText, validateOCRResult } from "@/lib/ocr-utils";

import Tesseract from "tesseract.js";

export default function ScannerPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [step, setStep] = useState<"upload" | "review" | "qr">("upload");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // ============================================================
  // 1) PROCESAR ARCHIVO CON OCR
  // ============================================================
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setValidationError(null);

    try {
      const result = await Tesseract.recognize(file, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`[OCR] ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const processedData = processOCRText(result.data.text);

      const validation = validateOCRResult(processedData);

      if (!validation.valid) {
        setValidationError(
          `No se detectaron algunos campos: ${validation.missing.join(", ")}. Completa los datos manualmente.`
        );
      }

      setOcrResult(processedData);
      setStep("review");
    } catch (error) {
      console.error("Error OCR:", error);
      setValidationError("Error al procesar el documento. Prueba otra imagen.");
      setOcrResult({});
      setStep("review");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // 2) ENVIAR DATOS A API → Guardar en PostgreSQL
  // ============================================================
  const handleSubmit = async (data: OCRResult) => {
    setIsProcessing(true);
    setValidationError(null);

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
          ano: data.año, // EN DB ES ano (sin ñ)
          chasis: data.chasis,
          fechaExpiracion: data.fechaExpiracion,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error desconocido");
      }

      setGeneratedCode(result.codigo);
      setStep("qr");
    } catch (err) {
      console.error(err);
      setValidationError("Hubo un error guardando los datos.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // 3) Reiniciar proceso
  // ============================================================
  const handleReset = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setValidationError(null);
    setStep("upload");
    setGeneratedCode(null);
  };

  const clientUrl =
    typeof window !== "undefined" && generatedCode
      ? `${window.location.origin}/ver?c=${generatedCode}`
      : "";

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-12">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-4xl font-bold mb-3">Sistema de Escáner de Documentos</h1>
          <p className="text-muted-foreground text-lg">
            Sube una imagen o PDF para extraer automáticamente la información vehicular
          </p>
        </div>

        {/* PASOS */}
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

        {/* CONTENIDO */}
        {step === "upload" && <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />}

        {step === "review" && ocrResult && (
          <div className="space-y-6">
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">Información detectada</h2>
              </div>

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
              <AlertTitle>¡Documento procesado correctamente!</AlertTitle>
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
  );
}
