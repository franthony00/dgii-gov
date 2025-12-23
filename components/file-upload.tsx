"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, ExternalLink } from "lucide-react"

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), { ssr: false })

interface QRGeneratorProps {
  url: string
  codigo: string
}

export function QRGenerator({ url, codigo }: QRGeneratorProps) {
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("L")
  const [size, setSize] = useState(400)
  const [border, setBorder] = useState(1)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const downloadQR = () => {
    const svg = document.getElementById("qr-code") as HTMLElement
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-${codigo}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (!isMounted) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Código QR Generado</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg border-2 border-border w-full max-w-[300px] h-[300px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Generando QR...</div>
            </div>
          </div>
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Código QR Generado</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Escanea este código QR para acceder directamente a la información del vehículo
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border-2 border-border">
            <QRCodeSVG
              id="qr-code"
              value={url}
              size={size}
              level={errorLevel}
              marginSize={border}
              className="w-full h-auto max-w-[300px]"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={downloadQR} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Página
              </a>
            </Button>
          </div>
        </div>

        {/* QR Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="error-level">Error Correction Code</Label>
            <Select value={errorLevel} onValueChange={(value: any) => setErrorLevel(value)}>
              <SelectTrigger id="error-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L (Bajo - 7%)</SelectItem>
                <SelectItem value="M">M (Medio - 15%)</SelectItem>
                <SelectItem value="Q">Q (Alto - 25%)</SelectItem>
                <SelectItem value="H">H (Muy Alto - 30%)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Nivel recomendado: L. Mayor corrección de errores = QR más denso
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="border">Border (Margen)</Label>
            <Select value={border.toString()} onValueChange={(value) => setBorder(Number.parseInt(value))}>
              <SelectTrigger id="border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (Sin margen)</SelectItem>
                <SelectItem value="1">1 (Recomendado)</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size (Tamaño en píxeles)</Label>
            <Select value={size.toString()} onValueChange={(value) => setSize(Number.parseInt(value))}>
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">200 px</SelectItem>
                <SelectItem value="300">300 px</SelectItem>
                <SelectItem value="400">400 px (Recomendado)</SelectItem>
                <SelectItem value="500">500 px</SelectItem>
                <SelectItem value="600">600 px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">URL de acceso:</p>
            <code className="text-xs bg-muted p-2 rounded block break-all">{url}</code>
          </div>
        </div>
      </div>
    </Card>
  )
}
