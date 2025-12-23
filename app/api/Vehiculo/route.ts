import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      placa,
      tipoVehiculo,
      marca,
      modelo,
      color,
      ano,
      chasis,
      fechaExpiracion,
    } = body;

    // Validación básica
    if (!placa || !marca || !modelo) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios: placa, marca o modelo." },
        { status: 400 }
      );
    }

    // Generar código único
    const codigo = randomUUID().slice(0, 8).toUpperCase();

    // Guardar en BD
    const query = `
      INSERT INTO vehiculos
      (placa, tipo_vehiculo, marca, modelo, color, ano, chasis, fecha_expiracion, codigo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING codigo;
    `;

    const values = [
      placa,
      tipoVehiculo,
      marca,
      modelo,
      color,
      ano,
      chasis,
      fechaExpiracion,
      codigo,
    ];

    const result = await db.query(query, values);

    return NextResponse.json(
      { message: "ok", codigo: result.rows[0].codigo },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("❌ ERROR EN INSERT:", error);

    return NextResponse.json(
      {
        error: "Error guardando en la base.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
