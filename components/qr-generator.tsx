"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ExternalLink } from "lucide-react";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), { ssr: false });

interface QRGeneratorProps {
  url: string;
  codigo: string;
}

export function QRGenerator({ url, codigo }: QRGeneratorProps) {
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("L");
  const [size, setSize] = useState(400);
  const [border, setBorder] = useState(1);

  // 🎨 Colores del QR
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const downloadQR = () => {
    const svg = document.getElementById("qr-code") as HTMLElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${codigo}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!isMounted) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Código QR Generado</h3>
        <div className="animate-pulse text-muted-foreground">Generando QR...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Código QR Generado</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Escanea este código QR para acceder directamente a la información del vehículo.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR CODE */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border-2 border-border">
            <QRCodeSVG
              id="qr-code"
              value={url}
              size={size}
              level={errorLevel}
              fgColor={fgColor}
              bgColor={bgColor}
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

        {/* CONFIG */}
        <div className="space-y-4">

          {/* COLOR FG */}
          <div className="space-y-2">
            <Label>Color del QR</Label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-20 h-10 rounded border cursor-pointer"
            />
          </div>

          {/* COLOR BG */}
          <div className="space-y-2">
            <Label>Color de Fondo</Label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-20 h-10 rounded border cursor-pointer"
            />
          </div>

          {/* Error Level */}
          <div className="space-y-2">
            <Label htmlFor="error-level">Nivel de Corrección</Label>
            <Select value={errorLevel} onValueChange={(e: any) => setErrorLevel(e)}>
              <SelectTrigger id="error-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L (Bajo)</SelectItem>
                <SelectItem value="M">M (Medio)</SelectItem>
                <SelectItem value="Q">Q (Alto)</SelectItem>
                <SelectItem value="H">H (Máximo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label>Tamaño</Label>
            <Select value={size.toString()} onValueChange={(e) => setSize(parseInt(e))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">200px</SelectItem>
                <SelectItem value="300">300px</SelectItem>
                <SelectItem value="400">400px</SelectItem>
                <SelectItem value="500">500px</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>
    </Card>
  );
}
