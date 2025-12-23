"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { VehicleDataForm } from "@/components/vehicle-data-form";
import { QRGenerator } from "@/components/qr-generator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ScanLine, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  // ============================================
  // 1) PROCESAR OCR
  // ============================================
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setValidationError(null);

    try {
      const result = await Tesseract.recognize(file, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log("OCR:", Math.round(m.progress * 100) + "%");
          }
        },
      });

      const processed = processOCRText(result.data.text);
      const validation = validateOCRResult(processed);

      if (!validation.valid) {
        setValidationError(
          `Faltan campos por detectar: ${validation.missing.join(", ")}`
        );
      }

      setOcrResult(processed);
      setStep("review");
    } catch (error) {
      setValidationError("No se pudo procesar este documento.");
      setOcrResult({});
      setStep("review");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================
  // 2) GUARDAR EN POSTGRES
  // ============================================
  const handleSubmit = async (data: OCRResult) => {
    setIsProcessing(true);
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
          ano: data.año,
          chasis: data.chasis,
          fechaExpiracion: data.fechaExpiracion,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error guardando");
      }

      setGeneratedCode(result.codigo);
      setStep("qr");
    } catch (err) {
      setValidationError("Error guardando la información.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================
  // 3) REINICIAR
  // ============================================
  const handleReset = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setValidationError(null);
    setGeneratedCode(null);
    setStep("upload");
  };

  const clientUrl =
    typeof window !== "undefined" && generatedCode
      ? `${window.location.origin}/ver?c=${generatedCode}`
      : "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Sistema de Escáner de Documentos
          </h1>
          <p className="text-muted-foreground text-lg">
            Sube un documento para extraer automáticamente la información
          </p>
        </div>

        {/* INDICADOR DE PASOS */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["Subir", "Revisar", "QR"].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === ["upload", "review", "qr"][index]
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <span className="font-medium hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        {/* SUBIR ARCHIVO */}
        {step === "upload" && (
          <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        )}

        {/* REVISAR DATOS */}
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
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Información detectada
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

        {/* QR GENERADO */}
        {step === "qr" && generatedCode && (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>¡Documento procesado!</AlertTitle>
              <AlertDescription>
                Código generado:{" "}
                <strong className="font-mono">{generatedCode}</strong>
              </AlertDescription>
            </Alert>

            <QRGenerator url={clientUrl} codigo={generatedCode} />

            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Escanear otro
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
