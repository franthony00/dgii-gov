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
  const [fileName, setFileName] = useState<string>("Sin archivo seleccionado");

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
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

    if (!validTypes.includes(file.type)) {
      alert("Por favor sube una imagen (JPG, PNG, WEBP) o un PDF");
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
    <Card className="p-6 border bg-white shadow-sm">
      <div className="text-center mb-4">
        <p className="font-medium text-lg">Sube tu documento</p>
        <p className="text-sm text-muted-foreground">{fileName}</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-10 transition-all cursor-pointer 
          flex flex-col items-center justify-center
          ${dragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}
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
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Procesando documento…</p>
          </div>
        ) : preview ? (
          // PREVIEW
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Vista previa"
              className="max-h-48 rounded-md border shadow-sm"
            />
            <p className="text-sm text-muted-foreground">Documento cargado correctamente</p>
          </div>
        ) : (
          // ICONOS Y TEXTO
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <Upload className="h-10 w-10 text-gray-400" />
              <ImageIcon className="h-10 w-10 text-gray-400" />
              <FileText className="h-10 w-10 text-gray-400" />
            </div>

            <div className="text-center">
              <p className="font-medium text-gray-700">Arrastra tu archivo aquí</p>
              <p className="text-sm text-muted-foreground">o haz clic para seleccionarlo</p>
            </div>

            <Button variant="outline" className="bg-white">
              Seleccionar Archivo
            </Button>

            <p className="text-xs text-muted-foreground">
              Formatos soportados: JPG, PNG, WEBP, PDF
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

