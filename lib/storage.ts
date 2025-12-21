"use server"

import type { VehicleData } from "./types"

// Almacenamiento temporal en memoria (se perderá al reiniciar el servidor)
// En producción, reemplazar con Supabase, Firebase, MongoDB, etc.
const vehicleDatabase = new Map<string, VehicleData>()

// Generar código único aleatorio
export async function generateUniqueCode(): Promise<string> {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""

  do {
    code = ""
    for (let i = 0; i < 7; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
  } while (vehicleDatabase.has(code))

  return code
}

// Guardar datos del vehículo
export async function saveVehicleData(data: Omit<VehicleData, "id" | "fechaRegistro">): Promise<string> {
  const id = await generateUniqueCode()
  const fechaRegistro = new Date().toISOString()

  const vehicleData: VehicleData = {
    id,
    ...data,
    fechaRegistro,
  }

  vehicleDatabase.set(id, vehicleData)
  return id
}

// Obtener datos del vehículo por código
export async function getVehicleData(code: string): Promise<VehicleData | null> {
  const data = vehicleDatabase.get(code)
  return data || null
}

// Verificar si existe un código
export async function codeExists(code: string): Promise<boolean> {
  return vehicleDatabase.has(code)
}
