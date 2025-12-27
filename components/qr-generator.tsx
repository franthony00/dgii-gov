"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ExternalLink, QrCode } from "lucide-react";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

interface QRGeneratorProps {
  url: string;
  codigo: string;
}

export function QRGenerator({ url, codigo }: QRGeneratorProps) {
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("L");
  const [size, setSize] = useState(400);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const downloadQR = () => {
    const svg = document.getElementById("qr-code") as HTMLElement | null;
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
        <h3 className="text-xl font-semibold mb-2">Generando código QR…</h3>
        <p className="text-muted-foreground animate-pulse">Cargando…</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-lg border rounded-2xl">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <QrCode className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Código QR Generado</h3>
          <p className="text-sm text-muted-foreground">
            Escanea el QR para visualizar los datos del vehículo.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* ---------------- QR ---------------- */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <QRCodeSVG
              id="qr-code"
              value={url}
              size={size}
              level={errorLevel}
              fgColor={fgColor}
              bgColor={bgColor}
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Código único:{" "}
            <span className="font-mono font-semibold text-primary">
              {codigo}
            </span>
          </p>

          <div className="mt-5 flex gap-3">
            <Button onClick={downloadQR} variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" /> Descargar
            </Button>

            <Button asChild size="lg">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Ver Página
              </a>
            </Button>
          </div>
        </div>

        {/* ---------------- CONFIGURACIÓN ---------------- */}
        <div className="bg-muted/40 p-6 rounded-xl border shadow-inner space-y-6">
          <h4 className="text-lg font-semibold">Personalización del QR</h4>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color del QR</Label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-16 h-10 border rounded cursor-pointer"
            />
          </div>

          {/* Background */}
          <div className="space-y-2">
            <Label>Color de Fondo</Label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-16 h-10 border rounded cursor-pointer"
            />
          </div>

          {/* Error Level */}
          <div className="space-y-2">
            <Label>Nivel de Corrección</Label>
            <Select
              value={errorLevel}
              onValueChange={(val: "L" | "M" | "Q" | "H") => setErrorLevel(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L — Bajo</SelectItem>
                <SelectItem value="M">M — Medio</SelectItem>
                <SelectItem value="Q">Q — Alto</SelectItem>
                <SelectItem value="H">H — Máximo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label>Tamaño del QR</Label>
            <Select
              value={size.toString()}
              onValueChange={(val) => setSize(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tamaño" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">200 px</SelectItem>
                <SelectItem value="300">300 px</SelectItem>
                <SelectItem value="400">400 px</SelectItem>
                <SelectItem value="500">500 px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
