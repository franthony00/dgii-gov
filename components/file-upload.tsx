"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("Ningún archivo seleccionado");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }, []);

  const handleFile = (file: File) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imágenes (JPG, PNG, WEBP) o documentos PDF");
      return;
    }

    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
  };

  return (
    <Card className="p-8 border bg-white shadow-lg rounded-2xl">
      {/* Título */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Escanear Documento</h2>
        <p className="text-sm text-muted-foreground">{fileName}</p>
      </div>

      {/* Área de carga */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center gap-4
          ${
            dragActive
              ? "border-primary bg-primary/5 shadow-inner scale-[1.01]"
              : "border-gray-300 hover:border-primary hover:bg-muted/30"
          }
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Input invisible */}
        <input
          type="file"
          onChange={handleChange}
          accept="image/*,application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Loading */}
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Procesando documento…</p>
          </div>
        ) : preview ? (
          // Vista previa
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Vista previa"
              className="max-h-56 rounded-xl border shadow-md"
            />
            <p className="text-sm font-medium text-primary">
              Documento listo para analizar
            </p>
          </div>
        ) : (
          // Estado inicial
          <div className="flex flex-col items-center gap-5">
            <div className="flex gap-6">
              <Upload className="h-12 w-12 text-gray-400" />
              <ImageIcon className="h-12 w-12 text-gray-400" />
              <FileText className="h-12 w-12 text-gray-400" />
            </div>

            <div className="text-center space-y-1">
              <p className="font-medium text-gray-700 text-lg">
                Arrastra tu archivo aquí
              </p>
              <p className="text-sm text-muted-foreground">
                o selecciona uno manualmente
              </p>
            </div>

            <Button variant="outline" className="px-6 py-2 text-base rounded-xl">
              Seleccionar Archivo
            </Button>

            <p className="text-xs text-muted-foreground mt-2">
              Formatos permitidos: JPG, PNG, WEBP, PDF
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
