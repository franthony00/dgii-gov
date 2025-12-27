import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

    const codigo = generateCode(); // ← nuevo formato

    await db.query(
      `
      INSERT INTO vehiculos 
      (placa, tipo_vehiculo, marca, modelo, color, ano, chasis, fecha_expiracion, codigo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

    return NextResponse.json({
      message: "Vehículo guardado correctamente",
      codigo,
    });
  } catch (error) {
    console.error("ERROR AL GUARDAR:", error);
    return NextResponse.json(
      { error: "Error guardando la información" },
      { status: 500 }
    );
  }
}
