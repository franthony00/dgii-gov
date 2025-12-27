import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codigo = searchParams.get("codigo");

    if (!codigo) {
      return NextResponse.json(
        { error: "Código no proporcionado" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `SELECT * FROM vehiculos WHERE codigo = $1 LIMIT 1`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No existe un documento con este código" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("ERROR CONSULTANDO VEHÍCULO:", error);
    return NextResponse.json(
      { error: "Error consultando el vehículo" },
      { status: 500 }
    );
  }
}
