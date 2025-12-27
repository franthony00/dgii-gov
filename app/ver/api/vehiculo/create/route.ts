import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

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
      fechaExpiracion
    } = body;

    const codigo = randomUUID().slice(0, 8).toUpperCase();

    await pool.query(
      `
      INSERT INTO vehiculos
      (placa, tipo_vehiculo, marca, modelo, color, ano, chasis, fecha_expiracion, codigo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        placa,
        tipoVehiculo,
        marca,
        modelo,
        color,
        ano,
        chasis,
        fechaExpiracion,
        codigo
      ]
    );

    return NextResponse.json(
      { message: "Vehículo guardado", codigo },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en API:", error);
    return NextResponse.json(
      { error: "Error guardando el vehículo" },
      { status: 500 }
    );
  }
}
