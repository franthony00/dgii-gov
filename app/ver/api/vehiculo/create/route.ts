import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // ✔️ SOLO UNA VEZ

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

    if (!placa || !marca || !modelo) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const codigo = randomUUID().slice(0, 8).toUpperCase();

    await db.query(
      `INSERT INTO vehiculos
      (placa, tipo_vehiculo, marca, modelo, color, ano, chasis, fecha_expiracion, codigo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        placa,
        tipoVehiculo,
        marca,
        modelo,
        color,
        ano,
        chasis,
        fechaExpiracion,
        codigo,
      ]
    );

    return NextResponse.json({ message: "ok", codigo }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error guardando en la base" },
      { status: 500 }
    );
  }
}
