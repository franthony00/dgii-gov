import type { OCRResult } from "./types"

// Patrones de expresiones regulares para extraer información
const patterns = {
  placa: /(?:PLACA|PLATE|N[OÚ]MERO)[\s:]*([A-Z0-9-]{5,10})/i,
  tipoVehiculo: /(?:TIPO|TYPE|CLASE|CLASS)[\s:]*([A-ZÁ-Ú\s]+?)(?:\n|MARCA|$)/i,
  marca: /(?:MARCA|MAKE|BRAND)[\s:]*([A-ZÁ-Ú\s]+?)(?:\n|MODELO|$)/i,
  modelo: /(?:MODELO|MODEL)[\s:]*([A-ZÁ-Ú0-9\s]+?)(?:\n|COLOR|AÑO|$)/i,
  color: /(?:COLOR|COLOUR)[\s:]*([A-ZÁ-Ú\s]+?)(?:\n|AÑO|CHASIS|$)/i,
  año: /(?:AÑO|YEAR|ANO)[\s:]*(\d{4})/i,
  chasis: /(?:CHASIS|CHASSIS|VIN)[\s:]*([A-Z0-9]{10,17})/i,
  fechaExpiracion: /(?:EXPIRA|EXPIRAC[IÓ]N|VENCE|VÁLID[OA]\s+HASTA)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
}

// Normalizar formato de fecha
function normalizeDate(dateStr: string): string {
  // Convertir diferentes formatos de fecha a DD/MM/YYYY
  const parts = dateStr.split(/[-/]/)
  if (parts.length === 3) {
    let [day, month, year] = parts
    if (year.length === 2) {
      year = "20" + year
    }
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
  }
  return dateStr
}

// Procesar texto extraído del OCR
export function processOCRText(text: string): OCRResult {
  console.log("[v0] Procesando texto OCR:", text)

  const result: OCRResult = {}

  // Extraer cada campo usando los patrones
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match && match[1]) {
      let value = match[1].trim()

      // Normalizar el valor
      if (key === "fechaExpiracion") {
        value = normalizeDate(value)
      }

      result[key as keyof OCRResult] = value
    }
  }

  console.log("[v0] Resultado procesado:", result)
  return result
}

// Validar que los campos requeridos estén presentes
export function validateOCRResult(result: OCRResult): { valid: boolean; missing: string[] } {
  const requiredFields = ["placa", "tipoVehiculo", "marca", "modelo", "color", "año", "chasis", "fechaExpiracion"]
  const missing: string[] = []

  for (const field of requiredFields) {
    if (!result[field as keyof OCRResult]) {
      missing.push(field)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}
