"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isProcessing?: boolean
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]

    if (!validTypes.includes(file.type)) {
      alert("Por favor sube una imagen (JPG, PNG, WEBP) o PDF")
      return
    }

    // Crear preview para imágenes
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    onFileSelect(file)
  }

  return (
    <Card className="p-8">
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="image/*,application/pdf"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Procesando documento...</p>
            <p className="text-sm text-muted-foreground">Extrayendo información del documento</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-4">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-48 rounded-lg border shadow-sm" />
            <p className="text-sm text-muted-foreground">Documento cargado correctamente</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3 justify-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">Arrastra tu documento aquí</p>
              <p className="text-sm text-muted-foreground">o haz clic para seleccionar un archivo</p>
            </div>

            <Button type="button" variant="outline" className="mt-2 bg-transparent">
              Seleccionar Archivo
            </Button>

            <p className="text-xs text-muted-foreground mt-4">Formatos soportados: JPG, PNG, WEBP, PDF</p>
          </div>
        )}
      </div>
    </Card>
  )
}
