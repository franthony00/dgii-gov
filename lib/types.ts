// Tipos para el sistema de documentos vehiculares
export interface VehicleData {
  id: string // código único
  placa: string
  tipoVehiculo: string
  marca: string
  modelo: string
  color: string
  año: string
  chasis: string
  fechaExpiracion: string
  fechaRegistro: string
}

export interface OCRResult {
  placa?: string
  tipoVehiculo?: string
  marca?: string
  modelo?: string
  color?: string
  año?: string
  chasis?: string
  fechaExpiracion?: string
}
