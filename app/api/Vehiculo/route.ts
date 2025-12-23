export const runtime = "nodejs";

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Generar código único para cada registro
async function generarCodigoUnico() {
  const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789"

  while (true) {
    let codigo = ""
    for (let i = 0; i < 7; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }

    // Verificar si existe ya en la DB
    const existent = await db.query(
      "SELECT codigo FROM vehiculos WHERE codigo = $1 LIMIT 1",
      [codigo]
    )

    if (existent.rows.length === 0) return codigo
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      placa,
      tipoVehiculo,
      marca,
      modelo,
      color,
      ano,
      chasis,
      fechaExpiracion,
    } = data

    // Generar código de 7 caracteres
    const codigo = await generarCodigoUnico()

    // Guardar JSON completo del documento
    const datos_json = JSON.stringify(data)

    // Insertar en PostgreSQL
    await db.query(
      `INSERT INTO vehiculos 
        (codigo, placa, tipo_vehiculo, marca, modelo, color, ano, chasis, fecha_expiracion, datos_json, fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())`,
      [
        codigo,
        placa,
        tipoVehiculo,
        marca,
        modelo,
        color,
        ano,
        chasis,
        fechaExpiracion,
        datos_json,
      ]
    )

    return NextResponse.json({
      status: "ok",
      codigo, // ← Se devuelve al frontend
    })
  } catch (error) {
    console.error("❌ ERROR EN DB:", error)
    return NextResponse.json(
      { error: "No se pudo guardar en la base de datos" },
      { status: 500 }
    )
  }
}
