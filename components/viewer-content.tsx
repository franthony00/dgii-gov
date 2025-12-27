"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { VehicleData } from "@/lib/types"

export function ViewerContent() {
  const searchParams = useSearchParams()

  // 👉 AHORA SE LEE CORRECTAMENTE EL PARÁMETRO DEL QR
  const code = searchParams.get("codigo")

  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!code) {
        setLoading(false)
        return
      }

      // 👉 CONSULTA A LA BASE DE DATOS REAL
      const res = await fetch(`/api/vehiculo/get?codigo=${code}`)
      const json = await res.json()

      setVehicleData(json.data || null)
      setLoading(false)
    }

    fetchData()
  }, [code])
