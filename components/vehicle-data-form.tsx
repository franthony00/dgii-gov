"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OCRResult } from "@/lib/types"
import { Save, X } from "lucide-react"

interface VehicleDataFormProps {
  initialData: OCRResult
  onSubmit: (data: OCRResult) => void
  onCancel: () => void
  isProcessing?: boolean
}

export function VehicleDataForm({ initialData, onSubmit, onCancel, isProcessing }: VehicleDataFormProps) {
  const [formData, setFormData] = useState<OCRResult>(initialData)

  const handleChange = (field: keyof OCRResult, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const fields = [
    { key: "placa", label: "Placa", placeholder: "Ej: ABC-1234" },
    { key: "tipoVehiculo", label: "Tipo de Vehículo", placeholder: "Ej: Automóvil" },
    { key: "marca", label: "Marca", placeholder: "Ej: Toyota" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: Corolla" },
    { key: "color", label: "Color", placeholder: "Ej: Blanco" },
    { key: "año", label: "Año", placeholder: "Ej: 2023" },
    { key: "chasis", label: "Chasis", placeholder: "Ej: 1HGBH41JXMN109186" },
    { key: "fechaExpiracion", label: "Fecha de Expiración", placeholder: "Ej: 31/12/2024" },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label} <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.key}
              value={formData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              required
              className={!formData[field.key] ? "border-orange-300" : ""}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isProcessing}>
          <Save className="h-4 w-4 mr-2" />
          {isProcessing ? "Guardando..." : "Guardar y Generar Código"}
        </Button>
      </div>
    </form>
  )
}
