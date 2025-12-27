import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Código no proporcionado" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `SELECT * FROM vehiculos WHERE codigo = $1 LIMIT 1`,
      [code]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "No existe vehículo con ese código" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0], // ESTE OBJETO LLEGA A ViewerContent
    });
  } catch (err) {
    console.error("ERROR EN GET VEHICULO:", err);
    return NextResponse.json(
      { success: false, error: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
