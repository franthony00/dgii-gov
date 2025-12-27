"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { VehicleDataForm } from "@/components/vehicle-data-form";
import { QRGenerator } from "@/components/qr-generator";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ScanLine, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";

import type { OCRResult } from "@/lib/types";
import { processOCRText, validateOCRResult } from "@/lib/ocr-utils";
import Tesseract from "tesseract.js";

export default function ScannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [step, setStep] = useState<"upload" | "review" | "qr">("upload");

  // ============================================================
  // OCR
  // ============================================================
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setValidationError(null);
    setIsProcessing(true);

    try {
      const res = await Tesseract.recognize(file, "spa", {
        logger: (m) => console.log(m),
      });

      const processed = processOCRText(res.data.text);
      const validation = validateOCRResult(processed);

      if (!validation.valid) {
        setValidationError(
          `Faltan campos por detectar: ${validation.missing.join(", ")}`
        );
      }

      setOcrResult(processed);
      setStep("review");
    } catch (err) {
      console.error(err);
      setValidationError("No se pudo procesar el documento.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // GUARDAR EN BASE DE DATOS
  // ============================================================
  const handleSubmit = async (data: OCRResult) => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/vehiculo/create", {
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

      const json = await res.json();
      setGeneratedCode(json.codigo);
      setStep("qr");
    } catch (e) {
      setValidationError("Error guardando la información.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // REINICIAR
  // ============================================================
  const reset = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setGeneratedCode(null);
    setValidationError(null);
    setStep("upload");
  };

  const clientUrl =
    typeof window !== "undefined" && generatedCode
      ? `${window.location.origin}/ver?c=${generatedCode}`
      : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 py-16">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-14">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow">
            <ScanLine className="w-8 h-8" />
          </div>

          <h1 className="text-4xl font-bold mt-6 tracking-tight text-gray-800">
            Sistema de Escáner de Documentos
          </h1>

          <p className="text-gray-500 text-lg mt-2">
            Sube, revisa y valida información vehicular automáticamente.
          </p>
        </div>

        {/* PASOS */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-6 text-gray-600">

            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 flex items-center justify-center rounded-full 
                ${step === "upload" ? "bg-blue-600 text-white shadow" : "bg-gray-200"}`}>
                1
              </div>
              <span className="hidden sm:block">Subir</span>
            </div>

            <div className="w-12 h-[2px] bg-gray-300"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 flex items-center justify-center rounded-full 
                ${step === "review" ? "bg-blue-600 text-white shadow" : "bg-gray-200"}`}>
                2
              </div>
              <span className="hidden sm:block">Revisar</span>
            </div>

            <div className="w-12 h-[2px] bg-gray-300"></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 flex items-center justify-center rounded-full 
                ${step === "qr" ? "bg-blue-600 text-white shadow" : "bg-gray-200"}`}>
                3
              </div>
              <span className="hidden sm:block">QR</span>
            </div>
          </div>
        </div>

        {/* STEP: UPLOAD */}
        {step === "upload" && (
          <Card className="p-8 shadow-xl bg-white border border-gray-200 rounded-2xl">
            <FileUpload
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />
          </Card>
        )}

        {/* STEP: REVIEW */}
        {step === "review" && (
          <div className="space-y-6">

            {validationError && (
              <Alert variant="destructive" className="shadow">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Error en el documento</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <Card className="p-8 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
                <CheckCircle2 className="h-5 w-5" />
                Información detectada
              </h2>

              <VehicleDataForm
                initialData={ocrResult!}
                onSubmit={handleSubmit}
                onCancel={reset}
                isProcessing={isProcessing}
              />
            </Card>
          </div>
        )}

        {/* STEP: QR */}
        {step === "qr" && (
          <div className="space-y-6">

            <Alert className="bg-green-50 border-green-400 shadow">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle>¡Documento procesado!</AlertTitle>
              <AlertDescription>
                Código generado: <strong className="font-mono">{generatedCode}</strong>
              </AlertDescription>
            </Alert>

            <Card className="p-8 shadow-xl">
              <QRGenerator url={clientUrl} codigo={generatedCode!} />
            </Card>

            <div className="flex justify-center">
              <Button size="lg" className="mt-3" onClick={reset}>
                <RotateCcw className="h-5 w-5 mr-2" />
                Escanear otro documento
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
