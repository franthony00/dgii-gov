"use server";

// 🔹 Obtener datos desde tu API real en Neon
export async function getVehicleData(codigo: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      console.error("❌ NEXT_PUBLIC_BASE_URL no está configurado");
      return null;
    }

    const res = await fetch(`${baseUrl}/api/vehiculo/get?c=${codigo}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("❌ No se encontró vehículo con ese código");
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("❌ ERROR consultando vehículo:", err);
    return null;
  }
}
